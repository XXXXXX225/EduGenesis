# -*- coding: utf-8 -*-
import requests
import re
import json
from typing import List
from app.models import UserProfile
from app.llm_client import get_route_llm_params, extract_json_block

TOPIC_KEYWORDS = {
    "网络": ["网络", "socket", "tcp", "udp", "http", "ip", "port", "端口", "通信", "connect", "web", "ftp", "dns"],
    "数据库": ["数据库", "sql", "sqlite", "mysql", "db", "query", "select", "insert", "update", "delete", "table"],
    "文件": ["文件", "file", "read", "write", "open", "io", "path", "with", "txt", "csv", "json"],
    "爬虫": ["爬虫", "spider", "crawl", "requests", "bs4", "beautifulsoup", "selenium", "scrapy", "xpath", "html"],
    "线性代数": ["线性代数", "矩阵", "向量", "eigen", "matrix", "vector", "dot product", "点积", "转置", "行列式"],
    "微积分": ["微积分", "导数", "偏导", "微分", "gradient", "derivative", "calculus", "极值"],
    "回归": ["回归", "regression", "最小二乘", "mse", "均方误差", "linear", "logistic"],
    "梯度": ["梯度", "gradient", "desc", "学习率", "lr"],
    "神经网络": ["神经网络", "nn", "neural", "perceptron", "深度学习", "deep learning", "激活函数", "权重", "偏置"],
    "反向传播": ["反向传播", "求导", "backprop", "链式", "chain rule", "误差传播"],
    "正则化": ["正则化", "过拟合", "regularization", "overfit", "l1", "l2", "惩罚", "dropout"],
    "函数": ["函数", "def", "func", "parameter", "argument", "返回值", "return"],
    "循环": ["循环", "for", "while", "loop", "break", "continue", "迭代"],
    "判断": ["条件", "判断", "if", "else", "elif", "分支", "控制流"],
    "数据结构": ["数据结构", "列表", "元组", "字典", "集合", "list", "dict", "tuple", "set", "key", "value", "index"],
    "变量": ["变量", "variable", "assign", "赋值", "命名空间", "作用域", "global", "nonlocal"],
    "环境": ["环境", "env", "vscode", "python安装", "interpreter", "解释器", "pip", "path"],
    "部署": ["部署", "deploy", "server", "docker", "cloud", "云服务", "上线"],
    "异常": ["异常", "exception", "try", "except", "raise", "error", "报错", "调试", "traceback"]
}

def clean_html_tags(text: str) -> str:
    """去除字符串中的 HTML 标签，如 B站搜索结果中的 <em class="keyword"> 标签"""
    if not text:
        return ""
    return re.sub(r'<[^>]+>', '', text)

def format_play_count(play_val) -> str:
    """格式化播放数量为易读的字符串"""
    if play_val is None:
        return "0"
    try:
        play_num = int(play_val)
        if play_num >= 10000000:
            return f"{play_num / 10000000:.1f}千万"
        elif play_num >= 10000:
            return f"{play_num / 10000:.1f}万"
        return str(play_num)
    except Exception:
        return str(play_val)

def parse_duration_to_seconds(duration_str: str) -> int:
    """
    将 B站视频时长字符串（如 '02:44', '12:30', '1:12:30'）解析为秒数
    """
    if not duration_str:
        return 0
    try:
        parts = list(map(int, duration_str.split(':')))
        if len(parts) == 2:
            return parts[0] * 60 + parts[1]
        elif len(parts) == 3:
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
    except Exception:
        pass
    return 0

