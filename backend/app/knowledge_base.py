# -*- coding: utf-8 -*-
import os
import re

COURSES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "courses")

def clean_subject_name(subject: str) -> str:
    """
    Standardize the subject string to map to directory names.
    """
    sub_lower = subject.lower()
    if "machine" in sub_lower or "ml" in sub_lower or "learning" in sub_lower or "线性" in sub_lower or "梯度" in sub_lower:
        return "machine_learning"
    return "python_basics"

def load_course_material(subject: str, node_id: str) -> str:
    """
    Load the Markdown file corresponding to the subject and node_id.
    """
    course_folder = clean_subject_name(subject)
    
    # Standardize node_id (e.g., Node1, node1 -> node1)
    node_id_clean = node_id.lower().strip()
    
    # Try direct filename matching (e.g., node1.md)
    filename = f"{node_id_clean}.md"
    file_path = os.path.join(COURSES_DIR, course_folder, filename)
    
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
            dir_path = os.path.join(COURSES_DIR, course_folder)
            if os.path.exists(dir_path):
                for f_name in os.listdir(dir_path):
                    if f_name.endswith(".md") and num in f_name:
                        full_p = os.path.join(dir_path, f_name)
                        with open(full_p, "r", encoding="utf-8") as f:
                            return f.read()
    except Exception as e:
        print(f"Fallback directory scan failed: {e}")
        
    return ""
