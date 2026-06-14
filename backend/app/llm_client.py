import os
import re
import json
import requests
from typing import List, Optional
from pydantic import BaseModel
from app.models import UserProfile
from app.db import (
    db_log_agent_action,
    db_get_model_routing,
    db_get_user_providers
)

def extract_json_block(text: str) -> str:
    text_clean = text.strip()
    # Find markdown block
    code_block_match = re.search(r'```(?:json)?\s*(.*?)\s*```', text_clean, re.DOTALL)
    if code_block_match:
        return code_block_match.group(1).strip()
    # Otherwise find curly braces
    braces_match = re.search(r'(\{.*\})', text_clean, re.DOTALL)
    if braces_match:
        return braces_match.group(1).strip()
    return text_clean

def get_route_llm_params(username: str, role_field: str):
    """
    role_field: 'chat', 'planner', 'diagnostics', 'resources'
    Returns: (api_base, api_key, model_name)
    """
    try:
        routing = db_get_model_routing(username)
        provider_id = routing.get(f"{role_field}_provider_id", "xunfei")
        model_name = routing.get(f"{role_field}_model", "generalv3.5")
        
        providers = db_get_user_providers(username)
        provider = next((p for p in providers if p["provider_id"] == provider_id), None)
        
        if provider and provider.get("is_enabled"):
            api_base = provider["api_base"]
            api_key = provider["api_key"]
            if api_key == "env":
                api_key = os.getenv("LLM_API_KEY", "")
            return api_base, api_key, model_name
    except Exception as e:
        print(f"Error fetching routed LLM params for {username} - {role_field}: {e}")
        
    # Fallback default: Xunfei Spark environment parameters
    api_key = os.getenv("LLM_API_KEY", "")
    api_base = os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1")
    model_name = os.getenv("LLM_MODEL", "generalv3.5")
    return api_base, api_key, model_name

def call_llm_structured_analysis(messages: List[BaseModel], current_profile: UserProfile, username: str = "default_user"):
    api_base, api_key, model = get_route_llm_params(username, "chat")
    
    if not api_key:
        return None
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    current_profile_json = json.dumps(current_profile.model_dump(), ensure_ascii=False)
    system_prompt = f"""You are the Orchestration Analyzer for an adaptive educational multi-agent system.
Your job is to analyze the user's latest input within the context of the chat history and decide if the student's profile or learning subject needs adjustment.

Current Student Profile:
{current_profile_json}

Output STRICTLY a JSON object (no markdown formatting, no code block backticks, no preamble) matching this schema:
{{
  "profile_updates": {{
    "knowledge_base": null or int(0-100),
    "learning_pace": null or int(0-100),
    "cognitive_style": null or str,
    "error_patterns": null or list of str,
    "learning_goals": null or list of str,
    "engagement": null or int(0-100)
  }},
  "switch_to_subject": null or "Python Basics" or "Machine Learning"
}}"""

    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        api_messages.append({"role": msg.role, "content": msg.content})
        
    payload = {
        "model": model,
        "messages": api_messages,
        "temperature": 0.1
    }
    
    # Enforce JSON object formatting where supported
    model_lower = model.lower()
    base_lower = api_base.lower()
    if "gpt" in model_lower or "deepseek" in model_lower or "openrouter" in base_lower or "siliconflow" in base_lower:
        payload["response_format"] = {"type": "json_object"}
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"]
            content = extract_json_block(content)
            return json.loads(content)
    except Exception as e:
        print(f"LLM Structured Analysis failed: {e}")
    return None

def call_llm_stream_tutor(messages: List[BaseModel], current_profile: UserProfile, username: str = "default_user"):
    api_base, api_key, model = get_route_llm_params(username, "chat")
    
    if not api_key:
        return None
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    current_profile_json = json.dumps(current_profile.model_dump(), ensure_ascii=False)
    system_prompt = f"""You are the Personal AI Tutor Agent in an adaptive learning system.
You are talking to the student. Your tone should be encouraging, professional, and clear.
Support formatting in markdown (bold, lists, headers) but keep responses concise and focused (max 150 words).

Current Student Profile (Tailor your explanation to their level and style):
{current_profile_json}"""

    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        api_messages.append({"role": msg.role, "content": msg.content})
        
    payload = {
        "model": model,
        "messages": api_messages,
        "temperature": 0.7,
        "stream": True
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, stream=True, timeout=12)
        return response
    except Exception as e:
        print(f"LLM Stream initiation failed: {e}")
    return None