def generate_optimized_search_query(node_title: str, node_description: str, username: str = "default_user") -> str:
    """
    通过 LLM 分析路径节点的标题与描述，生成一个最聚焦、精准的 B 站搜索关键词，
    避免直接搜宽泛名词返回无关视频或长篇大论。
    """
    api_base, api_key, model = get_route_llm_params(username, "resources")
    default_query = f"Python {node_title}" if "python" not in node_title.lower() else node_title
    
    if not api_key:
        return default_query
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    system_prompt = """你是一个多智能体协同自适应教学系统中的视频检索检索词优化智能体。
你的任务是根据一个学习节点的“标题”和“描述”，为 B 站（Bilibili）视频搜索生成一个最聚焦、最精准的中文检索关键词。

生成准则：
1. 关键词必须聚焦于该节点当前需要学习的具体代码或技术点（例如将“Python网络编程”优化为“Python Socket 编程教程”）。
2. 检索词应该能搜到 10-25 分钟左右的具体实例讲解或代码实操视频，避免搜出数小时的宽泛合集。
3. 只能输出一个简短 of 搜索关键词（通常为 3-5 个中文词/英文词的组合，以空格分隔），绝对不能有任何前言、解释、标点符号或换行。"""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"节点标题: {node_title}\n节点描述: {node_description}\n请输出优化后的 B 站搜索关键词："}
        ],
        "temperature": 0.2,
        "max_tokens": 30
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=5)
        if response.status_code == 200:
            res_data = response.json()
            query = res_data["choices"][0]["message"]["content"].strip()
            query = re.sub(r'["\'\-\[\]【】\r\n]', '', query)
            if query:
                return query
    except Exception as e:
        print(f"Failed to generate optimized search query via LLM: {e}")
        
    return default_query

def select_and_recommend_videos(videos: List[dict], node_title: str, node_description: str, profile: UserProfile, username: str = "default_user") -> List[dict]:
    """
    通过 LLM 视频推荐智能体，从 B 站候选视频列表中筛选出最符合当前节点教学大纲、
    且最贴合学生“认知风格”和“常见错误模式”的 4 个精品视频，并直接生成一句话推荐评语。
    如果离线或异常，极速降级到本地规则过滤与拼接模板。
    """
    if not videos:
        return []
        
    api_base, api_key, model = get_route_llm_params(username, "resources")
    
    candidates = [
        {
            "index": idx,
            "title": v["title"],
            "duration": v["duration"],
            "author": v["author"],
            "description": v["description"][:100]
        }
        for idx, v in enumerate(videos)
    ]
    
    if api_key:
        url = f"{api_base.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        schema = {
            "type": "object",
            "properties": {
                "selected_indices": {
                    "type": "array",
                    "items": {"type": "integer"},
                    "description": "筛选出最合适的视频索引列表（最多4个，严格对应传入的候选视频 index，按推荐度从高到低排序）。"
                },
                "reasons": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "针对选中的每个视频生成的专属中文推荐理由，必须与 selected_indices 顺序完全一致。"
                }
            },
            "required": ["selected_indices", "reasons"]
        }
        
        system_prompt = f"""你是一个多智能体协同自适应教学系统中的视频推荐智能体（Video Recommendation Agent）。
你的任务是从给定的 B 站视频候选列表中，筛选出最契合当前节点教学目标，且最适合当前学生画像的最多 4 个视频，并生成一句话中文推荐理由。

当前节点信息：
- 标题: {node_title}
- 描述: {node_description}

学生画像特征：
- 认知风格 (Cognitive Style): {profile.cognitive_style}
- 易错模式 (Error Patterns): {json.dumps(profile.error_patterns, ensure_ascii=False)}

筛选准则：
1. 优先选择具体代码演示、案例实操的视频（时长通常在 5-30 分钟）。
2. 尽量排除与 node_description 毫不相关的视频，或数小时以上的纯大部头课程合集（如果确实没有更好的，可以选长视频但绝不能选无关视频）。
3. 排除小于 5 分钟的课程推广、短宣传片。
4. 推荐理由应针对该学生的认知风格定制，控制在 40-60 字之间，语气专业且鼓励。

你必须仅返回一个符合指定 Schema 要求的 JSON 对象，绝对不能包含任何解释、```json 标记等多余文本。"""

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"候选视频列表: {json.dumps(candidates, ensure_ascii=False)}\n请输出符合格式的筛选与推荐 JSON：{json.dumps(schema, ensure_ascii=False)}"}
            ],
            "temperature": 0.2
        }
        
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
                parsed = json.loads(content)
                
                selected_indices = parsed.get("selected_indices", [])
                reasons = parsed.get("reasons", [])
                
                selected_videos = []
                for idx, selected_idx in enumerate(selected_indices):
                    if selected_idx < len(videos) and idx < len(reasons):
                        video = videos[selected_idx].copy()
                        video["recommend_reason"] = reasons[idx]
                        selected_videos.append(video)
                        
                if selected_videos:
                    return selected_videos[:4]
        except Exception as e:
            print(f"LLM Video selection and recommendation failed: {e}. Falling back to rule templates.")

    # 规则过滤兜底逻辑：如果大模型出错或网络超时，退回至原有 Python 规则过滤
    matching_keywords = []
    node_title_lower = node_title.lower()
    for key, keywords in TOPIC_KEYWORDS.items():
        if key in node_title_lower:
            matching_keywords.extend(keywords)
            
    relevant_videos = []
    if matching_keywords:
        for v in videos:
            title_desc = f"{v['title']} {v['description']}".lower()
            if any(kw in title_desc for kw in matching_keywords):
                relevant_videos.append(v)
        if len(relevant_videos) < 2:
            relevant_videos = videos
    else:
        relevant_videos = videos

    filtered = [v for v in relevant_videos if 300 <= parse_duration_to_seconds(v["duration"]) <= 1200]
    if len(filtered) < 2:
        filtered = [v for v in relevant_videos if 300 <= parse_duration_to_seconds(v["duration"]) <= 1800]
    if len(filtered) < 2:
        filtered = [v for v in relevant_videos if 300 <= parse_duration_to_seconds(v["duration"]) <= 2700]
    if len(filtered) < 2:
        filtered = [v for v in relevant_videos if parse_duration_to_seconds(v["duration"]) >= 300]
    if len(filtered) == 0:
        filtered = relevant_videos

    style = profile.cognitive_style.lower()
    final_videos = []
    for v in filtered[:4]:
        v_copy = v.copy()
        title = v_copy["title"]
        if "practical" in style or "coding" in style:
            v_copy["recommend_reason"] = f"该视频通过手把手实操精讲了《{title}》的核心操作，契合您的实操编码风格。建议配合左侧沙盒边写边码，加深肌肉记忆。"
        elif "visual" in style or "guided" in style:
            v_copy["recommend_reason"] = f"视频配有直观的图表与大纲引导，讲解结构清晰，契合您的视觉引导风格。能帮助您在脑海中快速建立知识拓扑。"
        elif "theoretical" in style or "self" in style:
            v_copy["recommend_reason"] = f"该教程对《{title}》的底层机制和公式原理进行了深入剖析，契合您的理论探究风格，适合作为概念的辅助论证。"
        else:
            v_copy["recommend_reason"] = f"该视频属于 B站 高分精选教程，全面覆盖了《{title}》的重难点知识，语言通俗易懂，强烈建议结合本章课本一同修读。"
        final_videos.append(v_copy)
        
    return final_videos

