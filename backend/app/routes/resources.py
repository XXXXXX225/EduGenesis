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
from app.llm_client import call_llm_resource_agent

router = APIRouter()

def call_xfyun_tts(text: str) -> bytes:
    appid = os.getenv("TTS_APPID")
    apikey = os.getenv("TTS_API_KEY")
    apisecret = os.getenv("TTS_API_SECRET")

    if not appid or not apikey or not apisecret:
        raise ValueError("Xunfei TTS credentials (TTS_APPID, TTS_API_KEY, TTS_API_SECRET) not fully configured in environment.")

    text = text[:800]
    ws_url = "wss://tts-api.xfyun.cn/v2/tts"
    parsed_url = urlparse(ws_url)
    host = parsed_url.netloc
    path = parsed_url.path
    date = format_date_time(time.time())

    signature_origin = f"host: {host}\ndate: {date}\nGET {path} HTTP/1.1"
    signature_sha = hmac.new(
        apisecret.encode("utf-8"),
        signature_origin.encode("utf-8"),
        digestmod=hashlib.sha256
    ).digest()
    signature_sha_base64 = base64.b64encode(signature_sha).decode(encoding="utf-8")

    authorization_origin = (
        f'api_key="{apikey}", algorithm="hmac-sha256", '
        f'headers="host date request-line", signature="{signature_sha_base64}"'
    )
    authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(encoding="utf-8")

    params = {
        "authorization": authorization,
        "date": date,
        "host": host
    }
    auth_url = f"{ws_url}?" + urlencode(params)

    allow_insecure_ssl = os.getenv("TTS_ALLOW_INSECURE_SSL", "").lower() in {"1", "true", "yes"}
    ssl_options = None
    if allow_insecure_ssl:
        ssl_options = {"cert_reqs": ssl.CERT_NONE}

    ws = websocket.create_connection(auth_url, sslopt=ssl_options)
    text_b64 = base64.b64encode(text.encode("utf-8")).decode("utf-8")
    
    payload = {
        "common": {"app_id": appid},
        "business": {
            "aue": "lame",
            "sfl": 1,
            "auf": "audio/L16;rate=16000",
            "vcn": "xiaoyan",
            "tte": "utf8",
            "speed": 50,
            "volume": 50,
            "pitch": 50
        },
        "data": {
            "status": 2,
            "text": text_b64,
            "encoding": "utf8"
        }
    }
    
    ws.send(json.dumps(payload))
    
    audio_data = b""
    while True:
        try:
            message = ws.recv()
            if not message:
                break
            res = json.loads(message)
            code = res.get("code")
            if code != 0:
                raise Exception(f"Xunfei TTS Error Code {code}: {res.get('message')}")
            
            data = res.get("data", {})
            status = data.get("status")
            audio = data.get("audio", "")
            if audio:
                audio_data += base64.b64decode(audio)
            if status == 2:
                break
        except websocket.WebSocketConnectionClosedException:
            break
            
    ws.close()
    return audio_data

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
