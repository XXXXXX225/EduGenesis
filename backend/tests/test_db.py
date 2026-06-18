import os
import sqlite3
import pytest
from app.models import UserProfile, PathNode
from app.db import (
    DB_PATH,
    init_db,
    db_save_profile,
    db_get_profile,
    db_get_path_nodes,
    db_save_path_nodes,
    db_sync_path_nodes_by_goals,
    db_log_agent_action,
    seed_errors_and_logs_for_user
)

TEST_USER = "test_verification_user_temp"

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Make sure DB is initialized
    init_db()
    
    # Cleanup before
    cleanup_user(TEST_USER)
    
    yield
    
    # Cleanup after
    cleanup_user(TEST_USER)

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

def test_db_profile_crud():
    # Create profile
    profile = UserProfile(
        knowledge_base=50,
        learning_pace=60,
        cognitive_style="Practical Coding",
        error_patterns=["Syntax Errors"],
        learning_goals=["Python Basics"],
        engagement=90
    )
    
    # Save profile
    db_save_profile(TEST_USER, profile)
    
    # Retrieve profile
    retrieved = db_get_profile(TEST_USER)
    
    assert retrieved.knowledge_base == 50
    assert retrieved.learning_pace == 60
    assert retrieved.cognitive_style == "Practical Coding"
    assert "Syntax Errors" in retrieved.error_patterns
    assert "Python Basics" in retrieved.learning_goals
    assert retrieved.engagement == 90

def test_db_path_nodes():
    # Sync path nodes by goals
    db_sync_path_nodes_by_goals(TEST_USER, ["Python Basics"])
    
    nodes = db_get_path_nodes(TEST_USER)
    assert len(nodes) > 0
    assert nodes[0].id == "node1"
    
    # Save modification
    nodes[0].status = "completed"
    db_save_path_nodes(TEST_USER, nodes)
    
    updated_nodes = db_get_path_nodes(TEST_USER)
    assert updated_nodes[0].status == "completed"

def test_db_logging_and_seeding():
    # Log agent action
    db_log_agent_action(TEST_USER, "主管智能体", "测试系统消息", "info")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT sender, message FROM system_logs WHERE username = ?", (TEST_USER,))
    logs = cursor.fetchall()
    conn.close()
    
    assert len(logs) == 1
    assert logs[0][0] == "主管智能体"
    assert logs[0][1] == "测试系统消息"
    
    # Seed errors and logs
    seed_errors_and_logs_for_user(TEST_USER)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM user_errors WHERE username = ?", (TEST_USER,))
    count = cursor.fetchone()[0]
    conn.close()
    
    assert count > 0

def test_registered_courses_seeding():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM registered_courses")
    count = cursor.fetchone()[0]
    assert count >= 2  # python_basics and machine_learning should be seeded
    
    cursor.execute("SELECT display_name FROM registered_courses WHERE course_id = 'python_basics'")
    display_name = cursor.fetchone()[0]
    assert "Python" in display_name
    conn.close()


def test_db_idempotency():
    # 1. Test init_db idempotency by calling it multiple times
    init_db()
    init_db()
    
    # 2. Test seed_errors_and_logs_for_user idempotency
    seed_errors_and_logs_for_user(TEST_USER)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM user_errors WHERE username = ?", (TEST_USER,))
    count_before = cursor.fetchone()[0]
    conn.close()
    
    # Run seeding again
    seed_errors_and_logs_for_user(TEST_USER)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM user_errors WHERE username = ?", (TEST_USER,))
    count_after = cursor.fetchone()[0]
    conn.close()
    
    # Check that count hasn't changed (idempotence)
    assert count_before == count_after


def test_db_course_switch_clears_resources():
    # 1. Start with Python Basics
    db_sync_path_nodes_by_goals(TEST_USER, ["Python 编程基础"])
    
    # 2. Insert dummy resources for TEST_USER
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO user_resources (username, node_id, resource_type, content) VALUES (?, 'node1', 'concept_map', 'dummy_content')",
        (TEST_USER,)
    )
    conn.commit()
    
    # Verify they were inserted
    cursor.execute("SELECT COUNT(*) FROM user_resources WHERE username = ?", (TEST_USER,))
    assert cursor.fetchone()[0] == 1
    conn.close()
    
    # 3. Switch to Machine Learning (which has a different set of nodes/titles, triggering sync)
    db_sync_path_nodes_by_goals(TEST_USER, ["机器学习与深度学习"])
    
    # 4. Verify resources are cleared
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM user_resources WHERE username = ?", (TEST_USER,))
    count = cursor.fetchone()[0]
    conn.close()
    
    assert count == 0

