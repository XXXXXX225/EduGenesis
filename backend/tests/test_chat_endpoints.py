import sqlite3
import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from app.db import DB_PATH

client = TestClient(app)

TEST_CHAT_USER = "chat_endpoints_test_user"

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: ensure user doesn't exist
    cleanup_user(TEST_CHAT_USER)
    yield
    # Teardown: cleanup user
    cleanup_user(TEST_CHAT_USER)

def cleanup_user(username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_profiles WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_path_nodes WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_errors WHERE username = ?", (username,))
    cursor.execute("DELETE FROM system_logs WHERE username = ?", (username,))
    # Clean up chat sessions and messages
    cursor.execute("SELECT session_id FROM chat_sessions WHERE username = ?", (username,))
    session_ids = [r[0] for r in cursor.fetchall()]
    for session_id in session_ids:
        cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM chat_sessions WHERE username = ?", (username,))
    conn.commit()
    conn.close()

def get_auth_token():
    # Register new user
    reg_payload = {
        "username": TEST_CHAT_USER,
        "password": "securepassword123",
        "cognitive_style": "Practical Coding",
        "learning_goals": ["Python Basics"]
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 200
    res_data = response.json()
    return res_data["access_token"]

def test_chat_sessions_crud_and_message_autosave():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a session
    session_id = f"test-sess-{uuid.uuid4()}"
    create_payload = {
        "session_id": session_id,
        "title": "新对话"
    }
    response = client.post("/api/chat/sessions", json=create_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["session_id"] == session_id
    assert response.json()["title"] == "新对话"

    # 2. Get sessions list
    response = client.get("/api/chat/sessions", headers=headers)
    assert response.status_code == 200
    sessions = response.json()
    assert len(sessions) == 1
    assert sessions[0]["session_id"] == session_id
    assert sessions[0]["title"] == "新对话"

    # 3. Update session title
    update_payload = {"title": "Updated Session Title"}
    response = client.put(f"/api/chat/sessions/{session_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    response = client.get("/api/chat/sessions", headers=headers)
    assert response.json()[0]["title"] == "Updated Session Title"

    # 4. Trigger chat interaction (which falls back to simulator since no API Key is set)
    chat_payload = {
        "messages": [
            {"role": "user", "content": "Hello, explain Python variable naming"}
        ],
        "current_profile": None,
        "session_id": session_id,
        "tutor_personality": "Socratic"
    }
    # Read the streamed response
    with client.stream("POST", "/api/chat", json=chat_payload, headers=headers) as response:
        assert response.status_code == 200
        # Consume the stream to let the background database save finish
        lines = [(line if isinstance(line, str) else line.decode("utf-8")) for line in response.iter_lines() if line]
        assert len(lines) > 0
        # Check that we received "done" event
        assert any("done" in line for line in lines)

    # 5. Verify that both user and assistant messages were saved in the DB
    response = client.get(f"/api/chat/sessions/{session_id}/messages", headers=headers)
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "Hello, explain Python variable naming"
    assert messages[1]["role"] == "assistant"
    assert "个性化 AI 助教" in messages[1]["content"] or "Python" in messages[1]["content"]

    # 6. Delete the session
    response = client.delete(f"/api/chat/sessions/{session_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify session is deleted
    response = client.get("/api/chat/sessions", headers=headers)
    assert len(response.json()) == 0

    # Verify messages are deleted
    response = client.get(f"/api/chat/sessions/{session_id}/messages", headers=headers)
    assert len(response.json()) == 0