def search_bilibili_videos(node_title: str) -> List[dict]:
    """
    通过 Bilibili 公开搜索接口，检索并进行相关性与时长过滤，保持向前兼容。
    """
    keyword = f"Python {node_title}" if "python" not in node_title.lower() else node_title
    url = f"https://api.bilibili.com/x/web-interface/search/all/v2?keyword={encode_keyword(keyword)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://search.bilibili.com/"
    }
    
    candidates = []
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.encoding = 'utf-8'
        if response.status_code == 200:
            res_json = response.json()
            if res_json.get("code") == 0:
                result = res_json.get("data", {}).get("result", [])
                video_data = []
                for item in result:
                    if isinstance(item, dict) and item.get("result_type") == "video":
                        video_data = item.get("data", [])
                        break
                for v in video_data:
                    raw_pic = v.get("pic", "")
                    pic_url = f"https:{raw_pic}" if raw_pic.startswith("//") else raw_pic
                    candidates.append({
                        "bvid": v.get("bvid", ""),
                        "title": clean_html_tags(v.get("title", "")),
                        "pic": pic_url,
                        "author": v.get("author", "哔哩哔哩学习助手"),
                        "play": format_play_count(v.get("play", 0)),
                        "duration": v.get("duration", "00:00"),
                        "description": clean_html_tags(v.get("description", ""))
                    })
    except Exception as e:
        print(f"Error in search_bilibili_videos: {e}")
        
    matching_keywords = []
    node_title_lower = node_title.lower()
    for key, keywords in TOPIC_KEYWORDS.items():
        if key in node_title_lower:
            matching_keywords.extend(keywords)
            
    relevant_videos = []
    if matching_keywords:
        for v in candidates:
            title_desc = f"{v['title']} {v['description']}".lower()
            if any(kw in title_desc for kw in matching_keywords):
                relevant_videos.append(v)
        if len(relevant_videos) < 2:
            relevant_videos = candidates
    else:
        relevant_videos = candidates

    filtered = [v for v in relevant_videos if 300 <= parse_duration_to_seconds(v["duration"]) <= 1200]
    if len(filtered) < 2:
        filtered = [v for v in relevant_videos if 300 <= parse_duration_to_seconds(v["duration"]) <= 1800]
    if len(filtered) < 2:
        filtered = [v for v in relevant_videos if 300 <= parse_duration_to_seconds(v["duration"]) <= 2700]
    if len(filtered) < 2:
        filtered = [v for v in relevant_videos if parse_duration_to_seconds(v["duration"]) >= 300]
    if len(filtered) == 0:
        filtered = relevant_videos
        
    return filtered[:4]

