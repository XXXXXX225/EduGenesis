import os
import re
import json
import sqlite3
import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from pydantic import BaseModel, Field
from app.models import PathNode
from app.db import DB_PATH
from app.knowledge_base import COURSES_DIR, generate_embedding, extract_keywords
from app.auth_utils import get_current_username
from app.ai.scenes import generate_course_syllabus
import io
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

class CourseInput(BaseModel):
    course_id: str
    display_name: str
    keywords: List[str] = Field(default_factory=list)
    description: str
    nodes: List[PathNode] = Field(default_factory=list)

@router.get("/courses")
def get_courses():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT course_id, display_name, keywords, description, nodes FROM registered_courses")
        rows = cursor.fetchall()
    except Exception as e:
        logger.error(f"Database error occurred in get_courses: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database error occurred")
    finally:
        if conn:
            conn.close()
        
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
        logger.error(f"Failed to create course directory {course_dir}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create course directory")
        
    # Save/Register course in database
    conn = None
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
    except Exception as e:
        logger.error(f"Database error during course registration for {course.course_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database error occurred during registration")
    finally:
        if conn:
            conn.close()
        
    return {"status": "success", "course_id": course.course_id}

@router.delete("/courses/{course_id}")
def delete_course(course_id: str):
    # Validate course_id matches ^[a-zA-Z0-9_]+$ to prevent directory traversal / parameter injection
    if not re.match(r"^[a-zA-Z0-9_]+$", course_id):
        raise HTTPException(status_code=400, detail="Invalid course_id format. Must match ^[a-zA-Z0-9_]+$")

    # Block deletion of python_basics and machine_learning
    if course_id in ("python_basics", "machine_learning"):
        raise HTTPException(status_code=400, detail="Cannot delete default system courses")
        
    # Check if course exists
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM registered_courses WHERE course_id = ?", (course_id,))
        exists = cursor.fetchone()[0] > 0
        
        if not exists:
            raise HTTPException(status_code=404, detail="Course not found")
            
        cursor.execute("DELETE FROM registered_courses WHERE course_id = ?", (course_id,))
        conn.commit()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error during deletion of course {course_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database error occurred during deletion")
    finally:
        if conn:
            conn.close()
        
    # Clean up physical directory under COURSES_DIR
    import shutil
    course_dir = os.path.join(COURSES_DIR, course_id)
    if os.path.exists(course_dir):
        # Additional safety check: ensure path is still within COURSES_DIR to prevent directory traversal on deletion
        abs_courses_dir = os.path.abspath(COURSES_DIR)
        abs_course_dir = os.path.abspath(course_dir)
        if not abs_course_dir.startswith(abs_courses_dir + os.sep) and abs_course_dir != abs_courses_dir:
            logger.error(f"Attempted out-of-bounds directory deletion: {course_dir}")
            raise HTTPException(status_code=400, detail="Invalid course directory path")
            
        try:
            shutil.rmtree(course_dir)
        except Exception as e:
            logger.warning(f"Non-blocking cleanup of physical directory failed for {course_id}: {e}")
            pass
            
    return {"status": "success", "message": f"Course '{course_id}' deleted successfully"}


class SyllabusGenerateRequest(BaseModel):
    course_name: str
    description: str

@router.post("/courses/generate_syllabus")
def generate_syllabus(request: SyllabusGenerateRequest, current_username: str = Depends(get_current_username)):
    nodes = generate_course_syllabus(request.course_name, request.description, current_username)
    if not nodes:
        raise HTTPException(status_code=500, detail="Failed to generate syllabus via AI.")
    return {"nodes": nodes}

@router.post("/courses/{course_id}/generate_material")
def trigger_material_generation(
    course_id: str,
    background_tasks: BackgroundTasks,
    current_username: str = Depends(get_current_username)
):
    if not re.match(r"^[a-zA-Z0-9_]+$", course_id):
        raise HTTPException(status_code=400, detail="Invalid course_id. Must match ^[a-zA-Z0-9_]+$")
        
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM registered_courses WHERE course_id = ?", (course_id,))
        exists = cursor.fetchone()[0] > 0
        if not exists:
            raise HTTPException(status_code=404, detail="Course not found.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error in generation check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database check failed.")
    finally:
        if conn:
            conn.close()

    from app.course_synthesizer import async_generate_course_materials
    background_tasks.add_task(async_generate_course_materials, course_id, current_username)
    return {
        "status": "success",
        "message": f"Successfully triggered background AI textbook generation and indexing for course '{course_id}'."
    }

@router.post("/courses/{course_id}/upload")
async def upload_course_file(
    course_id: str,
    file: UploadFile = File(...),
    current_username: str = Depends(get_current_username)
):
    if not re.match(r"^[a-zA-Z0-9_]+$", course_id):
        raise HTTPException(status_code=400, detail="Invalid course_id. Must match ^[a-zA-Z0-9_]+$")
        
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM registered_courses WHERE course_id = ?", (course_id,))
        exists = cursor.fetchone()[0] > 0
        if not exists:
            raise HTTPException(status_code=404, detail="Course not found.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error in upload check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database check failed.")
    finally:
        if conn:
            conn.close()

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".pdf", ".txt", ".md"):
        raise HTTPException(status_code=400, detail="Unsupported file format. Only .pdf, .txt, and .md are allowed.")

    max_size = 10 * 1024 * 1024
    contents = b""
    try:
        while True:
            chunk = await file.read(64 * 1024)
            if not chunk:
                break
            contents += chunk
            if len(contents) > max_size:
                raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to read file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to read file content.")

    course_dir = os.path.join(COURSES_DIR, course_id)
    os.makedirs(course_dir, exist_ok=True)
    
    sanitized_filename = os.path.basename(filename)
    sanitized_filename = re.sub(r'[\/\x00\\\s]', '_', sanitized_filename)
    
    file_path = os.path.join(course_dir, sanitized_filename)
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        logger.error(f"Failed to save file to physical disk: {e}", exc_info=True)

    text_content = ""
    if ext == ".pdf":
        try:
            pdf_file = io.BytesIO(contents)
            from pypdf import PdfReader
            reader = PdfReader(pdf_file)
            extracted_pages = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    extracted_pages.append(t)
            text_content = "\n".join(extracted_pages)
        except Exception as e:
            logger.error(f"Failed to parse PDF file: {e}", exc_info=True)
            raise HTTPException(status_code=400, detail="Failed to parse PDF document.")
    else:
        try:
            text_content = contents.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text_content = contents.decode("gbk")
            except Exception:
                raise HTTPException(status_code=400, detail="Failed to decode text file. Ensure UTF-8 or GBK encoding.")
                
    text_content = text_content.strip()
    if not text_content:
        raise HTTPException(status_code=400, detail="Extracted text content is empty.")

    step = 500
    chunks = []
    i = 0
    while i < len(text_content):
        chunk_text = text_content[i : i + 600].strip()
        if chunk_text:
            chunks.append(chunk_text)
        if i + 600 >= len(text_content):
            break
        i += step

    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks created from text.")

    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        for idx, chunk_text in enumerate(chunks):
            chunk_id = f"{course_id}_{uuid.uuid4().hex[:12]}_{idx}"
            chunk_title = f"{sanitized_filename} (Section {idx + 1})"
            kws = extract_keywords(chunk_text)
            keywords_json = json.dumps(kws, ensure_ascii=False)
            
            embedding_vector = generate_embedding(chunk_text, current_username)
            embedding_json = json.dumps(embedding_vector, ensure_ascii=False)
            
            cursor.execute(
                "INSERT INTO course_chunks (chunk_id, course_id, title, content, keywords, embedding) VALUES (?, ?, ?, ?, ?, ?)",
                (chunk_id, course_id, chunk_title, chunk_text, keywords_json, embedding_json)
            )
        conn.commit()
    except Exception as e:
        logger.error(f"Database error during chunks insertion: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to store chunks in database.")
    finally:
        if conn:
            conn.close()

    return {
        "status": "success",
        "chunks_count": len(chunks),
        "message": f"Successfully parsed and indexed {len(chunks)} chunks from {sanitized_filename}."
    }
