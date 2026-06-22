import json
import re
from typing import Optional

from pydantic import BaseModel

from app.ai.platform import (
    extract_json_block,
    get_capability_config,
    request_json_completion,
    request_stream_completion,
    request_text_completion,
)
from app.db import db_get_all_registered_courses, db_log_agent_action
from app.models import UserProfile


def analyze_chat_profile(messages: list[BaseModel], current_profile: UserProfile, username: str = "default_user"):
    try:
        registered_courses = db_get_all_registered_courses()
    except Exception:
        registered_courses = [
            {"course_id": "python_basics", "display_name": "Python Basics", "keywords": ["python", "basics"]},
            {"course_id": "machine_learning", "display_name": "Machine Learning", "keywords": ["machine learning", "ml"]},
        ]

    course_options_lines = []
    valid_display_names = []
    for course in registered_courses:
        keywords = ", ".join(course["keywords"][:6]) if course["keywords"] else course["display_name"]
        course_options_lines.append(
            f'  - "{course["display_name"]}" (course_id: {course["course_id"]}, keywords: {keywords})'
        )
        valid_display_names.append(course["display_name"])

    system_prompt = f"""You are the Orchestration Analyzer for an adaptive educational multi-agent system.
Your job is to analyze the user's latest input within the context of the chat history and decide if the student's profile or learning subject needs adjustment.

Current Student Profile:
{json.dumps(current_profile.model_dump(), ensure_ascii=False)}

Registered Courses (use these display_name values for switch_to_subject if they match):
{"\n".join(course_options_lines)}

IMPORTANT RULES for switch_to_subject:
- If the student expresses intent to learn or study a topic that matches any registered course above, set switch_to_subject to EXACTLY the corresponding display_name.
- If the student expresses a clear intent to learn a new subject or course that is NOT listed in the registered courses above (e.g., "我想学线性代数", "我想学习微积分"), you MUST set "switch_to_subject" to the name of that new subject (e.g., "线性代数" or "微积分") in Simplified Chinese. This allows the system to automatically generate, plan and register the new course route on-the-fly.
- If the student's input is a regular chat, question, or does not indicate switching to a new learning goal/subject, set "switch_to_subject" to null.

Output STRICTLY a JSON object (no markdown formatting) matching this schema:
{{
  "profile_updates": {{
    "knowledge_base": null or int(0-100),
    "learning_pace": null or int(0-100),
    "cognitive_style": null or str,
    "error_patterns": null or list of str,
    "learning_goals": null or list of str,
    "engagement": null or int(0-100)
  }},
  "switch_to_subject": null or str (either one of the display_name values above, or the name of a new subject to register)
}}"""

    api_messages = [{"role": "system", "content": system_prompt}]
    api_messages.extend({"role": msg.role, "content": msg.content} for msg in messages)
    return request_json_completion(username, "chat", api_messages, temperature=0.1, timeout=8)


