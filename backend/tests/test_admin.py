import sqlite3
import pytest
from fastapi.testclient import TestClient
from main import app
from app.db import DB_PATH

client = TestClient(app)

def test_admin_endpoints():
    # 1. Login as default user and attempt to access admin endpoints (should get 403 Forbidden)
    login_user_payload = {
        "username": "default_user",
        "password": "default_password"
    }
    login_user_res = client.post("/api/auth/login", json=login_user_payload)
    assert login_user_res.status_code == 200
    user_token = login_user_res.json()["access_token"]
    
    headers_user = {"Authorization": f"Bearer {user_token}"}
    res_stats_user = client.get("/api/admin/stats", headers=headers_user)
    assert res_stats_user.status_code == 403
    assert "权限不足" in res_stats_user.json()["detail"]
    
    # 2. Login as admin and access admin endpoints (should get 200 OK)
    login_admin_payload = {
        "username": "admin",
        "password": "admin123"
    }
    login_admin_res = client.post("/api/auth/login", json=login_admin_payload)
    assert login_admin_res.status_code == 200
    admin_token = login_admin_res.json()["access_token"]
    
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    res_stats_admin = client.get("/api/admin/stats", headers=headers_admin)
    assert res_stats_admin.status_code == 200
    stats = res_stats_admin.json()
    assert "total_users" in stats
    assert "total_sessions" in stats
    assert "cognitive_distribution" in stats
    
    res_users_admin = client.get("/api/admin/users", headers=headers_admin)
    assert res_users_admin.status_code == 200
    users = res_users_admin.json()
    assert len(users) > 0
    
    # Check that admin user exists in list and has role 'admin'
    admin_found = False
    for u in users:
        if u["username"] == "admin":
            admin_found = True
            assert u["role"] == "admin"
    assert admin_found
    
    res_logs_admin = client.get("/api/admin/logs", headers=headers_admin)
    assert res_logs_admin.status_code == 200
    logs = res_logs_admin.json()
    assert isinstance(logs, list)

    # 3. Request without token (should get 401 Unauthorized)
    res_no_token = client.get("/api/admin/stats")
    assert res_no_token.status_code == 401

    # 4. User CRUD Operations (as Admin)
    # A. Create a user
    create_payload = {
        "username": "test_student_xyz",
        "password": "student_password_123",
        "role": "user",
        "cognitive_style": "Practical Coding",
        "learning_goals": ["Python Basics"]
    }
    res_create = client.post("/api/admin/users/create", json=create_payload, headers=headers_admin)
    assert res_create.status_code == 200
    assert "成功" in res_create.json()["detail"]
    
    # Verify the new user can log in
    res_new_login = client.post("/api/auth/login", json={"username": "test_student_xyz", "password": "student_password_123"})
    assert res_new_login.status_code == 200
    assert res_new_login.json()["role"] == "user"
    
    # B. Change User Role
    role_payload = {
        "username": "test_student_xyz",
        "role": "admin"
    }
    res_role = client.post("/api/admin/users/role", json=role_payload, headers=headers_admin)
    assert res_role.status_code == 200
    
    # Verify new user role is indeed admin
    res_new_login_admin = client.post("/api/auth/login", json={"username": "test_student_xyz", "password": "student_password_123"})
    assert res_new_login_admin.status_code == 200
    assert res_new_login_admin.json()["role"] == "admin"
    
    # C. Update User Password
    pwd_payload = {
        "username": "test_student_xyz",
        "password": "new_student_password_999"
    }
    res_pwd = client.post("/api/admin/users/password", json=pwd_payload, headers=headers_admin)
    assert res_pwd.status_code == 200
    
    # Verify new password login
    res_new_login_new_pwd = client.post("/api/auth/login", json={"username": "test_student_xyz", "password": "new_student_password_999"})
    assert res_new_login_new_pwd.status_code == 200
    
    # D. Safety checks: admin cannot delete self
    res_delete_self = client.delete("/api/admin/users/admin", headers=headers_admin)
    assert res_delete_self.status_code == 400
    
    # E. Delete User
    res_delete = client.delete("/api/admin/users/test_student_xyz", headers=headers_admin)
    assert res_delete.status_code == 200
    assert "彻底" in res_delete.json()["detail"]
    
    # Verify deleted user cannot log in
    res_login_deleted = client.post("/api/auth/login", json={"username": "test_student_xyz", "password": "new_student_password_999"})
    assert res_login_deleted.status_code == 401
    
    # F. Perm checks for ordinary user on CRUD ops (should get 403)
    res_create_user_by_user = client.post("/api/admin/users/create", json=create_payload, headers=headers_user)
    assert res_create_user_by_user.status_code == 403
