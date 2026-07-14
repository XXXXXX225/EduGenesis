# -*- coding: utf-8 -*-
"""
RAG (Retrieval-Augmented Generation) Knowledge Base for EduGenesis.
Provides document chunking, keyword extraction, and semantic retrieval
for Python Basics and Machine Learning course materials.
"""
import os
import re
import json
import sqlite3
from collections import Counter

COURSES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "courses")
from app.db import DB_PATH

# ─── Subject name normalization ───
def clean_subject_name(subject: str) -> str:
    """Standardize the subject string to map to course_id by querying registered_courses DB."""
    if not subject:
        return "python_basics"
        
    # Standardize function for fuzzy matching
    def std(s: str) -> str:
        return s.lower().replace('_', '').replace(' ', '').replace('-', '')
        
    sub_std = std(subject)
    
    # Try querying the database
    conn = None
    courses = []
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT course_id, display_name, keywords FROM registered_courses")
        rows = cursor.fetchall()
        for row in rows:
            c_id = row[0]
            display_name = row[1]
            try:
                kws = json.loads(row[2])
            except Exception:
                kws = []
            courses.append({
                "course_id": c_id,
                "display_name": display_name,
                "keywords": kws
            })
    except Exception as e:
        print(f"Database error in clean_subject_name: {e}")
        # Fallback to hardcoded defaults in case database is not accessible
        courses = [
            {
                "course_id": "python_basics",
                "display_name": "Python 编程基础",
                "keywords": ["python", "basics", "变量", "循环", "条件", "函数", "数据结构"]
            },
            {
                "course_id": "machine_learning",
                "display_name": "机器学习与深度学习",
                "keywords": ["machine", "ml", "learning", "机器学习", "线性代数", "梯度", "神经网络", "深度学习", "回归", "分类", "反向传播"]
            }
        ]
    finally:
        if conn:
            conn.close()

    # 1. Exact match on standardized course_id or display_name
    for course in courses:
        if sub_std == std(course["course_id"]) or sub_std == std(course["display_name"]):
            return course["course_id"]
            
    # 2. Substring match on standardized course_id or display_name
    for course in courses:
        if (std(course["course_id"]) in sub_std or 
            std(course["display_name"]) in sub_std or 
            sub_std in std(course["course_id"]) or 
            sub_std in std(course["display_name"])):
            return course["course_id"]

    # 3. Substring match on any keyword inside the subject string (case-insensitive)
    for course in courses:
        for kw in course["keywords"]:
            if kw.lower() in subject.lower():
                return course["course_id"]
                
    # 4. Fallback to python_basics
    return "python_basics"



# ─── Document chunking ───
def chunk_markdown_by_headers(markdown_text: str) -> list:
    """
    Split markdown text into chunks by ## or ### headers.
    Returns list of { "title": str, "content": str, "keywords": [str] }.
    """
    chunks = []
    # Split by ## level headers
    sections = re.split(r'\n(?=## )', markdown_text)
    for section in sections:
        section = section.strip()
        if not section:
            continue
        # Extract header title
        header_match = re.match(r'^#{1,3}\s+(.+)', section)
        title = header_match.group(1).strip() if header_match else "Untitled"
        # Remove the header line from content
        content = re.sub(r'^#{1,3}\s+.+\n', '', section, count=1).strip()
        # Extract keywords (Chinese + English technical terms)
        keywords = extract_keywords(content)
        chunks.append({
            "title": title,
            "content": content,
            "keywords": keywords
        })
    return chunks

def extract_keywords(text: str) -> list:
    """
    Extract technical keywords from text.
    Extracts: English tech terms, significant words, code tokens, Chinese phrases.
    """
    keywords = []
    
    # English stop words to filter out
    eng_stop = {
        'the', 'is', 'are', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'or',
        'that', 'this', 'it', 'with', 'as', 'on', 'at', 'by', 'from', 'be',
        'has', 'have', 'can', 'not', 'but', 'all', 'we', 'you', 'its', 'also',
        'more', 'most', 'than', 'some', 'each', 'any', 'into', 'use', 'such'
    }
    
    # English technical terms (CamelCase, snake_case, abbreviations)
    eng_terms = re.findall(r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b|\b[a-z]+(?:_[a-z]+)+\b|\b[A-Z]{2,}\b', text)
    keywords.extend(eng_terms)
    
    # Backtick-wrapped terms (inline code)
    code_terms = re.findall(r'`([^`]+)`', text)
    keywords.extend(code_terms)
    
    # Bold / italic markdown
    bold_terms = re.findall(r'\*\*([^*]+)\*\*', text)
    keywords.extend(bold_terms)
    
    # Multi-word technical phrases (2-3 capitalized words)
    phrases = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b', text)
    keywords.extend(phrases)
    
    # Significant English words (>=4 chars, not stop words)
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text)
    for w in words:
        wl = w.lower()
        if wl not in eng_stop:
            keywords.append(w)
    
    # Chinese key phrases (2-6 character sequences from CJK range)
    chinese_phrases = re.findall(r'[\u4e00-\u9fff]{2,6}', text)
    cn_stop = {'可以', '使用', '进行', '一个', '这个', '通过', '需要', '我们', '它们', '以及', '或者', '但是'}
    chinese_phrases = [p for p in chinese_phrases if p not in cn_stop]
    keywords.extend(chinese_phrases)
    
    # Deduplicate and return top 30
    seen = set()
    unique = []
    for kw in keywords:
        kw_lower = kw.lower()
        if kw_lower not in seen and len(kw) > 1:
            seen.add(kw_lower)
            unique.append(kw)
    return unique[:30]

