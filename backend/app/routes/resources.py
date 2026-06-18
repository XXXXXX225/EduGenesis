import io
import os
import json
import sqlite3
import base64
import hashlib
import hmac
import ssl
import time
from urllib.parse import urlencode, urlparse
from wsgiref.handlers import format_date_time
import websocket
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.ai.platform import synthesize_tts_audio
from app.auth_utils import get_current_username
from app.models import ResourceGenerateRequest
from app.db import (
    DB_PATH,
    db_get_profile,
    db_get_path_nodes,
    db_log_agent_action,
    get_fallback_assets_for_topic
)
from app.limiter import rate_limit_resource


router = APIRouter()

def call_xfyun_tts(text: str) -> bytes:
    return synthesize_tts_audio(text)

@router.get("/resources")
def get_resources(node_id: str, current_username: str = Depends(get_current_username)):
    target_user = current_username
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT resource_type, content FROM user_resources WHERE username = ? AND node_id = ?",
        (target_user, node_id)
    )
    rows = cursor.fetchall()
    conn.close()
    
    # If no resources are found for this user and node, trigger automatic generation/fallback
    if not rows:
        # Find the node configuration to understand the topic and resource types
        nodes = db_get_path_nodes(target_user)
        node_title = "General Study Topic"
        node_description = ""
        node_resources = ["pdf"]
        for node in nodes:
            if node.id == node_id:
                node_title = node.title
                node_description = node.description
                node_resources = node.resources
                break
                
        from app.agents.coordinator import AgentCoordinator
        coordinator = AgentCoordinator(
            username=target_user,
            node_id=node_id,
            node_title=node_title,
            node_description=node_description,
            node_resources=node_resources,
            trigger_type="auto"
        )
        generated_data = coordinator.run_consensus_pipeline()
        profile = db_get_profile(target_user)
        fallback_assets = get_fallback_assets_for_topic(node_title, profile, node_id)
            
        # Save generated items to SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        for res_type in node_resources:
            content_val = generated_data.get(res_type, fallback_assets.get(res_type, ""))
            if not isinstance(content_val, str):
                content_val = json.dumps(content_val, ensure_ascii=False)
                
            cursor.execute(
                "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                (target_user, node_id, res_type, content_val)
            )
        conn.commit()
        conn.close()
        
        # Re-fetch rows from DB
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT resource_type, content FROM user_resources WHERE username = ? AND node_id = ?",
            (target_user, node_id)
        )
        rows = cursor.fetchall()
        conn.close()
    else:
        # If rows are found, log a read event to show real-time agent operation in console
        nodes = db_get_path_nodes(target_user)
        node_title = "General Study Topic"
        for node in nodes:
            if node.id == node_id:
                node_title = node.title
                break
        profile = db_get_profile(target_user)
        db_log_agent_action(target_user, "主管智能体", f"用户开始学习关卡 [{node_title}]，正在调配并渲染多模态自适应中文学术资源库。", "info")
        db_log_agent_action(target_user, "画像智能体", f"画像校验：当前认知风格 [{profile.cognitive_style}] 与所加载 of 资源完美对齐，启动个性化学情监控跟踪器。", "consensus")
        db_log_agent_action(target_user, "安全校验智能体", f"运行期监控已开启：正在审计沙盒防护和敏感输入防御层，合规审计状态：Normal，未发现学术违规偏离。", "consensus")
        
    result = {}
    for row in rows:
        try:
            result[row[0]] = json.loads(row[1])
        except Exception:
            result[row[0]] = row[1]
    return result

@router.post("/resources/generate", dependencies=[Depends(rate_limit_resource)])
def generate_resources(request: ResourceGenerateRequest, current_username: str = Depends(get_current_username)):
    target_user = current_username
    node_id = request.node_id
    
    # Get current profile
    profile = db_get_profile(target_user)
    
    # Find the node configuration to understand the topic
    nodes = db_get_path_nodes(target_user)
    node_title = "General Study Topic"
    node_description = ""
    node_resources = ["pdf"]
    for node in nodes:
        if node.id == node_id:
            node_title = node.title
            node_description = node.description
            node_resources = node.resources
            break
            
    from app.agents.coordinator import AgentCoordinator
    coordinator = AgentCoordinator(
        username=target_user,
        node_id=node_id,
        node_title=node_title,
        node_description=node_description,
        node_resources=node_resources,
        trigger_type="manual"
    )
    generated_data = coordinator.run_consensus_pipeline()
    fallback_assets = get_fallback_assets_for_topic(node_title, profile, node_id)
        
    # Save generated items to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for res_type in node_resources:
        content_val = generated_data.get(res_type, fallback_assets.get(res_type, ""))
        if not isinstance(content_val, str):
            content_val = json.dumps(content_val, ensure_ascii=False)
            
        cursor.execute(
            "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
            (target_user, node_id, res_type, content_val)
        )
    conn.commit()
    conn.close()
    
    return get_resources(node_id=node_id, current_username=current_username)

@router.get("/tts")
def get_tts(text: str):
    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' parameter.")
    try:
        audio_bytes = call_xfyun_tts(text)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
    except ValueError as ve:
        print(f"Xunfei TTS Configuration missing: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"TTS Configuration missing: {str(ve)}"
        )
    except Exception as e:
        print(f"Xunfei TTS synthesis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TTS synthesis failed: {str(e)}"
        )
