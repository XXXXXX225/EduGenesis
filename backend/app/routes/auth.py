import hashlib
import sqlite3
from fastapi import APIRouter, HTTPException, status
from app.auth_utils import create_access_token
from app.models import RegisterRequest, LoginRequest, UserProfile
from app.db import (
    DB_PATH,
    get_password_hash,
    db_save_profile,
    db_sync_path_nodes_by_goals,
    seed_errors_and_logs_for_user,
    db_get_profile
)

router = APIRouter()

@router.post("/auth/register")
def register_user(request: RegisterRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (request.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户名已被占用，请重新选择昵称。"
        )
    
    pwd_hash = get_password_hash(request.password, request.username)
    goals_str = ",".join(request.learning_goals)
    cursor.execute(
        "INSERT INTO users (username, password_hash, cognitive_style, learning_goals, role) VALUES (?, ?, ?, ?, ?)",
        (request.username, pwd_hash, request.cognitive_style, goals_str, 'user')
    )
    conn.commit()
    conn.close()
    
    # Create profile
    profile = UserProfile(
        knowledge_base=30 if "Machine Learning" in request.learning_goals else 40,
        learning_pace=60 if "Machine Learning" in request.learning_goals else 50,
        cognitive_style=request.cognitive_style,
        error_patterns=["Gradient instability"] if "Machine Learning" in request.learning_goals else ["Syntax Errors", "Indentation Issues"],
        learning_goals=request.learning_goals,
        engagement=80
    )
    db_save_profile(request.username, profile)
    
    # Sync path nodes
    db_sync_path_nodes_by_goals(request.username, request.learning_goals)
    
    # Seed default errors and logs to prevent blank pages on tab initialization
    seed_errors_and_logs_for_user(request.username)
    
    access_token = create_access_token(request.username)
    return {
        "status": "success",
        "detail": "注册成功，学术环境已初始化。",
        "username": request.username,
        "access_token": access_token,
        "token_type": "bearer",
        "role": "user",
    }

@router.post("/auth/login")
def login_user(request: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, cognitive_style, learning_goals, role FROM users WHERE username = ?", (request.username,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名不存在，请重新输入或注册账号。"
        )
        
    pwd_hash = row[0]
    cognitive_style = row[1]
    learning_goals = row[2].split(",") if row[2] else []
    role = row[3] if len(row) > 3 and row[3] else "user"
    
    if not pwd_hash.startswith("pbkdf2_sha256$"):
        # Migrate from old SHA-256 hash
        old_hash = hashlib.sha256(request.password.encode('utf-8')).hexdigest()
        if old_hash != pwd_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="密码错误，请重新输入学术密码。"
            )
        # Convert to PBKDF2
        new_pwd_hash = get_password_hash(request.password, request.username)
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_pwd_hash, request.username))
        conn.commit()
        conn.close()
    else:
        # PBKDF2 verify
        if get_password_hash(request.password, request.username) != pwd_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="密码错误，请重新输入学术密码。"
            )
    
    # Self-heal profile and path nodes if missing in DB
    db_get_profile(request.username)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT username FROM user_profiles WHERE username = ?", (request.username,))
    profile_exists = c.fetchone()
    conn.close()
    if not profile_exists:
        profile = UserProfile(
            knowledge_base=30 if "Machine Learning" in learning_goals else 40,
            learning_pace=60 if "Machine Learning" in learning_goals else 50,
            cognitive_style=cognitive_style,
            error_patterns=["Gradient instability"] if "Machine Learning" in learning_goals else ["Syntax Errors", "Indentation Issues"],
            learning_goals=learning_goals,
            engagement=80
        )
        db_save_profile(request.username, profile)
        db_sync_path_nodes_by_goals(request.username, learning_goals)
        
    # Seed default errors and logs to prevent blank pages on tab initialization
    seed_errors_and_logs_for_user(request.username)
        
    access_token = create_access_token(request.username)
    return {
        "status": "success",
        "username": request.username,
        "cognitive_style": cognitive_style,
        "learning_goals": learning_goals,
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
    }