def get_video_recommendations_for_node(node_title: str, node_description: str, profile: UserProfile, username: str = "default_user") -> List[dict]:
    """
    一键式高层视频推荐智能体接口。
    1. 调用 LLM 优化搜索关键词。
    2. 使用优化后的关键词检索 B 站视频候选。
    3. 调用 LLM 筛选排序候选视频，并生成个性化推荐评语。
    """
    query = generate_optimized_search_query(node_title, node_description, username)
    if not query.strip():
        query = node_title
        
    print(f"[Video Agent] Optimized search query for '{node_title}': '{query}'")
    
    keyword = f"Python {query}" if "python" not in query.lower() else query
    url = f"https://api.bilibili.com/x/web-interface/search/all/v2?keyword={encode_keyword(keyword)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://search.bilibili.com/"
    }
    
    candidates = []
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.encoding = 'utf-8'
        if response.status_code == 200:
            res_json = response.json()
            if res_json.get("code") == 0:
                result = res_json.get("data", {}).get("result", [])
                video_data = []
                for item in result:
                    if isinstance(item, dict) and item.get("result_type") == "video":
                        video_data = item.get("data", [])
                        break
                
                for v in video_data:
                    raw_pic = v.get("pic", "")
                    pic_url = f"https:{raw_pic}" if raw_pic.startswith("//") else raw_pic
                    candidates.append({
                        "bvid": v.get("bvid", ""),
                        "title": clean_html_tags(v.get("title", "")),
                        "pic": pic_url,
                        "author": v.get("author", "哔哩哔哩学习助手"),
                        "play": format_play_count(v.get("play", 0)),
                        "duration": v.get("duration", "00:00"),
                        "description": clean_html_tags(v.get("description", ""))
                    })
    except Exception as e:
        print(f"Failed to fetch candidate videos for query '{query}': {e}")
        
    if not candidates:
        # 降级：直接通过原始 search_bilibili_videos 爬取候选（包含自带过滤）
        return search_bilibili_videos(node_title)

    # 步骤 3：AI 筛选及推荐理由生成
    return select_and_recommend_videos(candidates, node_title, node_description, profile, username)

def encode_keyword(keyword: str) -> str:
    """简单的 URL 编码辅助函数"""
    from urllib.parse import quote
    return quote(keyword)

def generate_video_recommendations(videos: List[dict], profile: UserProfile, username: str = "default_user") -> List[dict]:
    """
    遗留接口，做向前兼容用。直接代理给 select_and_recommend_videos，利用通用描述占位。
    """
    return select_and_recommend_videos(
        videos=videos, 
        node_title="Python主题", 
        node_description="Python课程精讲", 
        profile=profile, 
        username=username
    )
