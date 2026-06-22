import os
import json
import requests
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from app.ai.platform import probe_provider_connection
from app.auth_utils import get_current_username
from app.db import (
    db_get_user_providers,
    db_save_user_provider,
    db_delete_user_provider,
    db_get_model_routing,
    db_save_model_routing,
    db_log_agent_action,
    db_get_search_settings,
    db_save_search_settings,
    db_get_prompt_templates,
    db_save_prompt_template,
    db_set_active_prompt_template,
    db_delete_prompt_template
)

router = APIRouter()

class SearchSettingsRequest(BaseModel):
    search_enabled: bool
    search_provider: str
    api_key: Optional[str] = None
    max_results: int

class PromptTemplateSaveRequest(BaseModel):
    template_id: str
    template_name: str
    system_prompt: str
    is_active: Optional[bool] = False

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
        success, message = probe_provider_connection(api_base, api_key, enabled_model)
        return {"success": success, "message": message}
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

@router.get("/search")
def get_search_settings_api(current_username: str = Depends(get_current_username)):
    config = db_get_search_settings(current_username)
    if config.get("api_key"):
        config["api_key"] = "••••••••"
    return config

@router.post("/search")
def save_search_settings_api(request: SearchSettingsRequest, current_username: str = Depends(get_current_username)):
    api_key_to_save = request.api_key or ""
    if api_key_to_save == "••••••••":
        existing = db_get_search_settings(current_username)
        api_key_to_save = existing.get("api_key", "")
        
    settings_data = request.model_dump()
    settings_data["api_key"] = api_key_to_save
    
    db_save_search_settings(current_username, settings_data)
    db_log_agent_action(current_username, "主管智能体", "联网搜索配置已更新。", "info")
    return {"status": "success", "message": "Search settings saved."}

@router.get("/prompt-templates")
def get_prompt_templates_api(current_username: str = Depends(get_current_username)):
    return db_get_prompt_templates(current_username)

@router.post("/prompt-templates")
def save_prompt_template_api(request: PromptTemplateSaveRequest, current_username: str = Depends(get_current_username)):
    db_save_prompt_template(current_username, request.model_dump())
    db_log_agent_action(current_username, "主管智能体", f"提示词模板「{request.template_name}」已保存。", "info")
    return {"status": "success", "message": "Prompt template saved."}

@router.put("/prompt-templates/{template_id}/active")
def set_active_prompt_template_api(template_id: str, current_username: str = Depends(get_current_username)):
    templates = db_get_prompt_templates(current_username)
    match = next((t for t in templates if t["template_id"] == template_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Template not found.")
    
    db_set_active_prompt_template(current_username, template_id)
    db_log_agent_action(current_username, "主管智能体", f"已切换并启用提示词模板「{match['template_name']}」。", "info")
    return {"status": "success", "message": f"Template {template_id} set as active."}

@router.delete("/prompt-templates/{template_id}")
def delete_prompt_template_api(template_id: str, current_username: str = Depends(get_current_username)):
    if template_id in ["academic", "encouraging", "coder", "socratic"]:
        raise HTTPException(status_code=400, detail="Cannot delete system default templates.")
        
    db_delete_prompt_template(current_username, template_id)
    db_log_agent_action(current_username, "主管智能体", f"已删除提示词模板: {template_id}", "info")
    return {"status": "success", "message": "Template deleted successfully."}

