import sqlite3
import json
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth_utils import get_current_username
from pydantic import BaseModel, Field
from typing import List, Optional
from app.models import UserProfile
from app.db import (
    DB_PATH,
    get_password_hash,
    db_save_profile,
    db_sync_path_nodes_by_goals,
    seed_errors_and_logs_for_user
)

router = APIRouter()

def get_current_admin(username: str = Depends(get_current_username)) -> str:
    """
    Dependency to verify that the current user has the 'admin' role in the database.
    This prevents any API bypass by looking up the actual role in SQLite for every request.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT role FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if not row or row[0] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，只有系统管理员账户可调用此接口。"
        )
    return username

@router.get("/admin/stats")
def get_admin_stats(admin_user: str = Depends(get_current_admin)):
    """
    Endpoint to retrieve system stats and distributions for the admin dashboard overview.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Total users
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    # 2. Total active chat sessions
    cursor.execute("SELECT COUNT(*) FROM chat_sessions")
    total_sessions = cursor.fetchone()[0]
    
    # 3. Total error notebook records
    cursor.execute("SELECT COUNT(*) FROM user_errors")
    total_errors = cursor.fetchone()[0]
    
    # 4. Total system agent logs
    cursor.execute("SELECT COUNT(*) FROM system_logs")
    total_logs = cursor.fetchone()[0]
    
    # 5. Cognitive styles distribution
    cursor.execute("SELECT cognitive_style, COUNT(*) FROM users GROUP BY cognitive_style")
    styles_rows = cursor.fetchall()
    cognitive_distribution = {row[0]: row[1] for row in styles_rows}
    
    # 6. Learning goals distribution
    cursor.execute("SELECT learning_goals FROM users")
    goals_rows = cursor.fetchall()
    goals_distribution = {}
    for row in goals_rows:
        if row[0]:
            goals = row[0].split(",")
            for goal in goals:
                goal_clean = goal.strip()
                if goal_clean:
                    goals_distribution[goal_clean] = goals_distribution.get(goal_clean, 0) + 1
                    
    conn.close()
    
    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_errors": total_errors,
        "total_logs": total_logs,
        "cognitive_distribution": cognitive_distribution,
        "goals_distribution": goals_distribution
    }

@router.get("/admin/users")
def get_admin_users(username_filter: str = None, admin_user: str = Depends(get_current_admin)):
    """
    Endpoint to list all user details including academic profiling and study stats.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if username_filter:
        cursor.execute("""
            SELECT u.username, u.cognitive_style, u.learning_goals, u.role,
                   p.knowledge_base, p.learning_pace, p.engagement, p.learning_stats
            FROM users u
            LEFT JOIN user_profiles p ON u.username = p.username
            WHERE u.username LIKE ?
        """, (f"%{username_filter}%",))
    else:
        cursor.execute("""
            SELECT u.username, u.cognitive_style, u.learning_goals, u.role,
                   p.knowledge_base, p.learning_pace, p.engagement, p.learning_stats
            FROM users u
            LEFT JOIN user_profiles p ON u.username = p.username
        """)
        
    rows = cursor.fetchall()
    conn.close()
    
    users_list = []
    for r in rows:
        stats = {}
        if r[7]:
            try:
                stats = json.loads(r[7])
            except Exception:
                pass
                
        users_list.append({
            "username": r[0],
            "cognitive_style": r[1],
            "learning_goals": r[2].split(",") if r[2] else [],
            "role": r[3] if r[3] else "user",
            "knowledge_base": r[4] if r[4] is not None else 40,
            "learning_pace": r[5] if r[5] is not None else 50,
            "engagement": r[6] if r[6] is not None else 80,
            "study_time": stats.get("study_time", 0),
            "quiz_accuracy": stats.get("quiz_accuracy", 0),
            "mastered_nodes": stats.get("mastered_nodes", 0)
        })
        
    return users_list

@router.get("/admin/logs")
def get_admin_logs(username_filter: str = None, log_type_filter: str = None, admin_user: str = Depends(get_current_admin)):
    """
    Endpoint to retrieve system operation logs across all users, with filter capabilities.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = "SELECT username, timestamp, sender, message, log_type FROM system_logs"
    conditions = []
    params = []
    
    if username_filter:
        conditions.append("username LIKE ?")
        params.append(f"%{username_filter}%")
    if log_type_filter:
        conditions.append("log_type = ?")
        params.append(log_type_filter)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY rowid DESC LIMIT 500"
    
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    
    logs_list = []
    for r in rows:
        logs_list.append({
            "username": r[0],
            "timestamp": r[1],
            "sender": r[2],
            "message": r[3],
            "log_type": r[4]
        })
        
    return logs_list

