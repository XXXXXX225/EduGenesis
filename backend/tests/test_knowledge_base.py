# -*- coding: utf-8 -*-
import pytest
from app.db import init_db
from app.knowledge_base import clean_subject_name, load_course_material

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()

def test_clean_subject_name():
    assert clean_subject_name("Python Basics") == "python_basics"
    assert clean_subject_name("Python") == "python_basics"
    assert clean_subject_name("Machine Learning") == "machine_learning"
    assert clean_subject_name("ML") == "machine_learning"
    # Chinese keyword support for ML
    assert clean_subject_name("\u7ebf\u6027\u4ee3\u6570") == "machine_learning"
    assert clean_subject_name("\u673a\u5668\u5b66\u4e60") == "machine_learning"
    assert clean_subject_name("\u68af\u5ea6\u4e0b\u964d") == "machine_learning"

def test_load_course_material_exists():
    # Verify we can load python node1 and ml node1 (English course content)
    py_node1 = load_course_material("Python Basics", "node1")
    assert "Python Environment" in py_node1 or "Python" in py_node1
    assert "VS Code" in py_node1

    ml_node1 = load_course_material("Machine Learning", "node1")
    assert "Linear Algebra" in ml_node1
    assert "vectors" in ml_node1.lower()

def test_load_course_material_case_insensitive():
    # Verify case-insensitive IDs work
    py_node1 = load_course_material("python", "Node1")
    assert "VS Code" in py_node1

def test_load_course_material_not_exists():
    # Non-existing node should return empty string
    res = load_course_material("Python Basics", "node999")
    assert res == ""

def test_dynamic_clean_subject_name():
    import sqlite3
    import json
    from app.db import DB_PATH
    
    # 1. Connect and insert test course
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Delete first in case of leftover from prior aborted runs
    cursor.execute("DELETE FROM registered_courses WHERE course_id = 'data_structures'")
    cursor.execute(
        "INSERT INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
        ("data_structures", "\u6570\u636e\u7ed3\u6784\u4e0e\u7b97\u6cd5", json.dumps(["\u6570\u636e\u7ed3\u6784", "\u4e8c\u53c9\u6811", "\u56fe", "\u7b97\u6cd5"], ensure_ascii=False), "\u6570\u636e\u7ed3\u6784\u4e0e\u7b97\u6cd5\u57fa\u784d", "[]")
    )
    conn.commit()
    conn.close()
    
    try:
        # 2. Assert correct clean_subject_name behaviors
        assert clean_subject_name("\u6570\u636e\u7ed3\u6784") == "data_structures"
        assert clean_subject_name("\u4e8c\u53c9\u6811\u548c\u56fe") == "data_structures"
        assert clean_subject_name("\u7b97\u6cd5\u5bfc\u8b6a") == "data_structures"
        # Exact match tests
        assert clean_subject_name("\u6570\u636e\u7ed3\u6784\u4e0e\u7b97\u6cd5") == "data_structures"
        assert clean_subject_name("data_structures") == "data_structures"
    finally:
        # 3. Clean up the test course
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM registered_courses WHERE course_id = 'data_structures'")
        conn.commit()
        conn.close()


