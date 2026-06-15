# -*- coding: utf-8 -*-
from app.knowledge_base import clean_subject_name, load_course_material

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