def stream_tutor_reply(
    messages: list[BaseModel],
    current_profile: UserProfile,
    username: str = "default_user",
    videos_context: Optional[list[dict]] = None,
    tutor_personality: Optional[str] = None,
    knowledge_context: Optional[str] = None,
):
    active_prompt_text = ""
    try:
        from app.db import db_get_prompt_templates
        templates = db_get_prompt_templates(username)
        active_t = next((t for t in templates if t.get("is_active")), None)
        if active_t:
            active_prompt_text = active_t.get("system_prompt", "")
    except Exception as e:
        print(f"Error loading prompt template: {e}")

    if not active_prompt_text:
        active_prompt_text = """你是一个自适应学习系统中的个人AI导师智能体。
你正在与学生对话。你的语气应该是鼓励性的、专业的、清晰的。
支持使用 Markdown 格式（加粗、列表、标题），但回答要保持简明扼要，控制在 150 字以内。"""

    system_prompt = f"""{active_prompt_text}

学生画像特征（请根据学生的水平和认知风格调整你的解释）：
{json.dumps(current_profile.model_dump(), ensure_ascii=False)}

【强制要求】：当合适的时候，你可以在回答中嵌入交互式教育资源卡片。必须且只能使用以下特定的标签格式（直接写在回答文本里，不要用 markdown 代码块包裹标签）：
1. 测验卡片：[QUIZ: {{"question": "题目", "options": ["选项A", "选项B", ...], "answer": 0, "explanation": "解析内容"}}]
2. 视频推荐卡片：[VIDEO_RECOMMEND: {{"bvid": "BVxxx", "title": "视频标题", "pic": "图片url", "play": "播放量", "duration": "时长", "reason": "推荐理由"}}]
3. 知识思维导图卡片：[MINDMAP: <以 graph TD 或 graph LR 开始的 Mermaid 流程图代码>]
4. 代码沙箱卡片：[CODE: python | <Python 源代码>]
5. 幻灯片卡片：[SLIDES: 标题1 | 内容1 --- 标题2 | 内容2]
6. PDF讲义课本：[PDF: 标题 | <详尽的 Markdown 格式讲义内容>]"""

    if knowledge_context:
        system_prompt += (
            "\n\n[以下是从课程知识库中检索到的权威学术上下文，如果相关，你必须参考此上下文来准确专业地回答学生的问题，但请自然地作为你自己的教学知识呈现，不要向学生提及你从数据库或知识库中获取了信息]：\n"
            f"{knowledge_context}"
        )
    if tutor_personality:
        system_prompt += f"\n\n你的导师个性/风格是：{tutor_personality}。"
    if videos_context:
        # 预先将 recommend_reason 转换为 reason，保证大模型能够直接使用 reason 字段
        videos_mapped = []
        for v in videos_context:
            v_copy = v.copy()
            if "recommend_reason" in v_copy:
                v_copy["reason"] = v_copy.pop("recommend_reason")
            videos_mapped.append(v_copy)
            
        system_prompt += (
            "\n\n【视频推荐任务】：这里有一些从数据库中检索到的针对当前主题的 B 站精品学习视频列表。 "
            "如果学生要求推荐视频，你必须从中选择合适的视频，并完全按照 [VIDEO_RECOMMEND: ...] 的卡片格式输出（直接把选择的视频 JSON 对象填入标签内，注意键名必须是 bvid, title, pic, play, duration, reason）：\n"
            f"{json.dumps(videos_mapped, ensure_ascii=False)}"
        )

    api_messages = [{"role": "system", "content": system_prompt}]
    api_messages.extend({"role": msg.role, "content": msg.content} for msg in messages)
    return request_stream_completion(username, "chat", api_messages, temperature=0.7, timeout=12)


