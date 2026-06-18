import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from main import app
from app.ai.platform import generate_embedding_vector, probe_provider_connection
from app.auth_utils import create_access_token


client = TestClient(app)


def auth_headers(username: str = "default_user") -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(username)}"}


@patch("app.ai.platform.requests.post")
def test_generate_embedding_vector_falls_back_to_local_hash(mock_post):
    mock_post.side_effect = RuntimeError("embedding endpoint unavailable")

    embedding = generate_embedding_vector("Python 变量 与 函数", "default_user")

    assert isinstance(embedding, list)
    assert len(embedding) == 128
    assert any(value != 0 for value in embedding)


@patch("app.ai.platform.requests.post")
def test_probe_provider_connection_success(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_post.return_value = mock_response

    success, message = probe_provider_connection("https://example.com/v1", "secret", "generalv3.5")

    assert success is True
    assert "成功" in message


def test_settings_provider_connection_uses_ai_platform_probe():
    with patch("app.routes.settings.probe_provider_connection", return_value=(True, "连接测试成功！")) as mock_probe:
        response = client.post(
            "/api/settings/providers/xunfei/test",
            headers=auth_headers(),
        )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "成功" in response.json()["message"]
    mock_probe.assert_called_once()


from app.ai.scenes import optimize_rag_query

def test_optimize_rag_query_no_history():
    messages = [{"role": "user", "content": "Explain Python lists"}]
    res = optimize_rag_query(messages, "default_user")
    assert res == "Explain Python lists"


@patch("app.ai.scenes.request_text_completion")
def test_optimize_rag_query_with_history(mock_completion):
    mock_completion.return_value = "Python list index out of range exception handling"
    messages = [
        {"role": "user", "content": "I am getting list index out of range error"},
        {"role": "assistant", "content": "That means your index is out of bounds."},
        {"role": "user", "content": "Why does it fail?"}
    ]
    res = optimize_rag_query(messages, "default_user")
    assert res == "Python list index out of range exception handling"
    mock_completion.assert_called_once()

