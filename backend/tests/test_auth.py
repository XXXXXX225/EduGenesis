import sqlite3
import pytest
from fastapi.testclient import TestClient
from main import app
from app.db import DB_PATH

client = TestClient(app)

TEST_AUTH_USER = "auth_test_user_temp"

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: ensure user doesn't exist
    cleanup_user(TEST_AUTH_USER)
    yield
    # Teardown: cleanup user
    cleanup_user(TEST_AUTH_USER)

def cleanup_user(username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_profiles WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_path_nodes WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_errors WHERE username = ?", (username,))
    cursor.execute("DELETE FROM system_logs WHERE username = ?", (username,))
    conn.commit()
    conn.close()

def test_register_and_login_flow():
    # 1. Register new user
    reg_payload = {
        "username": TEST_AUTH_USER,
        "password": "securepassword123",
        "cognitive_style": "Practical Coding",
        "learning_goals": ["Python Basics"]
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["username"] == TEST_AUTH_USER
    assert "access_token" in res_data
    token = res_data["access_token"]

    # Try duplicate registration
    dup_response = client.post("/api/auth/register", json=reg_payload)
    assert dup_response.status_code == 400
    assert "该用户名已被占用" in dup_response.json()["detail"]

    # 2. Login with correct password
    login_payload = {
        "username": TEST_AUTH_USER,
        "password": "securepassword123"
    }
    login_response = client.post("/api/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["status"] == "success"
    assert "access_token" in login_data

    # Login with wrong password
    bad_login_payload = {
        "username": TEST_AUTH_USER,
        "password": "wrongpassword"
    }
    bad_login_response = client.post("/api/auth/login", json=bad_login_payload)
    assert bad_login_response.status_code == 401
    assert "密码错误" in bad_login_response.json()["detail"]

    # Login with non-existing user
    non_exist_payload = {
        "username": "does_not_exist_user_123",
        "password": "some_password"
    }
    non_exist_response = client.post("/api/auth/login", json=non_exist_payload)
    assert non_exist_response.status_code == 401
    assert "用户名不存在" in non_exist_response.json()["detail"]
