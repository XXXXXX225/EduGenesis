import os
import json
import requests
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth_utils import get_current_username
from app.db import (
    db_get_user_providers,
    db_save_user_provider,
    db_delete_user_provider,
    db_get_model_routing,
    db_save_model_routing,
    db_log_agent_action
)

router = APIRouter()

class ModelItem(BaseModel):
    name: str
    enabled: bool
    tags: List[str]

class ProviderSaveRequest(BaseModel):
    provider_id: str
    provider_name: str
    api_base: str
    api_key: str
    is_enabled: bool
    models: List[ModelItem]

class ModelRoutingSaveRequest(BaseModel):
    chat_provider_id: str
    chat_model: str
    planner_provider_id: str
    planner_model: str
    diagnostics_provider_id: str
    diagnostics_model: str
    resources_provider_id: str
    resources_model: str

@router.get("/providers")
def get_providers(current_username: str = Depends(get_current_username)):
    providers_list = db_get_user_providers(current_username)
    res = []
    for p in providers_list:
        try:
            models_parsed = json.loads(p["models"])
        except Exception:
            models_parsed = []
            
        res.append({
            "provider_id": p["provider_id"],
            "provider_name": p["provider_name"],
            "api_base": p["api_base"],
            # Mask the API key in the response for security
            "api_key": "••••••••" if p["api_key"] and p["api_key"] != "env" else p["api_key"],
            "is_enabled": bool(p["is_enabled"]),
            "models": models_parsed
        })
    return res

@router.post("/providers")
def save_provider(request: ProviderSaveRequest, current_username: str = Depends(get_current_username)):
    # If API key is masked and we are editing an existing provider, keep the old API key
    api_key_to_save = request.api_key
    if api_key_to_save == "••••••••":
        existing = db_get_user_providers(current_username)
        match = next((p for p in existing if p["provider_id"] == request.provider_id), None)
        if match:
            api_key_to_save = match["api_key"]
        else:
            raise HTTPException(status_code=400, detail="Cannot save masked API key for new provider.")

    provider_data = {
        "provider_id": request.provider_id,
        "provider_name": request.provider_name,
        "api_base": request.api_base,
        "api_key": api_key_to_save,
        "is_enabled": 1 if request.is_enabled else 0,
        "models": json.dumps([m.model_dump() for m in request.models], ensure_ascii=False)
    }
    
    db_save_user_provider(current_username, provider_data)
    db_log_agent_action(current_username, "主管智能体", f"大模型供应商配置已更新: [{request.provider_name}]", "info")
    return {"status": "success", "message": "Provider configuration saved."}

@router.delete("/providers/{provider_id}")
def delete_provider(provider_id: str, current_username: str = Depends(get_current_username)):
    if provider_id == "xunfei":
        raise HTTPException(status_code=400, detail="Cannot delete default Xunfei Spark provider.")
        
    db_delete_user_provider(current_username, provider_id)
    db_log_agent_action(current_username, "主管智能体", f"已删除大模型供应商: [{provider_id}]", "info")
    return {"status": "success", "message": "Provider deleted successfully."}

@router.post("/providers/{provider_id}/test")
def test_provider_connection(provider_id: str, current_username: str = Depends(get_current_username)):
    providers = db_get_user_providers(current_username)
    provider = next((p for p in providers if p["provider_id"] == provider_id), None)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found.")
    
    api_base = provider["api_base"]
    api_key = provider["api_key"]
    if api_key == "env":
        api_key = os.getenv("LLM_API_KEY", "")
        
    if not api_key:
        return {"success": False, "message": "API Key is empty."}
        
    try:
        models_list = json.loads(provider["models"])
    except Exception:
        models_list = []
        
    # Pick first enabled model
    enabled_model = next((m["name"] for m in models_list if m.get("enabled")), None)
    if not enabled_model:
        # Fallback to the first model in list if none is explicitly checked
        enabled_model = models_list[0]["name"] if models_list else "gpt-3.5-turbo"
        
    try:
        url = f"{api_base.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": enabled_model,
            "messages": [{"role": "user", "content": "hello"}],
            "max_tokens": 5
        }
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            return {"success": True, "message": "连接测试成功！"}
        else:
            return {"success": False, "message": f"连接失败 (HTTP {res.status_code}): {res.text[:150]}"}
    except Exception as e:
        return {"success": False, "message": f"请求异常: {str(e)}"}

@router.get("/routing")
def get_routing(current_username: str = Depends(get_current_username)):
    return db_get_model_routing(current_username)

@router.post("/routing")
def save_routing(request: ModelRoutingSaveRequest, current_username: str = Depends(get_current_username)):
    routing_data = request.model_dump()
    db_save_model_routing(current_username, routing_data)
    db_log_agent_action(current_username, "主管智能体", "系统智能体模型绑定路由规则已重置。", "info")
    return {"status": "success", "message": "Model routing saved successfully."}
