# -*- coding: utf-8 -*-
import os
import json
import sqlite3
import shutil
import pytest
from app.db import DB_PATH, init_db
from app.knowledge_base import COURSES_DIR, rag_search
from app.course_synthesizer import generate_course_materials

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()

def test_course_generation_and_indexing_flow():
    course_id = "physics_test"
    display_name = "大学物理基础"
    description = "探究经典力学与电磁学的基本原理"
    
    # 1. Define 8 syllabus nodes
    nodes = [
        {"id": f"node{i}", "title": f"物理章节 {i}", "description": f"物理第 {i} 章详细描述", "resources": ["pdf"]}
        for i in range(1, 9)
    ]
    
    # 2. Register the course directly in the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Clean up leftover test data if any
    cursor.execute("DELETE FROM registered_courses WHERE course_id = ?", (course_id,))
    cursor.execute("DELETE FROM course_chunks WHERE course_id = ?", (course_id,))
    
    cursor.execute(
        "INSERT INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
        (course_id, display_name, json.dumps(["physics", "mechanics"], ensure_ascii=False), description, json.dumps(nodes, ensure_ascii=False))
    )
    conn.commit()
    conn.close()

    # Clean up physical directory if it exists
    physical_dir = os.path.join(COURSES_DIR, course_id)
    if os.path.exists(physical_dir):
        shutil.rmtree(physical_dir)

    try:
        # 3. Call generate_course_materials synchronously
        success = generate_course_materials(course_id, username="test_user")
        assert success is True

        # 4. Assert physical files exist and are populated
        assert os.path.isdir(physical_dir)
        for i in range(1, 9):
            file_path = os.path.join(physical_dir, f"node{i}.md")
            assert os.path.isfile(file_path)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            assert f"物理章节 {i}" in content or "概述" in content
            
        # 5. Assert RAG chunks are created in the database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM course_chunks WHERE course_id = ?", (course_id,))
        chunk_count = cursor.fetchone()[0]
        conn.close()
        assert chunk_count > 0
        
        # 6. Verify that we can query RAG search
        results = rag_search("力学", course_id, top_k=2)
        assert isinstance(results, list)
        
    finally:
        # 7. Clean up all generated data
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM registered_courses WHERE course_id = ?", (course_id,))
        cursor.execute("DELETE FROM course_chunks WHERE course_id = ?", (course_id,))
        conn.commit()
        conn.close()
        
        if os.path.exists(physical_dir):
            shutil.rmtree(physical_dir)
