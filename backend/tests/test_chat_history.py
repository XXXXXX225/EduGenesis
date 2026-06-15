import pytest
from app.db import (
    init_db,
    db_create_chat_session,
    db_get_chat_sessions,
    db_update_chat_session_title,
    db_delete_chat_session,
    db_clear_chat_sessions,
    db_save_chat_message,
    db_get_chat_messages
)

def test_chat_history_operations():
    init_db()
    db_clear_chat_sessions("test_user_history")
    
    db_create_chat_session("test_user_history", "test-session-id-1", "Test Title 1")
    sessions = db_get_chat_sessions("test_user_history")
    assert len(sessions) == 1
    assert sessions[0]["title"] == "Test Title 1"

    db_update_chat_session_title("test-session-id-1", "Updated Title 1")
    sessions = db_get_chat_sessions("test_user_history")
    assert sessions[0]["title"] == "Updated Title 1"

    db_save_chat_message("test-session-id-1", "m1", "user", "Hello tutor")
    db_save_chat_message("test-session-id-1", "m2", "assistant", "Hello student")
    messages = db_get_chat_messages("test-session-id-1")
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["content"] == "Hello student"

    db_delete_chat_session("test-session-id-1")
    sessions = db_get_chat_sessions("test_user_history")
    assert len(sessions) == 0
    messages = db_get_chat_messages("test-session-id-1")
    assert len(messages) == 0