# ─── Course material loading ───
def load_course_material(subject: str, node_id: str) -> str:
    """
    Load the Markdown file corresponding to the subject and node_id.
    Safely sanitizes paths to prevent directory traversal.
    """
    course_folder = clean_subject_name(subject)
    node_id_clean = node_id.lower().strip()
    # Strip directory traversal components
    node_id_basename = os.path.basename(node_id_clean)
    filename = f"{node_id_basename}.md"
    
    file_path = os.path.abspath(os.path.join(COURSES_DIR, course_folder, filename))
    resolved_courses_dir = os.path.abspath(COURSES_DIR) + os.path.sep
    
    if not file_path.startswith(resolved_courses_dir):
        print(f"Directory traversal blocked: {file_path} escapes {resolved_courses_dir}")
        return ""

    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Error reading knowledge base file {file_path}: {e}")
            
    # Fallback: scan directory files matching numbers
    try:
        num_match = re.search(r'\d+', node_id_clean)
        if num_match:
            num = num_match.group()
            dir_path = os.path.abspath(os.path.join(COURSES_DIR, course_folder))
            if dir_path.startswith(resolved_courses_dir) and os.path.exists(dir_path):
                for f_name in os.listdir(dir_path):
                    if f_name.endswith(".md") and num in f_name:
                        # Ensure individual file is safe
                        full_p = os.path.abspath(os.path.join(dir_path, f_name))
                        if full_p.startswith(resolved_courses_dir) and os.path.exists(full_p):
                            with open(full_p, "r", encoding="utf-8") as f:
                                return f.read()
    except Exception as e:
        print(f"Fallback directory scan failed: {e}")
    return ""

def load_all_course_chunks(subject: str) -> list:
    """
    Load ALL markdown files for a subject and chunk them.
    Returns a flat list of chunk dicts with node_id attached.
    """
    course_folder = clean_subject_name(subject)
    dir_path = os.path.join(COURSES_DIR, course_folder)
    all_chunks = []
    if not os.path.exists(dir_path):
        return all_chunks
    for f_name in sorted(os.listdir(dir_path)):
        if not f_name.endswith(".md"):
            continue
        node_id = f_name.replace(".md", "")
        file_path = os.path.join(dir_path, f_name)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            chunks = chunk_markdown_by_headers(text)
            for c in chunks:
                c["node_id"] = node_id
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"Error chunking {f_name}: {e}")
    return all_chunks

# ─── Retrieval ───
def generate_embedding(text: str, username: str = "default_user") -> list:
    from app.ai.platform import generate_embedding_vector

    return generate_embedding_vector(text, username)

def cosine_similarity(v1, v2):
    from app.ai.rag import cosine_similarity as ai_cosine_similarity

    return ai_cosine_similarity(v1, v2)

def seed_default_course_chunks():
    """
    Check if course_chunks is empty for default courses.
    If so, populate it by chunking their markdown files and calculating local pseudo-embeddings.
    """
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if course_chunks has entries for default courses
        cursor.execute("SELECT COUNT(*) FROM course_chunks WHERE course_id IN ('python_basics', 'machine_learning')")
        if cursor.fetchone()[0] > 0:
            return
            
        for course_id in ["python_basics", "machine_learning"]:
            chunks = load_all_course_chunks(course_id)
            for i, chunk in enumerate(chunks):
                node_id = chunk.get("node_id", "node")
                chunk_id = f"seed_{course_id}_{node_id}_{i}"
                title = chunk.get("title", "Untitled")
                content = chunk.get("content", "")
                keywords = json.dumps(chunk.get("keywords", []), ensure_ascii=False)
                embedding = json.dumps(generate_embedding(content), ensure_ascii=False)
                
                cursor.execute(
                    "INSERT INTO course_chunks (chunk_id, course_id, title, content, keywords, embedding) VALUES (?, ?, ?, ?, ?, ?)",
                    (chunk_id, course_id, title, content, keywords, embedding)
                )
        conn.commit()
    except Exception as e:
        print(f"Error seeding default course chunks: {e}")
    finally:
        if conn:
            conn.close()

def rag_search(query: str, subject: str, top_k: int = 5, username: str = "default_user") -> list:
    from app.ai.rag import rag_search as ai_rag_search

    return ai_rag_search(query, subject, top_k=top_k, username=username)

def rag_retrieve_context(query: str, subject: str, max_tokens: int = 2000, username: str = "default_user") -> str:
    from app.ai.rag import rag_retrieve_context as ai_rag_retrieve_context

    return ai_rag_retrieve_context(query, subject, max_tokens=max_tokens, username=username)

# ─── Knowledge base statistics (for admin/console) ───
def get_kb_stats() -> dict:
    """Return statistics about the knowledge base."""
    stats = {}
    for subject_dir in os.listdir(COURSES_DIR):
        dir_path = os.path.join(COURSES_DIR, subject_dir)
        if not os.path.isdir(dir_path):
            continue
        md_files = [f for f in os.listdir(dir_path) if f.endswith(".md")]
        total_chunks = 0
        total_words = 0
        for f_name in md_files:
            with open(os.path.join(dir_path, f_name), "r", encoding="utf-8") as f:
                text = f.read()
            chunks = chunk_markdown_by_headers(text)
            total_chunks += len(chunks)
            total_words += len(text.split())
        stats[subject_dir] = {
            "files": len(md_files),
            "chunks": total_chunks,
            "total_words": total_words
        }
    return stats
