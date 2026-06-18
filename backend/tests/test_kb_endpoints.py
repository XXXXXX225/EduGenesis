import os
import shutil
import pytest
from fastapi.testclient import TestClient
from main import app
from app.knowledge_base import COURSES_DIR

client = TestClient(app)

def test_get_courses_default():
    # GET /api/kb/courses (verifying default courses are returned)
    response = client.get("/api/kb/courses")
    assert response.status_code == 200
    courses = response.json()
    assert isinstance(courses, list)
    
    # Verify default courses exist
    course_ids = [c["course_id"] for c in courses]
    assert "python_basics" in course_ids
    assert "machine_learning" in course_ids

def test_register_and_delete_course_flow():
    # POST /api/kb/courses (verifying valid registration of a course, e.g. 'test_course', with 8 nodes)
    course_id = "test_course"
    nodes = [
        {
            "id": f"node{i}",
            "title": f"Test Node {i}",
            "status": "locked",
            "description": f"Description for test node {i}",
            "resources": ["pdf", "code"]
        }
        for i in range(1, 9)
    ]
    
    register_payload = {
        "course_id": course_id,
        "display_name": "Test Course Display Name",
        "keywords": ["test", "course", "api"],
        "description": "This is a test course for API verification",
        "nodes": nodes
    }
    
    # Ensure physical directory does not exist or clean it up before test
    physical_dir = os.path.join(COURSES_DIR, course_id)
    if os.path.exists(physical_dir):
        try:
            shutil.rmtree(physical_dir)
        except Exception:
            pass
        
    response = client.post("/api/kb/courses", json=register_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["course_id"] == course_id
    
    # Verify the physical directory is created
    assert os.path.isdir(physical_dir)
    
    # Verify the course is returned in GET /api/kb/courses
    response_get = client.get("/api/kb/courses")
    assert response_get.status_code == 200
    courses = response_get.json()
    course_ids = [c["course_id"] for c in courses]
    assert course_id in course_ids
    
    # Find the registered course and verify nodes count
    target_course = next(c for c in courses if c["course_id"] == course_id)
    assert len(target_course["nodes"]) == 8
    
    # DELETE /api/kb/courses/{course_id} (verifying deletion of the course)
    response_delete = client.delete(f"/api/kb/courses/{course_id}")
    assert response_delete.status_code == 200
    assert response_delete.json()["status"] == "success"
    
    # Verify physical directory is removed
    assert not os.path.exists(physical_dir)
    
    # Verify course is no longer returned
    response_get_post_delete = client.get("/api/kb/courses")
    course_ids_after = [c["course_id"] for c in response_get_post_delete.json()]
    assert course_id not in course_ids_after

def test_register_invalid_course_id():
    # POST /api/kb/courses with invalid course_id containing path traversal characters like ../ (should return 400 Bad Request)
    invalid_course_ids = ["../traversal", "course/id", "..\\win_traversal", "invalid-id", "invalid.id"]
    for cid in invalid_course_ids:
        register_payload = {
            "course_id": cid,
            "display_name": "Invalid Course",
            "keywords": ["invalid"],
            "description": "Invalid course description",
            "nodes": [
                {"id": f"node{i}", "title": f"Chapter {i}", "description": "Desc", "resources": ["pdf"]}
                for i in range(1, 9)
            ]
        }
        response = client.post("/api/kb/courses", json=register_payload)
        assert response.status_code == 400

def test_register_course_invalid_nodes_count():
    # POST /api/kb/courses with course containing other than 8 nodes should return 400 Bad Request
    register_payload = {
        "course_id": "invalid_nodes_course",
        "display_name": "Invalid Nodes Course",
        "keywords": ["test"],
        "description": "This course has only 2 nodes, which is invalid.",
        "nodes": [
            {"id": "node1", "title": "Node 1", "description": "Desc"},
            {"id": "node2", "title": "Node 2", "description": "Desc"}
        ]
    }
    response = client.post("/api/kb/courses", json=register_payload)
    assert response.status_code == 400
    assert "Higher Education syllabi must contain exactly 8 chapters/nodes." in response.json()["detail"]

def test_delete_default_course_blocked():
    # DELETE /api/kb/courses/python_basics (should return 400 Bad Request to protect system defaults)
    response = client.delete("/api/kb/courses/python_basics")
    assert response.status_code == 400
    assert "Cannot delete default system courses" in response.json()["detail"]
    
    response = client.delete("/api/kb/courses/machine_learning")
    assert response.status_code == 400
    assert "Cannot delete default system courses" in response.json()["detail"]

def test_delete_invalid_course_id():
    # DELETE /api/kb/courses/{course_id} with invalid course_id formats (like hyphens, dots)
    invalid_ids = ["invalid-id", "invalid.id"]
    for cid in invalid_ids:
        response = client.delete(f"/api/kb/courses/{cid}")
        assert response.status_code == 400
        assert "Invalid course_id format" in response.json()["detail"]


TEST_KB_USER = "kb_endpoints_test_user"

def get_kb_test_auth_token():
    import sqlite3
    from app.db import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (TEST_KB_USER,))
    conn.commit()
    conn.close()

    reg_payload = {
        "username": TEST_KB_USER,
        "password": "securepassword123",
        "cognitive_style": "Practical Coding",
        "learning_goals": ["Python Basics"]
    }
    response = client.post("/api/auth/register", json=reg_payload)
    if response.status_code == 200:
        return response.json()["access_token"]
    
    login_payload = {
        "username": TEST_KB_USER,
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    return response.json()["access_token"]

def test_generate_syllabus_api(monkeypatch):
    token = get_kb_test_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    dummy_nodes = [
        {"id": f"node{i}", "title": f"Mock Node {i}", "description": "Mock description", "resources": ["pdf"]}
        for i in range(1, 9)
    ]
    monkeypatch.setattr("app.routes.kb.generate_course_syllabus", lambda course_name, description, username: dummy_nodes)
    
    payload = {
        "course_name": "Test Syllabus Course",
        "description": "An introductory course on testing and RAG."
    }
    response = client.post("/api/kb/courses/generate_syllabus", json=payload, headers=headers)
    assert response.status_code == 200
    res_data = response.json()
    assert "nodes" in res_data
    assert len(res_data["nodes"]) == 8
    assert res_data["nodes"][0]["title"] == "Mock Node 1"

def test_upload_file_traversal_and_parsing(monkeypatch):
    token = get_kb_test_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    course_id = "test_upload_course"
    nodes = [
        {
            "id": f"node{i}",
            "title": f"Test Node {i}",
            "status": "locked",
            "description": f"Description for test node {i}",
            "resources": ["pdf", "code"]
        }
        for i in range(1, 9)
    ]
    register_payload = {
        "course_id": course_id,
        "display_name": "Upload Test Course",
        "keywords": ["upload", "test"],
        "description": "This is a test course for file upload",
        "nodes": nodes
    }
    client.post("/api/kb/courses", json=register_payload)
    
    monkeypatch.setattr("app.routes.kb.generate_embedding", lambda text, username: [0.1] * 128)
    
    file_content = b"Python variables are used to store data values. A variable is created the moment you first assign a value to it."
    files = {"file": ("variables.txt", file_content, "text/plain")}
    
    response = client.post(
        f"/api/kb/courses/{course_id}/upload",
        files=files,
        headers=headers
    )
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["status"] == "success"
    assert res_json["chunks_count"] > 0
    
    import sqlite3
    from app.db import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, content, embedding FROM course_chunks WHERE course_id = ?", (course_id,))
    rows = cursor.fetchall()
    assert len(rows) > 0
    assert "variables.txt" in rows[0][0]
    import json
    emb = json.loads(rows[0][2])
    assert len(emb) == 128
    conn.close()
    
    client.delete(f"/api/kb/courses/{course_id}")

