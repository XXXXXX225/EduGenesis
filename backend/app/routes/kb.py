import os
import re
import json
import sqlite3
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.models import PathNode
from app.db import DB_PATH
from app.knowledge_base import COURSES_DIR

router = APIRouter()

class CourseInput(BaseModel):
    course_id: str
    display_name: str
    keywords: List[str] = Field(default_factory=list)
    description: str
    nodes: List[PathNode] = Field(default_factory=list)

@router.get("/courses")
def get_courses():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT course_id, display_name, keywords, description, nodes FROM registered_courses")
        rows = cursor.fetchall()
        conn.close()
    except Exception as e:
        # Prevent exposing database/SQL errors to users
        raise HTTPException(status_code=500, detail="Database error occurred")
        
    courses = []
    for row in rows:
        try:
            keywords_parsed = json.loads(row[2])
        except Exception:
            keywords_parsed = []
        try:
            nodes_parsed = json.loads(row[4])
        except Exception:
            nodes_parsed = []
            
        courses.append({
            "course_id": row[0],
            "display_name": row[1],
            "keywords": keywords_parsed,
            "description": row[3],
            "nodes": nodes_parsed
        })
    return courses

@router.post("/courses")
def register_course(course: CourseInput):
    # Validate course_id matches ^[a-zA-Z0-9_]+$ to prevent directory traversal
    if not re.match(r"^[a-zA-Z0-9_]+$", course.course_id):
        raise HTTPException(status_code=400, detail="Invalid course_id. Must match ^[a-zA-Z0-9_]+$")
    
    if len(course.nodes) != 8:
        raise HTTPException(status_code=400, detail="Higher Education syllabi must contain exactly 8 chapters/nodes.")
    
    # Ensure physical directory backend/courses/<course_id> is created using os.makedirs
    course_dir = os.path.join(COURSES_DIR, course.course_id)
    try:
        os.makedirs(course_dir, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create course directory")
        
    # Save/Register course in database
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Convert path nodes to a list of dicts for storage
        nodes_data = [node.model_dump() for node in course.nodes]
        cursor.execute(
            "INSERT OR REPLACE INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
            (
                course.course_id,
                course.display_name,
                json.dumps(course.keywords, ensure_ascii=False),
                course.description,
                json.dumps(nodes_data, ensure_ascii=False)
            )
        )
        conn.commit()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred during registration")
        
    return {"status": "success", "course_id": course.course_id}

@router.delete("/courses/{course_id}")
def delete_course(course_id: str):
    # Block deletion of python_basics and machine_learning
    if course_id in ("python_basics", "machine_learning"):
        raise HTTPException(status_code=400, detail="Cannot delete default system courses")
        
    # Check if course exists
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM registered_courses WHERE course_id = ?", (course_id,))
        exists = cursor.fetchone()[0] > 0
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        raise HTTPException(status_code=500, detail="Database error occurred")
        
    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Course not found")
        
    try:
        cursor.execute("DELETE FROM registered_courses WHERE course_id = ?", (course_id,))
        conn.commit()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error occurred during deletion")
        
    # Clean up physical directory under COURSES_DIR
    import shutil
    course_dir = os.path.join(COURSES_DIR, course_id)
    if os.path.exists(course_dir):
        try:
            shutil.rmtree(course_dir)
        except Exception as e:
            # Non-blocking, but we can log or ignore
            pass
            
    return {"status": "success", "message": f"Course '{course_id}' deleted successfully"}
