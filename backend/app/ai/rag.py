import json
import math
import re
import sqlite3

from app.ai.platform import generate_embedding_vector
from app.db import DB_PATH


def cosine_similarity(v1, v2):
    dot_product = sum(x * y for x, y in zip(v1, v2))
    mag1 = math.sqrt(sum(x * x for x in v1))
    mag2 = math.sqrt(sum(x * x for x in v2))
    if not mag1 or not mag2:
        return 0.0
    return dot_product / (mag1 * mag2)


def rag_search(query: str, subject: str, top_k: int = 5, username: str = "default_user") -> list:
    from app.knowledge_base import clean_subject_name, extract_keywords, load_all_course_chunks

    course_folder = clean_subject_name(subject)
    query_keywords = set(extract_keywords(query))
    query_vector = generate_embedding_vector(query, username)

    conn = None
    rows = []
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT chunk_id, title, content, keywords, embedding FROM course_chunks WHERE course_id = ?",
            (course_folder,),
        )
        rows = cursor.fetchall()
    except Exception as exc:
        print(f"Database error during rag_search: {exc}")
    finally:
        if conn:
            conn.close()

    if not rows:
        chunks = load_all_course_chunks(subject)
        scored = []
        for chunk in chunks:
            chunk_content = chunk.get("content", "")
            chunk_emb = generate_embedding_vector(chunk_content, username)
            score = cosine_similarity(query_vector, chunk_emb)
            chunk_kws = set(chunk.get("keywords", []))
            intersection = query_keywords & chunk_kws
            union = query_keywords | chunk_kws
            score += (len(intersection) / len(union) if union else 0) * 0.3
            title_words = set(re.findall(r"[\u4e00-\u9fff]+|[a-zA-Z]+", chunk.get("title", "")))
            score += len(query_keywords & title_words) * 0.1
            scored.append((score, chunk))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [{"score": round(score, 3), **chunk} for score, chunk in scored[:top_k]]

    scored = []
    for row in rows:
        chunk_id, title, content, raw_keywords, raw_embedding = row
        try:
            chunk_kws = json.loads(raw_keywords)
        except Exception:
            chunk_kws = []
        try:
            chunk_emb = json.loads(raw_embedding)
        except Exception:
            chunk_emb = []
        if not chunk_emb:
            chunk_emb = generate_embedding_vector(content, username)

        score = cosine_similarity(query_vector, chunk_emb)
        chunk_kws_set = set(chunk_kws)
        intersection = query_keywords & chunk_kws_set
        union = query_keywords | chunk_kws_set
        score += (len(intersection) / len(union) if union else 0) * 0.3
        title_words = set(re.findall(r"[\u4e00-\u9fff]+|[a-zA-Z]+", title))
        score += len(query_keywords & title_words) * 0.1

        node_id_match = re.search(r"node\d+", chunk_id)
        scored.append(
            (
                score,
                {
                    "node_id": node_id_match.group(0) if node_id_match else chunk_id,
                    "title": title,
                    "content": content,
                    "keywords": chunk_kws,
                },
            )
        )

    scored.sort(key=lambda item: item[0], reverse=True)
    return [{"score": round(score, 3), **chunk} for score, chunk in scored[:top_k]]


def rag_retrieve_context(query: str, subject: str, max_tokens: int = 2000, username: str = "default_user") -> str:
    results = rag_search(query, subject, top_k=3, username=username)
    if not results:
        return ""

    context_parts = []
    total_chars = 0
    for result in results:
        chunk_text = f"[{result['title']}] ({result.get('node_id', 'chunk')})\n{result['content']}"
        if total_chars + len(chunk_text) > max_tokens * 4:
            break
        context_parts.append(chunk_text)
        total_chars += len(chunk_text)
    return "\n\n---\n\n".join(context_parts)
