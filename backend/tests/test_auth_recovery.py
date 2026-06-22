import sqlite3
import pytest
import pyotp
from fastapi.testclient import TestClient
from main import app
from app.db import DB_PATH
from tests.test_auth import cleanup_user

client = TestClient(app)

TEST_USER = "recovery_test_user"
TEST_PWD = "testpassword123"

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup
    cleanup_user(TEST_USER)
    # Register test user
    reg_payload = {
        "username": TEST_USER,
        "password": TEST_PWD,
        "cognitive_style": "Practical Coding",
        "learning_goals": ["Python Basics"]
    }
    client.post("/api/auth/register", json=reg_payload)
    yield
    # Teardown
    cleanup_user(TEST_USER)

def get_auth_headers():
    response = client.post("/api/auth/login", json={
        "username": TEST_USER,
        "password": TEST_PWD
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_totp_setup_and_bind_flow():
    headers = get_auth_headers()
    
    # 1. Setup TOTP
    response = client.get("/api/auth/totp/setup", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "secret" in data
    assert "qr_code_data_url" in data
    assert data["qr_code_data_url"].startswith("data:image/png;base64,")
    
    secret = data["secret"]
    
    # 2. Bind with invalid code
    bind_response = client.post("/api/auth/totp/bind", json={
        "secret": secret,
        "code": "000000"
    }, headers=headers)
    assert bind_response.status_code == 400
    
    # 3. Bind with valid code (using pyotp)
    totp = pyotp.TOTP(secret)
    valid_code = totp.now()
    
    bind_response = client.post("/api/auth/totp/bind", json={
        "secret": secret,
        "code": valid_code
    }, headers=headers)
    assert bind_response.status_code == 200
    bind_data = bind_response.json()
    assert "recovery_code" in bind_data
    assert bind_data["recovery_code"].startswith("GENESIS-")
    
    # 4. Check status (public API)
    status_response = client.post("/api/auth/forgot-password/status", json={
        "username": TEST_USER
    })
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["has_totp"] is True
    
    # 5. Verify TOTP via forgot-password verify API
    # Verify with wrong OTP
    verify_response = client.post("/api/auth/forgot-password/verify-totp", json={
        "username": TEST_USER,
        "code": "111111"
    })
    assert verify_response.status_code == 400
    
    # Verify with correct OTP
    correct_otp = totp.now()
    verify_response = client.post("/api/auth/forgot-password/verify-totp", json={
        "username": TEST_USER,
        "code": correct_otp
    })
    assert verify_response.status_code == 200
    verify_data = verify_response.json()
    assert "reset_token" in verify_data
    
    # 6. Unbind TOTP
    unbind_response = client.post("/api/auth/totp/unbind", headers=headers)
    assert unbind_response.status_code == 200
    
    # Check status again
    status_response = client.post("/api/auth/forgot-password/status", json={
        "username": TEST_USER
    })
    assert status_response.json()["has_totp"] is False

def test_security_questions_flow():
    headers = get_auth_headers()
    
    # 1. Set security questions
    questions_payload = {
        "questions": [
            {"question": "What is your pet name?", "answer": "Buddy"},
            {"question": "Favorite language?", "answer": "Python"}
        ]
    }
    set_response = client.post("/api/auth/security-questions", json=questions_payload, headers=headers)
    assert set_response.status_code == 200
    
    # 2. Get questions (headers protected)
    get_response = client.get("/api/auth/security-questions", headers=headers)
    assert get_response.status_code == 200
    questions_list = get_response.json()
    assert len(questions_list) == 2
    assert "Favorite language?" in questions_list
    
    # 3. Check status (public API)
    status_response = client.post("/api/auth/forgot-password/status", json={
        "username": TEST_USER
    })
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["has_questions"] is True
    assert len(status_data["questions"]) == 2
    
    # 4. Verify questions with wrong answer
    verify_response = client.post("/api/auth/forgot-password/verify-questions", json={
        "username": TEST_USER,
        "answers": [
            {"question": "What is your pet name?", "answer": "WrongBuddy"},
            {"question": "Favorite language?", "answer": "Python"}
        ]
    })
    assert verify_response.status_code == 400
    
    # Verify with correct answers (ignoring whitespace and case)
    verify_response = client.post("/api/auth/forgot-password/verify-questions", json={
        "username": TEST_USER,
        "answers": [
            {"question": "What is your pet name?", "answer": "  buddy  "},
            {"question": "Favorite language?", "answer": "python"}
        ]
    })
    assert verify_response.status_code == 200
    verify_data = verify_response.json()
    assert "reset_token" in verify_data
    
    reset_token = verify_data["reset_token"]
    
    # 5. Reset password
    # Try with invalid password length
    reset_response = client.post("/api/auth/forgot-password/reset", json={
        "reset_token": reset_token,
        "new_password": "short"
    })
    assert reset_response.status_code == 400
    
    # Reset successfully
    reset_response = client.post("/api/auth/forgot-password/reset", json={
        "reset_token": reset_token,
        "new_password": "newpassword999"
    })
    assert reset_response.status_code == 200
    
    # Try to reuse the token
    reuse_response = client.post("/api/auth/forgot-password/reset", json={
        "reset_token": reset_token,
        "new_password": "anotherpassword123"
    })
    assert reuse_response.status_code == 400
    
    # Try to login with new password
    login_response = client.post("/api/auth/login", json={
        "username": TEST_USER,
        "password": "newpassword999"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()