def call_llm_resource_agent(topic: str, resources: List[str], profile: UserProfile, username: str = "default_user", context: str = ""):
    api_base, api_key, model = get_route_llm_params(username, "resources")
    
    if not api_key:
        return {}
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    schema = {
        "type": "object",
        "properties": {},
        "required": []
    }
    
    properties = {}
    required = []
    
    if "pdf" in resources:
        properties["pdf"] = {
            "type": "string", 
            "description": "关于该主题的高质量、长篇且详尽的Markdown格式课程笔记（至少800-1000字，包含引言、核心理论、代码演示、常见误区与总结等模块，使用Markdown标题）。所有文字内容必须是中文！"
        }
        required.append("pdf")
    if "slide" in resources:
        properties["slide"] = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "单页幻灯片中文标题"},
                    "content": {"type": "string", "description": "该页幻灯片的详细中文讲解内容，约80-120字。"}
                },
                "required": ["title", "content"]
            },
            "description": "一整套结构完整的演示幻灯片（包含至少6-8页，分步详细讲解该主题，文字必须是中文）。"
        }
        required.append("slide")
    if "quiz" in resources:
        properties["quiz"] = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "具有挑战性的中文选择题题干"},
                    "options": {"type": "array", "items": {"type": "string"}, "description": "正好4个中文选项"},
                    "answer": {"type": "integer", "description": "正确选项的索引（从0开始）"},
                    "explanation": {"type": "string", "description": "详尽的中文解析，说明正确原因及其他选项的避坑分析。"}
                },
                "required": ["question", "options", "answer", "explanation"]
            },
            "description": "包含正好5道高难度、高质量的中文选择题，定制用于测试该风格学生。"
        }
        required.append("quiz")
    if "code" in resources:
        properties["code"] = {"type": "string", "description": "完整的 Python 源代码脚本，包含详细的中文注释、docstring、以及完整的 pytest 测试用例。"}
        required.append("code")
    if "mindmap" in resources:
        properties["mindmap"] = {"type": "string", "description": "以 graph TD 开头的 Mermaid 流程图语法，代表该主题的详细中文知识脑图，包含至少6-8个中文节点。"}
        required.append("mindmap")
        
    schema["properties"] = properties
    schema["required"] = required
    
    system_prompt = f"""你是一个多智能体教育网络中的多模态资源生成智能体（Multimodal Resource Agent）。
你的任务是为主题 "{topic}" 生成极其专业、详尽且针对学生认知特征定制的中文学习资源。

为确保生成的内容极具学术深度，适合高等教育：
- PDF课程笔记必须非常长且详尽（至少 800-1000 字的 Markdown 格式笔记）。
- 幻灯片（Slide）必须包含至少 6-8 页，每一页都要有详细的中文原理解析（每页 80-120 字）。
- 测验（Quiz）必须包含正好 5 道高难度、高质量的中文选择题，包含中文题干、4个选项及中文解析。
- 思维导图（Mindmap）必须包含至少 6-8 个中文节点的 Mermaid 流程图。
- 所有的内容、文本、题目、注释、解析等必须是简体中文！

学生画像特征:
- 认知风格: {profile.cognitive_style}
- 常见错误模式: {json.dumps(profile.error_patterns, ensure_ascii=False)}
- 首选学习目标: {json.dumps(profile.learning_goals, ensure_ascii=False)}"""

    if context:
        system_prompt += f"\n请必须参考以下高校初始课程知识库中关于该章节的权威内容大纲来生成资源：\n{context}\n"

    system_prompt += "\n你必须仅返回一个符合指定 Schema 要求的 JSON 对象，不能包含任何前言、后记、Markdown 标记如 ```json 等多余文本。所有生成的文字必须使用简体中文。"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请为主题 '{topic}' 生成纯中文的学习资源，符合以下 Schema 定义: {json.dumps(schema, ensure_ascii=False)}"}
        ],
        "temperature": 0.3
    }
    
    model_lower = model.lower()
    base_lower = api_base.lower()
    if "gpt" in model_lower or "deepseek" in model_lower or "openrouter" in base_lower or "siliconflow" in base_lower:
        payload["response_format"] = {"type": "json_object"}
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=35)
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"]
            content = extract_json_block(content)
            return json.loads(content)
    except Exception as e:
        print(f"Failed to fetch resources from LLM: {e}")
        
    return {}

