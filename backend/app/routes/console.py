import sqlite3
from fastapi import APIRouter, Depends
from app.auth_utils import get_current_username
from app.models import ConsoleLogRequest
from app.db import (
    DB_PATH,
    db_log_agent_action,
    seed_errors_and_logs_for_user
)

router = APIRouter()

@router.get("/console/logs")
def get_console_logs(current_username: str = Depends(get_current_username)):
    target_user = current_username
    seed_errors_and_logs_for_user(target_user)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT timestamp, sender, message, log_type FROM system_logs WHERE username = ? ORDER BY rowid DESC LIMIT 50",
        (target_user,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in reversed(rows):
        result.append({
            "time": r[0],
            "sender": r[1],
            "log": r[2],
            "log_type": r[3]
        })
    return result

@router.post("/console/log-action")
def log_console_action(request: ConsoleLogRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    db_log_agent_action(target_user, request.sender, request.message, request.log_type)
    return {"status": "success"}