def generate_learning_resources(topic: str, resources: list[str], profile: UserProfile, username: str = "default_user", context: str = ""):
    schema = {"type": "object", "properties": {}, "required": []}
    if "pdf" in resources:
        schema["properties"]["pdf"] = {
            "type": "string", 
            "description": "关于该主题的高质量、长篇且详尽的Markdown格式中文课程笔记。正文必须是中文。"
        }
        schema["required"].append("pdf")
    if "slide" in resources:
        schema["properties"]["slide"] = {
            "type": "array",
            "description": "针对该主题精心制作的多页幻灯片列表。所有页面标题与内容必须完全使用简体中文。",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "单页幻灯片的标题，必须是中文"},
                    "content": {"type": "string", "description": "单页幻灯片的具体详尽内容，必须是中文"},
                },
                "required": ["title", "content"],
            },
        }
        schema["required"].append("slide")
    if "quiz" in resources:
        schema["properties"]["quiz"] = {
            "type": "array",
            "description": "针对该主题生成的自适应单项选择题列表。所有题目、选项以及解析必须完全使用简体中文。",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "选择题的题干，必须是中文"},
                    "options": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "选择题的四个选项，选项内容必须是中文"
                    },
                    "answer": {"type": "integer", "description": "正确答案的索引，值为 0 到 3"},
                    "explanation": {"type": "string", "description": "测试题答案的详细解析，严禁使用英文。"},
                },
                "required": ["question", "options", "answer", "explanation"],
            },
        }
        schema["required"].append("quiz")
    if "code" in resources:
        schema["properties"]["code"] = {
            "type": "string",
            "description": "提供Python示例代码，包含注释/说明，包含docstring。严禁使用英文。"
        }
        schema["required"].append("code")
    if "mindmap" in resources:
        schema["properties"]["mindmap"] = {
            "type": "string",
            "description": "用Mermaid语法（以 graph TD 开始）的思维导图，所有节点文本和标签必须是中文，严禁使用英文。"
        }
        schema["required"].append("mindmap")

    system_prompt = f"""你是一个多智能体教育网络中的多模态资源生成智能体。
你的任务是为主题 "{topic}" 生成极其专业、详尽且针对学生认知特征定制的中文学习资源。

【语言强制约束】：你生成的所有资源内容（包括PDF笔记、幻灯片标题/内容、单选题干/选项/解析、代码的注释及说明、Mermaid脑图节点标签）必须完全使用简体中文。禁止返回任何未翻译的英文学习内容（除非是Python代码关键字本身）。

学生画像特征:
- 认知风格: {profile.cognitive_style}
- 常见错误模式: {json.dumps(profile.error_patterns, ensure_ascii=False)}
- 首选学习目标: {json.dumps(profile.learning_goals, ensure_ascii=False)}
"""
    if context:
        system_prompt += f"\n请必须参考以下高校初始课程知识库内容来生成资源：\n{context}\n"
    system_prompt += "\n你必须仅返回一个符合指定 Schema 要求的 JSON 对象。"

    api_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"请为主题 '{topic}' 生成纯中文学习资源，符合以下 Schema: {json.dumps(schema, ensure_ascii=False)}"},
    ]
    return request_json_completion(username, "resources", api_messages, temperature=0.3, timeout=35)


def generate_path_nodes(goals: list[str], style: str, username: str = "default_user") -> list[dict]:
    config = get_capability_config(username, "planner")
    db_log_agent_action(username, "路径智能体", f"正在规划路径。大模型配置: Key={config.api_key[:10] if config.api_key else 'None'}..., Base={config.api_base}, Model={config.model_name}", "info")
    if not config.api_key:
        db_log_agent_action(username, "路径智能体", "路径规划中止: 未检测到有效的大模型服务 Key。", "warning")
        return []

    system_prompt = f"""你是一个多智能体教育网络中的路径规划智能体。
你的任务是为学生生成正好 8 个定制的个性化学习关卡节点。
学生的学习目标: {", ".join(goals)}
学生的认知风格: {style}

【强制约束】：你必须输出一个包含 "nodes" 键的 JSON 对象，其中节点列表的数量必须精确为 8 个。所有节点的标题（title）和描述（description）必须完全使用简体中文，严禁使用任何英文。"""
    parsed = request_json_completion(
        username,
        "planner",
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "现在请立即生成这 8 个中文学习路径关卡。"},
        ],
        temperature=0.4,
        timeout=15,
    )
    nodes = (parsed or {}).get("nodes", [])
    if nodes:
        db_log_agent_action(username, "路径智能体", f"大模型生成成功。返回节点数量: {len(nodes)}", "info")
    return nodes


def generate_course_syllabus(course_name: str, description: str, username: str = "default_user") -> list[dict]:
    parsed = request_json_completion(
        username,
        "planner",
        [
            {
                "role": "system",
                "content": f"""你是一个资深的高校课程大纲与教学大纲专家。
课程名称: {course_name}
课程描述: {description}
你必须输出一个包含 "nodes" 键的 JSON 对象，该键是一个正好包含 8 个大纲章节节点的列表。
【语言约束】：所有大纲节点的标题（title）和描述（description）必须完全使用简体中文，禁止使用英文。""",
            },
            {"role": "user", "content": "现在请立即生成包含 8 个大纲章节的 JSON 对象。"},
        ],
        temperature=0.4,
        timeout=25,
    )
    return (parsed or {}).get("nodes", [])


