# -*- coding: utf-8 -*-
from app.knowledge_base import clean_subject_name, load_course_material

def test_clean_subject_name():
    assert clean_subject_name("Python Basics") == "python_basics"
    assert clean_subject_name("Python") == "python_basics"
    assert clean_subject_name("Machine Learning") == "machine_learning"
    assert clean_subject_name("ML") == "machine_learning"
    assert clean_subject_name("线性代数") == "machine_learning"

def test_load_course_material_exists():
    # Verify we can load python node1 and ml node1
    py_node1 = load_course_material("Python Basics", "node1")
    assert "Python 环境部署" in py_node1
    assert "VS Code" in py_node1

    ml_node1 = load_course_material("Machine Learning", "node1")
    assert "线性代数" in ml_node1
    assert "向量" in ml_node1

def test_load_course_material_case_insensitive():
    # Verify case-insensitive IDs work
    py_node1 = load_course_material("python", "Node1")
    assert "Python 环境部署" in py_node1

def test_load_course_material_not_exists():
    # Non-existing node should return empty string
    res = load_course_material("Python Basics", "node999")
    assert res == ""
