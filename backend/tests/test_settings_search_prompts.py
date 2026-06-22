import sqlite3
import pytest
from fastapi.testclient import TestClient
from main import app
from app.db import DB_PATH

client = TestClient(app)

TEST_SETTINGS_USER = "settings_test_user"

@pytest.fixture(autouse=True)
def run_around_tests():
    cleanup_user(TEST_SETTINGS_USER)
    yield
    cleanup_user(TEST_SETTINGS_USER)

def cleanup_user(username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_profiles WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_search_settings WHERE username = ?", (username,))
    cursor.execute("DELETE FROM user_prompt_templates WHERE username = ?", (username,))
    cursor.execute("DELETE FROM system_logs WHERE username = ?", (username,))
    conn.commit()
    conn.close()

def get_auth_token():
    reg_payload = {
        "username": TEST_SETTINGS_USER,
        "password": "securepassword123",
        "cognitive_style": "Practical Coding",
        "learning_goals": ["Python Basics"]
    }
    response = client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 200
    res_data = response.json()
    return res_data["access_token"]

def test_search_settings_api():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get default search settings
    response = client.get("/api/settings/search", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["search_enabled"] is False
    assert data["search_provider"] == "duckduckgo"
    assert data["api_key"] == ""
    assert data["max_results"] == 3

    # 2. Save new search settings
    save_payload = {
        "search_enabled": True,
        "search_provider": "tavily",
        "api_key": "secret-tavily-key-123",
        "max_results": 4
    }
    response = client.post("/api/settings/search", json=save_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # 3. Verify settings are saved and api_key is masked
    response = client.get("/api/settings/search", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["search_enabled"] is True
    assert data["search_provider"] == "tavily"
    assert data["api_key"] == "••••••••"
    assert data["max_results"] == 4

    # 4. Save with masked API key (keeps existing key)
    save_masked_payload = {
        "search_enabled": True,
        "search_provider": "tavily",
        "api_key": "••••••••",
        "max_results": 5
    }
    response = client.post("/api/settings/search", json=save_masked_payload, headers=headers)
    assert response.status_code == 200
    
    # 5. Check key did not change but max_results updated
    response = client.get("/api/settings/search", headers=headers)
    data = response.json()
    assert data["max_results"] == 5

    # 6. Save with null api_key (should succeed and coerce to "")
    save_null_payload = {
        "search_enabled": True,
        "search_provider": "duckduckgo",
        "api_key": None,
        "max_results": 3
    }
    response = client.post("/api/settings/search", json=save_null_payload, headers=headers)
    assert response.status_code == 200

    response = client.get("/api/settings/search", headers=headers)
    assert response.json()["api_key"] == ""

    # 7. Save with omitted api_key (should succeed and default to "")
    save_omitted_payload = {
        "search_enabled": True,
        "search_provider": "duckduckgo",
        "max_results": 3
    }
    response = client.post("/api/settings/search", json=save_omitted_payload, headers=headers)
    assert response.status_code == 200

    response = client.get("/api/settings/search", headers=headers)
    assert response.json()["api_key"] == ""

def test_prompt_templates_api():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get templates (should include the 4 default seeded ones)
    response = client.get("/api/settings/prompt-templates", headers=headers)
    assert response.status_code == 200
    templates = response.json()
    assert len(templates) == 4
    active_template = next((t for t in templates if t["is_active"]), None)
    assert active_template is not None
    assert active_template["template_id"] == "academic"

    # 2. Add custom template
    custom_payload = {
        "template_id": "custom_python_tutor",
        "template_name": "我的Python私教",
        "system_prompt": "你是一个幽默风趣的Python特级教师，喜欢用冷笑话来解释基础语法知识。",
        "is_active": False
      }
    response = client.post("/api/settings/prompt-templates", json=custom_payload, headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify custom template was added
    response = client.get("/api/settings/prompt-templates", headers=headers)
    templates = response.json()
    assert len(templates) == 5
    custom_t = next((t for t in templates if t["template_id"] == "custom_python_tutor"), None)
    assert custom_t is not None
    assert custom_t["template_name"] == "我的Python私教"
    assert custom_t["is_active"] is False

    # 3. Activate custom template
    response = client.put("/api/settings/prompt-templates/custom_python_tutor/active", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify custom template is now active and academic is inactive
    response = client.get("/api/settings/prompt-templates", headers=headers)
    templates = response.json()
    custom_t = next((t for t in templates if t["template_id"] == "custom_python_tutor"), None)
    academic_t = next((t for t in templates if t["template_id"] == "academic"), None)
    assert custom_t["is_active"] is True
    assert academic_t["is_active"] is False

    # 4. Try to delete active custom template (which is allowed, but let's check)
    # Wait, can we delete system default?
    response = client.delete("/api/settings/prompt-templates/academic", headers=headers)
    assert response.status_code == 400  # Should fail

    # Delete custom template
    response = client.delete("/api/settings/prompt-templates/custom_python_tutor", headers=headers)
    assert response.status_code == 200
    
    # Check it is deleted
    response = client.get("/api/settings/prompt-templates", headers=headers)
    templates = response.json()
    assert len(templates) == 4