class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: str = "user"
    cognitive_style: str = "Practical Coding"
    learning_goals: List[str] = ["Python Basics"]

class RoleUpdateRequest(BaseModel):
    username: str
    role: str

class PasswordUpdateRequest(BaseModel):
    username: str
    password: str

@router.post("/admin/users/create")
def admin_create_user(request: UserCreateRequest, admin_user: str = Depends(get_current_admin)):
    username_clean = request.username.strip()
    if not username_clean or len(username_clean) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名无效，长度必须至少为 2 个字符。"
        )
    if not request.password or len(request.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码过于简单，长度必须至少为 4 个字符。"
        )
    if request.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的角色类型，仅支持 'user' 或 'admin'。"
        )
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (username_clean,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户名已被占用，请使用其他名称。"
        )
        
    pwd_hash = get_password_hash(request.password, username_clean)
    goals_str = ",".join(request.learning_goals)
    cursor.execute(
        "INSERT INTO users (username, password_hash, cognitive_style, learning_goals, role) VALUES (?, ?, ?, ?, ?)",
        (username_clean, pwd_hash, request.cognitive_style, goals_str, request.role)
    )
    conn.commit()
    conn.close()
    
    # Initialize profile
    profile = UserProfile(
        knowledge_base=30 if "Machine Learning" in request.learning_goals else 40,
        learning_pace=60 if "Machine Learning" in request.learning_goals else 50,
        cognitive_style=request.cognitive_style,
        error_patterns=["Gradient instability"] if "Machine Learning" in request.learning_goals else ["Syntax Errors", "Indentation Issues"],
        learning_goals=request.learning_goals,
        engagement=80
    )
    db_save_profile(username_clean, profile)
    
    # Sync path nodes
    db_sync_path_nodes_by_goals(username_clean, request.learning_goals)
    
    # Seed default errors and logs
    seed_errors_and_logs_for_user(username_clean)
    
    return {
        "status": "success",
        "detail": f"学术通行证 '{username_clean}' 注册并配置成功，权限角色为 '{request.role}'。"
    }

@router.post("/admin/users/role")
def update_user_role(request: RoleUpdateRequest, admin_user: str = Depends(get_current_admin)):
    username_clean = request.username.strip()
    if username_clean == admin_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="安全风控：不能修改自身管理员账户的角色权限！"
        )
    if request.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的角色，仅支持 'user' 或 'admin'。"
        )
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (username_clean,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"目标账户 '{username_clean}' 不存在。"
        )
        
    cursor.execute("UPDATE users SET role = ? WHERE username = ?", (request.role, username_clean))
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "detail": f"已成功将账户 '{username_clean}' 的权限角色变更为 '{request.role}'。"
    }

@router.post("/admin/users/password")
def update_user_password(request: PasswordUpdateRequest, admin_user: str = Depends(get_current_admin)):
    username_clean = request.username.strip()
    if not request.password or len(request.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码过于简单，必须包含至少 4 个字符。"
        )
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (username_clean,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"目标账户 '{username_clean}' 不存在。"
        )
        
    new_pwd_hash = get_password_hash(request.password, username_clean)
    cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_pwd_hash, username_clean))
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "detail": f"账户 '{username_clean}' 的学术密码已成功重置。"
    }

@router.delete("/admin/users/{username}")
def delete_user(username: str, admin_user: str = Depends(get_current_admin)):
    username_clean = username.strip()
    if username_clean == admin_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="安全风控：不能删除自身正在登录的管理员账户！"
        )
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (username_clean,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"目标账户 '{username_clean}' 不存在。"
        )
        
    # Cascade cleanups
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS profile_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            snapshot_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("DELETE FROM chat_messages WHERE session_id IN (SELECT session_id FROM chat_sessions WHERE username = ?)", (username_clean,))
    cursor.execute("DELETE FROM chat_sessions WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM user_profiles WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM user_path_nodes WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM user_resources WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM user_llm_providers WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM user_model_routing WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM user_errors WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM system_logs WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM profile_snapshots WHERE username = ?", (username_clean,))
    cursor.execute("DELETE FROM users WHERE username = ?", (username_clean,))
    
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "detail": f"账户 '{username_clean}' 及其关联的学术空间所有数据均已被彻底、安全地物理删除。"
    }