def call_llm_path_planner(goals: List[str], style: str, username: str = "default_user") -> List[dict]:
    api_base, api_key, model = get_route_llm_params(username, "planner")
    
    db_log_agent_action(username, "路径智能体", f"正在规划路径。大模型配置: Key={api_key[:10] if api_key else 'None'}..., Base={api_base}, Model={model}", "info")
    
    if not api_key:
        db_log_agent_action(username, "路径智能体", "路径规划中止: 未检测到有效的大模型服务 Key。", "warning")
        return []
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    goals_str = ", ".join(goals)
    
    system_prompt = f"""你是一个多智能体教育网络中的路径规划智能体（Path Planning Agent）。
Your task is to generate exactly 8 customized learning nodes for the student.
学生的学习目标: {goals_str}
学生的认知风格: {style}

必须生成符合以下 JSON 格式的数据。所有的标题（title）和描述（description）必须使用中文（简体中文）生成！
请确保生成的 JSON 格式完全正确（请勿包含任何 markdown 标记如 ```json ，只输出纯 JSON 字符串）：
{{
  "nodes": [
    {{
      "id": "node1",
      "title": "节点1的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["pdf", "code", "video"]
    }},
    {{
      "id": "node2",
      "title": "节点2的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["slide", "pdf", "quiz", "video"]
    }},
    {{
      "id": "node3",
      "title": "节点3的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["slide", "quiz", "code", "video"]
    }},
    {{
      "id": "node4",
      "title": "节点4的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["slide", "quiz", "video"]
    }},
    {{
      "id": "node5",
      "title": "节点5的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["slide", "pdf", "quiz", "code", "video"]
    }},
    {{
      "id": "node6",
      "title": "节点6的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["slide", "pdf", "mindmap", "code", "video"]
    }},
    {{
      "id": "node7",
      "title": "节点7的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["code", "quiz", "video"]
    }},
    {{
      "id": "node8",
      "title": "节点8的简短中文标题",
      "description": "结合学生认知风格 and 学习目标定制的简短中文描述",
      "resources": ["code", "quiz", "video"]
    }}
  ]
}}

生成准则:
1. 必须生成正好 8 个节点，ID 依次为 "node1", "node2", ..., "node8"。
2. 节点的 resources 列表必须包含以下资源类型中的 2 到 4 个: "pdf", "slide", "quiz", "code", "mindmap", "video"。且强烈建议在每个节点中都包含 "video" 资源以展示精品教学视频。
3. 所有的标题（title）和描述（description）必须是简体中文。
4. 节点内容必须紧密结合学生的学习目标（{goals_str}） and 认知风格（{style}）。
"""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "现在请立即生成这 8 个中文学习路径关卡。"}
        ],
        "temperature": 0.4
    }
    
    model_lower = model.lower()
    base_lower = api_base.lower()
    if "gpt" in model_lower or "deepseek" in model_lower or "openrouter" in base_lower or "siliconflow" in base_lower:
        payload["response_format"] = {"type": "json_object"}
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"]
            content = extract_json_block(content)
            parsed = json.loads(content)
            nodes = parsed.get("nodes", [])
            db_log_agent_action(username, "路径智能体", f"大模型生成成功。返回节点数量: {len(nodes)}", "info")
            return nodes
        else:
            db_log_agent_action(username, "路径智能体", f"大模型接口请求失败，HTTP 状态码: {response.status_code}，响应: {response.text[:200]}", "error")
    except Exception as e:
        db_log_agent_action(username, "路径智能体", f"调用大模型路径规划异常: {str(e)}", "error")
        
    return []
