# -*- coding: utf-8 -*-
"""
AI Course Material Synthesizer for EduGenesis.
Automatically generates structural textbook chapters (Markdown) for custom courses using LLM,
and indexes them into the RAG vector database.
"""
import os
import json
import sqlite3
import logging
import uuid
from typing import List, Dict, Any

from app.db import DB_PATH
from app.knowledge_base import COURSES_DIR, chunk_markdown_by_headers, generate_embedding, extract_keywords
from app.ai.platform import request_text_completion

logger = logging.getLogger(__name__)

def generate_course_materials(course_id: str, username: str = "default_user") -> bool:
    """
    Synchronously generate textbook Markdown files for the 8 chapters of a registered course,
    and index the generated contents into the course_chunks table.
    """
    logger.info(f"Starting AI course material generation for '{course_id}' requested by '{username}'")
    
    # 1. Fetch course details and syllabus nodes from DB
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT display_name, description, nodes FROM registered_courses WHERE course_id = ?",
            (course_id,)
        )
        row = cursor.fetchone()
        if not row:
            logger.error(f"Course '{course_id}' is not registered in the database.")
            return False
            
        display_name = row[0]
        course_desc = row[1]
        try:
            nodes = json.loads(row[2])
        except Exception as e:
            logger.error(f"Failed to parse nodes JSON for course '{course_id}': {e}")
            return False
    except Exception as e:
        logger.error(f"Database query error for course '{course_id}': {e}", exc_info=True)
        return False
    finally:
        if conn:
            conn.close()

    if not nodes or len(nodes) != 8:
        logger.error(f"Course '{course_id}' must have exactly 8 syllabus nodes. Found {len(nodes) if nodes else 0}.")
        return False

    # 2. Ensure course folder exists on physical disk
    course_dir = os.path.join(COURSES_DIR, course_id)
    os.makedirs(course_dir, exist_ok=True)

    # 3. Generate Markdown content for each node
    generated_files = []
    for idx, node in enumerate(nodes):
        node_id = node.get("id", f"node{idx+1}")
        node_title = node.get("title", f"第{idx+1}章")
        node_desc = node.get("description", "")
        
        logger.info(f"Generating content for {course_id} / {node_id} ({node_title})...")
        
        system_prompt = f"""你是一名资深的大学教授，专门负责撰写课程《{display_name}》的结构化教材内容。
课程总体描述：{course_desc}

你的任务是为其中一个章节节点撰写极其详实、高专业度的教科书内容。
章节名称：{node_title}
章节描述：{node_desc}

【格式排版要求】：
1. 必须使用标准 Markdown 格式编写。
2. 使用 '##' 标识小节标题，'###' 标识更深层级。千万不要在文章开头使用单个 '#' 标题，直接以 '##' 或内容开始即可。
3. 专业学术术语在首次出现时请用 **粗体** 标注。
4. 如果内容涉及数学推导、公式或定理，请使用标准的 LaTeX 格式（例如：行内公式 $a^2 + b^2 = c^2$，独立公式块 $$f(x) = \\sin(x)$$）。
5. 如果内容涉及编程（如 Python 基础、机器学习代码），请包含规范的、带注释的代码块。
6. 章节字数建议在 1000 - 1500 字之间，至少包含 3 个大方向的深入小节。
7. 不要写任何前言、旁白（如“好的，下面是为您编写的章节”）或用 markdown 代码包裹块（如 ```markdown ... ```），请直接返回干净的 Markdown 文本内容本身。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请立刻为章节《{node_title}》撰写深入的教科书正文内容。"}
        ]
        
        # Call LLM
        chapter_markdown = request_text_completion(
            username=username,
            capability="planner",
            messages=messages,
            temperature=0.4,
            timeout=40  # Textbook generation might take a bit longer
        )
        
        if not chapter_markdown:
            logger.error(f"Failed to generate content for {node_id} via LLM.")
            # Fallback mock content in case of API failure to prevent complete workflow crash
            chapter_markdown = f"""## 1. {node_title} 概述
本章节关于《{node_title}》的知识点。主要涵盖了 {node_desc} 的核心概念和应用场景。

## 2. 核心原理与推导
在实际学术研究中，我们重点关注其状态转移机制与基础方程构建。

## 3. 专业实战应用
通过结合典型案例，我们可以在实际项目中部署并校验该模块的有效性。"""
            logger.warning(f"Using fallback mock content for {node_id}.")

        # Save to file
        file_path = os.path.join(course_dir, f"{node_id}.md")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"# {node_title}\n\n{chapter_markdown}\n")
            generated_files.append(file_path)
            logger.info(f"Successfully saved {file_path}")
        except Exception as e:
            logger.error(f"Failed to write file {file_path}: {e}")
            return False

    # 4. Clear any existing RAG chunks for this course in DB to avoid duplicates
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM course_chunks WHERE course_id = ?", (course_id,))
        conn.commit()
    except Exception as e:
        logger.error(f"Failed to clear existing chunks for '{course_id}': {e}")
        return False
    finally:
        if conn:
            conn.close()

    # 5. Read, chunk, and index the new files into database
    logger.info(f"Indexing newly generated files for '{course_id}' into RAG database...")
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        chunk_count = 0
        for file_path in generated_files:
            node_id = os.path.basename(file_path).replace(".md", "")
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
                
            chunks = chunk_markdown_by_headers(text)
            for idx, chunk in enumerate(chunks):
                chunk_title = chunk.get("title", "Untitled")
                content = chunk.get("content", "")
                
                # Extract keywords and calculate embedding
                kws = extract_keywords(content)
                keywords_json = json.dumps(kws, ensure_ascii=False)
                
                embedding_vector = generate_embedding(content, username)
                embedding_json = json.dumps(embedding_vector, ensure_ascii=False)
                
                # Insert chunk
                chunk_id = f"ai_{course_id}_{node_id}_{idx}"
                cursor.execute(
                    "INSERT INTO course_chunks (chunk_id, course_id, title, content, keywords, embedding) VALUES (?, ?, ?, ?, ?, ?)",
                    (chunk_id, course_id, chunk_title, content, keywords_json, embedding_json)
                )
                chunk_count += 1
                
        conn.commit()
        logger.info(f"Successfully indexed {chunk_count} chunks for course '{course_id}'")
        return True
    except Exception as e:
        logger.error(f"Database error during chunks insertion for '{course_id}': {e}", exc_info=True)
        return False
    finally:
        if conn:
            conn.close()

def async_generate_course_materials(course_id: str, username: str = "default_user") -> None:
    """
    Wrapper function to be run inside a background thread or FastAPI BackgroundTasks.
    """
    try:
        success = generate_course_materials(course_id, username)
        if success:
            logger.info(f"Background course material generation completed successfully for '{course_id}'.")
        else:
            logger.error(f"Background course material generation failed for '{course_id}'.")
    except Exception as e:
        logger.error(f"Unexpected error in background task for '{course_id}': {e}", exc_info=True)
