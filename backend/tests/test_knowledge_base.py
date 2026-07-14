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


def test_semantic_similarity_search():
    from app.knowledge_base import rag_search, seed_default_course_chunks
    
    # Run seeding to make sure we have default course chunks seeded
    seed_default_course_chunks()
    
    # Query something about variables in Python
    results = rag_search("how do we define variables in Python", "python_basics", top_k=3)
    assert len(results) > 0
    assert "content" in results[0]
    assert "title" in results[0]
    assert "node_id" in results[0]
    assert results[0]["score"] >= 0.0

def test_load_course_material_path_traversal():
    # Attempting to load files outside the course directory should return empty string (blocked)
    res1 = load_course_material("Python Basics", "../../../etc/passwd")
    assert res1 == ""
    
    res2 = load_course_material("Python Basics", "..\\..\\..\\windows\\system32")
    assert res2 == ""

def test_generate_mindmap_from_markdown():
    from app.db import generate_mindmap_from_markdown
    md = """# Title
Some text
## Chapter 1: Basic
Intro text
### Chapter 1.1: Installation
Details
## Chapter 2: Coding
Text
### Chapter 2.1: Types
More details
"""
    mindmap = generate_mindmap_from_markdown(md, "Main Topic")
    assert "graph TD" in mindmap
    assert "Root[\"Main Topic\"]" in mindmap
    assert "H2_0[\"Chapter 1: Basic\"]" in mindmap
    assert "H3_0[\"Chapter 1.1: Installation\"]" in mindmap
    assert "H2_1[\"Chapter 2: Coding\"]" in mindmap
    assert "H3_1[\"Chapter 2.1: Types\"]" in mindmap
    assert "Root --> H2_0" in mindmap
    assert "H2_0 --> H3_0" in mindmap
    assert "Root --> H2_1" in mindmap
    assert "H2_1 --> H3_1" in mindmap