def diagnose_runtime_error(err_title: str, err_code: str, err_msg: str, profile: UserProfile, username: str = "default_user") -> Optional[dict]:
    return request_json_completion(
        username,
        "diagnostics",
        [
            {
                "role": "system",
                "content": f"""You are the Diagnostics Agent. Analyze this python code and the runtime error it generated.
Explain the root cause and provide the clean solution code block.
Title: {err_title}
Runtime Error: {err_msg}
Student Cognitive Style: {profile.cognitive_style}

Output STRICTLY a JSON object with keys "explanation" and "solution". The explanation must be Chinese.""",
            },
            {"role": "user", "content": f"Code:\n{err_code}\n\nError:\n{err_msg}"},
        ],
        temperature=0.2,
        timeout=12,
    )


def generate_remedy_quiz(err_title: str, err_msg: str, err_code: str, profile: UserProfile, username: str = "default_user") -> Optional[dict]:
    return request_json_completion(
        username,
        "diagnostics",
        [
            {
                "role": "system",
                "content": f"""You are the Adaptive Quiz Agent. Generate a single multiple-choice question designed to test the student on the same category of mistake shown here.
Title: {err_title}
Mistake Code: {err_code}
Error Message: {err_msg}
Student Cognitive Style: {profile.cognitive_style}

Output STRICTLY a JSON object with keys question, options, answer, explanation. All natural language must be Chinese.""",
            }
        ],
        temperature=0.4,
        timeout=12,
    )


def diagnose_sandbox_submission(code: str, node_id: str, profile: UserProfile, username: str = "default_user") -> Optional[str]:
    system_prompt = f"""You are the Academic Diagnostics Agent in an adaptive multi-agent tutoring network.
Analyze the student's python code, detect bugs/errors, and provide academic diagnostic feedback.
Topic/Challenge Node: {node_id}
Student Cognitive Profile:
- Learning style: {profile.cognitive_style}
- Common error patterns: {json.dumps(profile.error_patterns, ensure_ascii=False)}

You MUST output your response in Chinese in the following EXACT structured format:
[EXPLANATION]
1. <分析第一步，推导并说明当前代码存在的具体逻辑或语法错误成因>
2. <分析第二步，梳理解题思路与优化的学术路径>
3. <分析第三步，给出防坑避错提示或根据画像风格的学习建议>

[CODE]
```python
<此处提供完整的、可直接运行并通过该关卡测试用例的修复后正确代码>
```
"""
    return request_text_completion(
        username,
        "diagnostics",
        [
            {
                "role": "system",
                "content": system_prompt,
            },
            {"role": "user", "content": f"这是我当前的代码：\n{code}"},
        ],
        temperature=0.3,
        timeout=10,
    )


def optimize_video_search_query(node_title: str, node_description: str, username: str = "default_user") -> str:
    result = request_text_completion(
        username,
        "resources",
        [
            {
                "role": "system",
                "content": """你是一个视频检索词优化智能体。
你的任务是根据一个学习节点的标题和描述，为 B 站视频搜索生成一个最聚焦、最精准的中文检索关键词。
只能输出一个简短搜索词，不能有任何解释。""",
            },
            {"role": "user", "content": f"节点标题: {node_title}\n节点描述: {node_description}\n请输出优化后的 B 站搜索关键词："},
        ],
        temperature=0.2,
        timeout=5,
        max_tokens=30,
    )
    if not result:
        return f"Python {node_title}" if "python" not in node_title.lower() else node_title
    cleaned = re.sub(r'["\'\-\[\]【】\r\n]', "", result)
    return cleaned or (f"Python {node_title}" if "python" not in node_title.lower() else node_title)


def rerank_videos_for_learning(videos: list[dict], node_title: str, node_description: str, profile: UserProfile, username: str = "default_user") -> Optional[list[dict]]:
    candidates = [
        {
            "index": idx,
            "title": video["title"],
            "duration": video["duration"],
            "author": video["author"],
            "description": video["description"][:100],
        }
        for idx, video in enumerate(videos)
    ]
    parsed = request_json_completion(
        username,
        "resources",
        [
            {
                "role": "system",
                "content": f"""你是视频推荐智能体。
当前节点标题: {node_title}
当前节点描述: {node_description}
学生认知风格: {profile.cognitive_style}
学生易错模式: {json.dumps(profile.error_patterns, ensure_ascii=False)}

请从候选视频中选择最多 4 个最合适的视频，并返回 JSON：
{{"selected_indices":[0], "reasons":["中文推荐理由"]}}""",
            },
            {"role": "user", "content": f"候选视频列表: {json.dumps(candidates, ensure_ascii=False)}"},
        ],
        temperature=0.2,
        timeout=8,
    )
    if not parsed:
        return None

    selected_videos = []
    selected_indices = parsed.get("selected_indices", [])
    reasons = parsed.get("reasons", [])
    for idx, selected_idx in enumerate(selected_indices):
        if 0 <= selected_idx < len(videos) and idx < len(reasons):
            video = videos[selected_idx].copy()
            video["recommend_reason"] = reasons[idx]
            selected_videos.append(video)
    return selected_videos[:4] or None

def optimize_rag_query(messages: list, username: str = "default_user") -> str:
    """
    Optimize the user's latest query for RAG retrieval by considering the conversation history.
    """
    def get_content(msg) -> str:
        if isinstance(msg, dict):
            return msg.get("content") or ""
        return getattr(msg, "content", "") or ""

    def get_role(msg) -> str:
        if isinstance(msg, dict):
            return msg.get("role") or ""
        return getattr(msg, "role", "") or ""

    if not messages:
        return ""

    latest_content = get_content(messages[-1])
    if len(messages) <= 1:
        return latest_content

    # Format chat history for context
    history_lines = []
    for msg in messages[:-1][-5:]:  # Take last 5 messages for context
        role = "Student" if get_role(msg) == "user" else "Tutor"
        content = get_content(msg)
        if content:
            history_lines.append(f"{role}: {content}")

    prompt = f"""You are a query optimization assistant for an educational RAG search system.
Given the conversation history and the latest student message, your job is to rewrite the student's message into a self-contained search query. The search query should contain the specific technical terms, programming concepts, or topic keywords being discussed so it can be retrieved from a textbook or syllabus.

Conversation History:
{"\n".join(history_lines)}

Latest Student Message:
{latest_content}

Rules:
1. If the latest message is already a clear, self-contained technical query (e.g. "Explain lists in Python"), return it unchanged.
2. If it is ambiguous or references previous context (e.g., "why does it fail?", "show me another example"), rewrite it to be specific and search-friendly (e.g. "Python list index out of range exception handling").
3. Keep the output query concise and focused only on the core technical keywords.
4. Output ONLY the optimized search query string. Do not include any explanations, tags, or markdown.
"""

    optimized = request_text_completion(
        username,
        "chat",
        [{"role": "user", "content": prompt}],
        temperature=0.1,
        timeout=5,
    )
    if optimized and len(optimized.strip()) > 0:
        return optimized.strip()
    return latest_content

def optimize_video_query_from_message(user_msg: str, username: str = "default_user") -> Optional[str]:
    video_keywords = ["视频", "录像", "推荐几段", "视频推荐", "b站", "bilibili", "哔哩哔哩", "推荐视频", "视频链接", "网课"]
    if not any(kw in user_msg.lower() for kw in video_keywords):
        return None

    prompt = f"""分析用户的这句对话，判断他们想要寻找什么主题的学习视频。
输出且仅输出一个最适合在 B 站搜索该主题视频的简短中文关键词（不要带任何标点、解释或 Markdown 代码块）。
用户输入: "{user_msg}"
检索关键词:"""

    result = request_text_completion(
        username,
        "resources",
        [{"role": "user", "content": prompt}],
        temperature=0.1,
        timeout=4,
        max_tokens=20
    )
    if result and result.strip() and "none" not in result.lower():
        cleaned = re.sub(r'["\'\-\[\]【】\r\n]', "", result.strip())
        return cleaned
    return None
