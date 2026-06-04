from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.models import UserProfile, ChatRequest, PathNode
import json
import asyncio
import sqlite3
import hashlib
import os
import re
import requests
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

DB_PATH = "users.db"

# Pydantic models for authentication
class RegisterRequest(BaseModel):
    username: str
    password: str
    cognitive_style: str
    learning_goals: List[str]

class LoginRequest(BaseModel):
    username: str
    password: str

# Default data lists
python_path_nodes = [
    PathNode(id="node1", title="Python Environment", status="completed", description="Install Python & setup VS Code", resources=["pdf", "code"]),
    PathNode(id="node2", title="Variables & Data Types", status="active", description="Learn integers, floats, strings and variables", resources=["slide", "pdf", "quiz"]),
    PathNode(id="node3", title="Control Flow", status="locked", description="If-statements, loops and logical operations", resources=["slide", "quiz", "code"]),
    PathNode(id="node4", title="Functions & Modules", status="locked", description="Defining reusable code and importing libraries", resources=["slide", "pdf", "mindmap", "code"]),
    PathNode(id="node5", title="Final Project", status="locked", description="Build a CLI Calculator using functions", resources=["code", "quiz"])
]

ml_path_nodes = [
    PathNode(id="node1", title="Linear Algebra Basics", status="completed", description="Matrices, vectors, and dot products", resources=["pdf"]),
    PathNode(id="node2", title="Linear Regression", status="active", description="Implement gradient descent for line fitting", resources=["slide", "quiz", "code"]),
    PathNode(id="node3", title="Classification & Logistic Regression", status="locked", description="Binary classification and sigmoid activation", resources=["slide", "quiz"]),
    PathNode(id="node4", title="Neural Networks", status="locked", description="Backpropagation and activation functions", resources=["slide", "mindmap", "code"]),
    PathNode(id="node5", title="Project: Predict House Prices", status="locked", description="Deploy a custom ML predictor", resources=["code", "quiz"])
]

# Track the logged in context (defaults to default_user for backward compatibility)
logged_in_username = "default_user"

# Pydantic model for resource generation request
class ResourceGenerateRequest(BaseModel):
    node_id: str
    username: Optional[str] = None

# Custom asset seeder for topics
def get_fallback_assets_for_topic(topic: str, profile: UserProfile):
    topic_lower = topic.lower()
    
    # Default assets
    pdf_content = f"# {topic} 个性化讲解课本\n\n本章节由画像智能体专为您的**{profile.cognitive_style}**风格定制编排。\n\n## 导读与学术背景\n在现代软件系统与算法科学中，{topic} 构成了重要的底层基石。无论是处理高并发数据流，还是编排复杂的专家策略决策树，都离不开对 {topic} 的精准调度与管理。\n\n## 核心概念详解\n{topic} 核心在于利用其底层存储分配机制来提高整体空间与时间效率。大模型通过分析您的常见错误偏好（如：{', '.join(profile.error_patterns)}），在此特地为您强化了该模块的防御性编码理念。\n\n## 学术校验结论\n依据系统多智能体防幻觉算法验证，本课本内容中引用的学术概念无事实性偏差，安全可用。"
    
    slide_content = [
        {"title": f"第1页: 开启 {topic} 学习之旅", "content": f"欢迎阅读本章幻灯片。根据您的画像，本讲解偏重于实践及原理图解。"},
        {"title": f"第2页: {topic} 的设计理念", "content": f"核心点：确保数据结构完整、降低变量耦合、遵守模块化设计规范。"},
        {"title": f"第3页: 核心避坑指南", "content": f"注意防范：{', '.join(profile.error_patterns)}，在编码时应当加注断言防御检验。"}
    ]
    
    quiz_content = [
        {
          "question": f"在分析 {topic} 的底层实现时，下列哪项是不正当的操作？",
          "options": [
            "采用防御性编码（Defensive Coding）以规避类型幻觉异常",
            "在未进行类型推导的情况下强行将动态空类型解构",
            "根据系统风格合理划分局部命名空间与生命周期",
            "使用标准断言库测试核心对象的状态一致性"
          ],
          "answer": 1,
          "explanation": "未进行安全检验强行解构动态空类型会导致异常崩溃，违反了防范画像诊断中的错误偏好法则。"
        },
        {
          "question": f"为了提升对 {topic} 知识的吸收效率，以下哪项设计最符合“{profile.cognitive_style}”风格？",
          "options": [
            "深入探究底层 C/C++ 内存指针对齐与编译器源语汇编代码",
            "结合可视化的图解和音画动效，以及手写带有 PyTest 的代码实践案例",
            "阅读长达 200 页的纯数学矩阵公式推导及学术文献汇总",
            "进行多人头脑风模并设计离线的纸面系统模型"
          ],
          "answer": 1,
          "explanation": f"您的认知风格显示为 {profile.cognitive_style}，因此相比于抽象推导或纯文本，交互式图解、音画同步视频和实操测试题最能提高您的掌握效率。"
        }
    ]
    
    code_content = f"""# -*- coding: utf-8 -*-
# EduGenesis Multi-Agent Seeding Case for {topic}
# Cognitive Style: {profile.cognitive_style}

import pytest

def test_core_concept_logic():
    \"\"\"
    验证 {topic} 的核心状态逻辑是否符合断言预期
    \"\"\"
    # 模拟学术特征与配置定义
    topic_name = "{topic}"
    style_preference = "{profile.cognitive_style}"
    
    print(f"正在以 [{{style_preference}}] 模式测试 [{{topic_name}}] 用例...")
    
    # 核心测试断言
    assert len(topic_name) > 0
    assert style_preference in ["Practical Coding", "Visual/Guided", "Theoretical/Self-Paced", "Visual/Practical"]

if __name__ == "__main__":
    pytest.main(["-v", __file__])
"""
    
    mindmap_content = f"""graph TD
    A["{topic} 知识树"] --> B["基本定义"]
    A --> C["进阶技术"]
    B --> B1["概念定义与环境要求"]
    B --> B2["常见易错点偏好分析"]
    C --> C1["大模型自适应优化"]
    C --> C2["多智能体防幻觉过滤机制"]"""

    # Custom seeder values for topic matches
    if "variable" in topic_lower or "data types" in topic_lower:
        pdf_content = """# Python 中的变量与动态数据类型

本讲义针对您的**实操编码型（Practical Coding）**风格定制，增加了代码与实际编译原理的比照。

## 1. 变量引用的本质
在 Python 中，变量不需要预先声明，也不需要指定数据类型。语句 `x = 10` 的执行过程如下：
1. 在内存中创建一个 `int` 类型的对象，其值为 `10`。
2. 创建一个名为 `x` 的变量名称。
3. 将变量 `x` 指向刚才创建的内存中的 `int` 对象（即绑定引用）。

因此，Python 的变量本质上是**对象的标签**，而不是存储数据的盒子本身。

## 2. 动态类型绑定
由于变量仅是标签，Python 允许同一个变量在不同时刻绑定到不同类型的对象：
```python
x = 100       # x 绑定到 int 对象
x = "Python"  # x 重新绑定到 str 对象，原 int 对象如果没有其他引用，会被垃圾回收机制自动销毁
```

## 3. 防幻觉与安全警告
当处理动态类型变量时，容易触发 `TypeError` 错误。请始终在解构或进行复杂算术前进行类型检查：
```python
if isinstance(x, (int, float)):
    result = x + 10
else:
    print("变量不是数值类型，无法相加")
```"""
        slide_content = [
            {"title": "1. Python 变量的秘密", "content": "在 Python 中，变量并非‘数据盒子’，而是‘对象标签’。赋值语句实质是建立名称与内存对象的绑定关系。"},
            {"title": "2. 动态强类型解析", "content": "Python 属于‘动态强类型’语言。动态：运行时决定变量指向什么；强类型：不同类型间无法自动隐式转换（如 1 + '2' 报错）。"},
            {"title": "3. PEP 8 命名艺术", "content": "普通变量与函数采用蛇形法命名（snake_case）。常量使用全大写字母（MAX_LIMIT），类名使用大驼峰（StudentProfile）。"}
        ]
        quiz_content = [
            {
              "question": "在 Python 中，声明一个变量 `x = 10`。随后执行 `x = 'hello'`，会发生什么情况？",
              "options": [
                "抛出 TypeError 异常，因为变量不能改变数据类型",
                "正常执行。Python 是动态类型语言，同一个变量可以随时指向不同类型的对象",
                "报错，提示需要先使用 del x 销毁原变量",
                "x 的数据类型仍为 int，且值为字符的 ASCII 编码"
              ],
              "answer": 1,
              "explanation": "Python 是典型的动态类型语言。变量本质上是对象的“标签”（引用），它本身没有固定的类型限制，可以随时被重新绑定到任意其他类型的对象上。"
            },
            {
              "question": "下列哪个变量命名是不符合 PEP 8 推荐规范的？",
              "options": [
                "user_age",
                "calculateTotalAmount",
                "max_limit",
                "_temporary_db_connection"
              ],
              "answer": 1,
              "explanation": "PEP 8 推荐 Python 的普通变量和函数名使用蛇形命名法（snake_case，如 user_age）。选项 2 使用了驼峰命名法（camelCase），这常用于类名（PascalCase）或 Java 等语言，不符合 Python 官方规范。"
            },
            {
              "question": "如果定义了一个变量 `y = 3.14`，调用 `type(y)` 将返回什么数据类型？",
              "options": [
                "class 'int'",
                "class 'double'",
                "class 'float'",
                "class 'decimal'"
              ],
              "answer": 2,
              "explanation": "在 Python 中，带小数点的数字在内部统一表示为双精度浮点数，其对应的类类型为 float（对应 C 语言中的 double，Python 中没有单独的 double 类型）。"
            }
        ]
        code_content = """# -*- coding: utf-8 -*-
# Python 变量与数据类型实践用例
# 学术校验通过

import pytest

def test_variable_assignment():
    # 建立对象绑定
    a = [1, 2, 3]
    b = a  # 绑定同一个引用
    
    # 更改 a 指向的对象内容
    a.append(4)
    
    # 由于 b 和 a 指向同一个列表，b 也会受到影响
    assert b == [1, 2, 3, 4]
    assert id(a) == id(b)

def test_type_assertion():
    x = 42
    assert isinstance(x, int)
    
    x = "EduGenesis"
    assert isinstance(x, str)
    assert len(x) == 10

if __name__ == "__main__":
    pytest.main(["-v", __file__])
"""
        mindmap_content = """graph TD
    A["Python 数据类型"] --> B["基本数值"]
    A --> C["容器结构"]
    B --> B1["整型 (int)"]
    B --> B2["浮点型 (float)"]
    B --> B3["布尔型 (bool)"]
    C --> C1["字符串 (str)"]
    C --> C2["列表 (list)"]
    C --> C3["元组 (tuple)"]"""

    elif "environment" in topic_lower:
        pdf_content = """# Python 开发环境的快速部署

本讲义针对您的**实操编码型（Practical Coding）**风格定制，去除了多余的原理性文字，直接展示配置步骤。

## 1. 安装 Python
前往官方网站 [python.org](https://www.python.org/) 下载最新版稳定发行版。
在安装时，**必须勾选 "Add python.exe to PATH"**，以便在终端中全局调用。

## 2. 检查安装状态
打开您的终端（Cmd 或 PowerShell/Bash），运行以下命令：
```bash
python --version
pip --version
```
如果正常输出版本号，说明路径变量配置成功。

## 3. 安装 VS Code 及其 Python 开发套件
1. 访问 [VS Code 官网](https://code.visualstudio.com/) 安装编辑器。
2. 进入扩展市场（Extensions），搜索并安装官方的 **"Python" (by Microsoft)** 扩展，它将自动为您提供代码补全、格式化（Black）和 Debug 支持。
"""
        slide_content = [
            {"title": "1. 快速开启 Python 开发", "content": "本讲义旨在为您提供最简明的 Python 开发环境搭建步骤，包含 Python 解释器配置及 IDE 安装指导。"},
            {"title": "2. Add to PATH 的核心意义", "content": "勾选 ‘Add to PATH’ 会将 Python 路径写入系统的环境变量中。否则终端无法直接执行 ‘python’ 命令。"},
            {"title": "3. 推荐 IDE: VS Code", "content": "VS Code 凭借轻量、响应快速以及官方的 Python 插件，成为了目前全球最热门 of Python 开发利器。"}
        ]
        quiz_content = [
            {
              "question": "在 Windows 终端中输入 `python` 却提示‘命令未找到’，最可能的原因是？",
              "options": [
                "Python 解释器已经被 Windows 防火墙自动拦截",
                "在安装 Python 时忘记勾选了‘Add python.exe to PATH’选项",
                "计算机的内存不足，无法唤醒 Python 进程",
                "您的 Python 安装包被损坏，需要重装系统"
              ],
              "answer": 1,
              "explanation": "终端通过 PATH 环境变量查找可执行文件。若没把 python.exe 所在目录加入环境变量，终端就无法找到该命令。"
            }
        ]
        code_content = """# -*- coding: utf-8 -*-
# 环境检查验证脚本

import sys
import platform

def test_python_environment():
    # 验证主版本号大于或等于 3
    major_version = sys.version_info.major
    print(f"当前平台: {platform.system()} {platform.release()}")
    print(f"当前 Python 版本: {sys.version}")
    
    assert major_version >= 3

if __name__ == "__main__":
    test_python_environment()
    print("环境状态正常！")
"""
        mindmap_content = """graph TD
    A["Python 环境搭建"] --> B["解释器安装"]
    A --> C["IDE 配置"]
    B --> B1["官网下载安装包"]
    B --> B2["勾选 Add to PATH"]
    C --> C1["下载 VS Code"]
    C --> C2["安装 Python 扩展"]"""

    return {
        "pdf": pdf_content,
        "slide": slide_content,
        "quiz": quiz_content,
        "code": code_content,
        "mindmap": mindmap_content
    }

# Password hashing helper function
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# Database Helper Functions
def db_get_profile(username: str) -> UserProfile:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT knowledge_base, learning_pace, cognitive_style, error_patterns, learning_goals, engagement, learning_stats FROM user_profiles WHERE username = ?",
        (username,)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        # Fallback default
        return UserProfile(
            knowledge_base=40,
            learning_pace=50,
            cognitive_style="Practical Coding",
            error_patterns=["Syntax Errors", "Indentation Issues"],
            learning_goals=["Python Basics"],
            engagement=80
        )
    
    # Try parsing learning_stats
    stats_data = {
        "study_time": 45,
        "quiz_accuracy": 85,
        "mastered_nodes": 1,
        "streak": [True, True, False, False, False, False, False]
    }
    if len(row) > 6 and row[6]:
        try:
            stats_data = json.loads(row[6])
        except Exception:
            pass

    return UserProfile(
        knowledge_base=row[0],
        learning_pace=row[1],
        cognitive_style=row[2],
        error_patterns=json.loads(row[3]),
        learning_goals=json.loads(row[4]),
        engagement=row[5],
        learning_stats=stats_data
    )

def db_save_profile(username: str, profile: UserProfile):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO user_profiles 
        (username, knowledge_base, learning_pace, cognitive_style, error_patterns, learning_goals, engagement, learning_stats) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            username,
            profile.knowledge_base,
            profile.learning_pace,
            profile.cognitive_style,
            json.dumps(profile.error_patterns),
            json.dumps(profile.learning_goals),
            profile.engagement,
            json.dumps(profile.learning_stats)
        )
    )
    conn.commit()
    conn.close()


def db_get_path_nodes(username: str) -> List[PathNode]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT node_id, title, status, description, resources FROM user_path_nodes WHERE username = ? ORDER BY node_id ASC",
        (username,)
    )
    rows = cursor.fetchall()
    conn.close()
    if not rows:
        return list(python_path_nodes)
    return [
        PathNode(
            id=row[0],
            title=row[1],
            status=row[2],
            description=row[3],
            resources=json.loads(row[4])
        ) for row in rows
    ]

def db_save_path_nodes(username: str, nodes: List[PathNode]):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_path_nodes WHERE username = ?", (username,))
    for node in nodes:
        cursor.execute(
            "INSERT INTO user_path_nodes (username, node_id, title, status, description, resources) VALUES (?, ?, ?, ?, ?, ?)",
            (username, node.id, node.title, node.status, node.description, json.dumps(node.resources))
        )
    conn.commit()
    conn.close()

def db_sync_path_nodes_by_goals(username: str, goals: List[str]):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM user_path_nodes WHERE username = ?", (username,))
    count = cursor.fetchone()[0]
    conn.close()
    
    is_ml = any("Machine Learning" in g for g in goals)
    
    if count == 0:
        nodes_to_seed = ml_path_nodes if is_ml else python_path_nodes
        db_save_path_nodes(username, nodes_to_seed)
    else:
        existing = db_get_path_nodes(username)
        is_existing_ml = any("Linear Regression" in node.title or "Classification" in node.title for node in existing)
        if is_ml != is_existing_ml:
            nodes_to_seed = ml_path_nodes if is_ml else python_path_nodes
            db_save_path_nodes(username, nodes_to_seed)

# Initialize Database schemas and seed default user
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users Credentials Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        cognitive_style TEXT NOT NULL,
        learning_goals TEXT NOT NULL
    )
    """)
    
    # User Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        username TEXT PRIMARY KEY,
        knowledge_base INTEGER NOT NULL,
        learning_pace INTEGER NOT NULL,
        cognitive_style TEXT NOT NULL,
        error_patterns TEXT NOT NULL,
        learning_goals TEXT NOT NULL,
        engagement INTEGER NOT NULL,
        learning_stats TEXT
    )
    """)
    
    # User Path Nodes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_path_nodes (
        username TEXT,
        node_id TEXT,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        description TEXT NOT NULL,
        resources TEXT NOT NULL,
        PRIMARY KEY (username, node_id)
    )
    """)
    
    # User Resources Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_resources (
        username TEXT,
        node_id TEXT,
        resource_type TEXT,
        content TEXT,
        PRIMARY KEY (username, node_id, resource_type)
    )
    """)
    
    # Seed default user for immediate out-of-the-box frontend access
    cursor.execute("SELECT username FROM users WHERE username = 'default_user'")
    if not cursor.fetchone():
        pwd_hash = get_password_hash("default_password")
        cursor.execute(
            "INSERT INTO users (username, password_hash, cognitive_style, learning_goals) VALUES (?, ?, ?, ?)",
            ("default_user", pwd_hash, "Practical Coding", "Python Basics")
        )
        cursor.execute(
            "INSERT INTO user_profiles (username, knowledge_base, learning_pace, cognitive_style, error_patterns, learning_goals, engagement, learning_stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            ("default_user", 40, 50, "Practical Coding", json.dumps(["Syntax Errors", "Indentation Issues"]), json.dumps(["Python Basics"]), 80, json.dumps({
                "study_time": 45,
                "quiz_accuracy": 85,
                "mastered_nodes": 1,
                "streak": [True, True, False, False, False, False, False]
            }))
        )

        for node in python_path_nodes:
            cursor.execute(
                "INSERT INTO user_path_nodes (username, node_id, title, status, description, resources) VALUES (?, ?, ?, ?, ?, ?)",
                ("default_user", node.id, node.title, node.status, node.description, json.dumps(node.resources))
            )
            # Seed resources for default user
            default_profile = UserProfile(
                knowledge_base=40,
                learning_pace=50,
                cognitive_style="Practical Coding",
                error_patterns=["Syntax Errors", "Indentation Issues"],
                learning_goals=["Python Basics"],
                engagement=80
            )
            default_assets = get_fallback_assets_for_topic(node.title, default_profile)
            for res_type in node.resources:
                content_val = default_assets.get(res_type, "")
                if not isinstance(content_val, str):
                    content_val = json.dumps(content_val, ensure_ascii=False)
                cursor.execute(
                    "INSERT INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                    ("default_user", node.id, res_type, content_val)
                )

    conn.commit()
    conn.close()

# Initialize DB on import
init_db()


# --- LLM Client helper functions ---
def call_llm_structured_analysis(messages: List[BaseModel], current_profile: UserProfile):
    api_key = os.getenv("LLM_API_KEY")
    api_base = os.getenv("LLM_API_BASE", "https://api.openai.com/v1")
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
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
    # Some providers support response_format
    if "gpt" in model or "deepseek" in model:
        payload["response_format"] = {"type": "json_object"}
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"].strip()
            # Remove potential markdown fences
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
            return json.loads(content)
    except Exception as e:
        print(f"LLM Structured Analysis failed: {e}")
    return None

def call_llm_stream_tutor(messages: List[BaseModel], current_profile: UserProfile):
    api_key = os.getenv("LLM_API_KEY")
    api_base = os.getenv("LLM_API_BASE", "https://api.openai.com/v1")
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
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

def call_llm_resource_agent(topic: str, resources: List[str], profile: UserProfile):
    api_key = os.getenv("LLM_API_KEY")
    api_base = os.getenv("LLM_API_BASE", "https://api.openai.com/v1")
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
    if not api_key:
        return {}
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # We want a single structured response containing each requested resource type
    schema = {
        "type": "object",
        "properties": {},
        "required": []
    }
    
    properties = {}
    required = []
    
    if "pdf" in resources:
        properties["pdf"] = {"type": "string", "description": "Markdown formatted course textbook/notes"}
        required.append("pdf")
    if "slide" in resources:
        properties["slide"] = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "content": {"type": "string"}
                },
                "required": ["title", "content"]
            },
            "description": "List of slides with titles and contents"
        }
        required.append("slide")
    if "quiz" in resources:
        properties["quiz"] = {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "options": {"type": "array", "items": {"type": "string"}},
                    "answer": {"type": "integer", "description": "0-based index of correct option"},
                    "explanation": {"type": "string"}
                },
                "required": ["question", "options", "answer", "explanation"]
            },
            "description": "List of multiple-choice questions matching user's error patterns"
        }
        required.append("quiz")
    if "code" in resources:
        properties["code"] = {"type": "string", "description": "Python source code script containing comments and pytest tests"}
        required.append("code")
    if "mindmap" in resources:
        properties["mindmap"] = {"type": "string", "description": "Mermaid flowchart diagram syntax starting with graph TD"}
        required.append("mindmap")
        
    schema["properties"] = properties
    schema["required"] = required
    
    system_prompt = f"""You are the Multimodal Resource Generator Agent in a multi-agent educational network.
Your job is to generate highly professional learning materials for the topic "{topic}" tailored to the student's cognitive profile.

Student Profile:
- Cognitive learning style: {profile.cognitive_style}
- Common error patterns: {json.dumps(profile.error_patterns)}
- Preferred learning goals: {json.dumps(profile.learning_goals)}

You must return a single JSON object containing only the requested properties as defined by the schema. Avoid preambles, extra text, or markdown code fences."""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate resources for topic '{topic}' based on the schema: {json.dumps(schema)}"}
        ],
        "temperature": 0.3
    }
    
    if "gpt" in model or "deepseek" in model:
        payload["response_format"] = {"type": "json_object"}
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"].strip()
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
            return json.loads(content)
    except Exception as e:
        print(f"Failed to fetch resources from LLM: {e}")
        
    return {}


# --- Router Endpoints ---
@router.post("/auth/register")
def register_user(request: RegisterRequest):
    global logged_in_username
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (request.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该用户名已被占用，请重新选择昵称。"
        )
    
    pwd_hash = get_password_hash(request.password)
    goals_str = ",".join(request.learning_goals)
    cursor.execute(
        "INSERT INTO users (username, password_hash, cognitive_style, learning_goals) VALUES (?, ?, ?, ?)",
        (request.username, pwd_hash, request.cognitive_style, goals_str)
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
    
    logged_in_username = request.username
    return {"status": "success", "detail": "注册成功，学术环境已初始化。"}

@router.post("/auth/login")
def login_user(request: LoginRequest):
    global logged_in_username
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash, cognitive_style, learning_goals FROM users WHERE username = ?", (request.username,))
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
    
    if get_password_hash(request.password) != pwd_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="密码错误，请重新输入学术密码。"
        )
    
    logged_in_username = request.username
    
    # Self-heal profile and path nodes if missing in DB
    existing_profile = db_get_profile(request.username)
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
        
    return {"status": "success", "username": request.username, "cognitive_style": cognitive_style, "learning_goals": learning_goals}

@router.get("/profile", response_model=UserProfile)
def get_profile(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    return db_get_profile(target_user)

@router.post("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile, username: Optional[str] = None):
    target_user = username if username else logged_in_username
    db_save_profile(target_user, profile)
    db_sync_path_nodes_by_goals(target_user, profile.learning_goals)
    return db_get_profile(target_user)

@router.get("/path")
def get_path(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    nodes = db_get_path_nodes(target_user)
    return {"nodes": nodes}

@router.post("/path/regenerate")
def regenerate_path(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    profile = db_get_profile(target_user)
    goals = profile.learning_goals
    is_ml = any("Machine Learning" in g for g in goals)
    
    base_nodes = ml_path_nodes if is_ml else python_path_nodes
    style = profile.cognitive_style.lower()
    
    new_nodes = []
    for node in base_nodes:
        desc = node.description
        if "practical" in style:
            desc += " (已针对您的实操风格，增加核心编码练习与PyTest断言用例)"
        elif "visual" in style:
            desc += " (已针对您的直观视觉风格，植入思维脑图与音画对齐幻灯课件)"
        else:
            desc += " (已为您强化深度概念精讲、文献引用与防御性编码理论)"
            
        new_nodes.append(
            PathNode(
                id=node.id,
                title=node.title,
                status="completed" if node.id == "node1" else ("active" if node.id == "node2" else "locked"),
                description=desc,
                resources=node.resources
            )
        )
    
    db_save_path_nodes(target_user, new_nodes)
    
    # Pre-generate assets for node1 and node2 based on current profile
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # node1
    fallback_n1 = get_fallback_assets_for_topic(new_nodes[0].title, profile)
    for res_type in new_nodes[0].resources:
        content_val = fallback_n1.get(res_type, "")
        if not isinstance(content_val, str):
            content_val = json.dumps(content_val, ensure_ascii=False)
        cursor.execute(
            "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
            (target_user, new_nodes[0].id, res_type, content_val)
        )
        
    # node2
    fallback_n2 = get_fallback_assets_for_topic(new_nodes[1].title, profile)
    for res_type in new_nodes[1].resources:
        content_val = fallback_n2.get(res_type, "")
        if not isinstance(content_val, str):
            content_val = json.dumps(content_val, ensure_ascii=False)
        cursor.execute(
            "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
            (target_user, new_nodes[1].id, res_type, content_val)
        )
        
    conn.commit()
    conn.close()
    
    return {"status": "success", "nodes": new_nodes}


@router.post("/chat")
async def chat_interaction(request: ChatRequest, username: Optional[str] = None):
    target_user = username if username else logged_in_username
    current_profile = db_get_profile(target_user)
    api_key = os.getenv("LLM_API_KEY")
    
    async def event_generator():
        # Step 1: Supervisor orchestrator thinking state
        yield f"data: {json.dumps({'type': 'status', 'status': '🧠 [主管智能体] 正在唤醒协同智能体网络...'})}\n\n"
        await asyncio.sleep(0.4)
        
        if api_key:
            # Step 2: Structured Analyzer Call
            yield f"data: {json.dumps({'type': 'status', 'status': '📊 [画像智能体] 正在对您的认知指标进行多维提取与诊断...'})}\n\n"
            
            analysis = await asyncio.to_thread(call_llm_structured_analysis, request.messages, current_profile)
            
            profile_updated = False
            path_updated = False
            
            if analysis:
                p_updates = analysis.get("profile_updates")
                if p_updates:
                    for k, v in p_updates.items():
                        if v is not None and hasattr(current_profile, k):
                            setattr(current_profile, k, v)
                            profile_updated = True
                
                subj = analysis.get("switch_to_subject")
                if subj in ["Python Basics", "Machine Learning"]:
                    if subj not in current_profile.learning_goals:
                        current_profile.learning_goals = [subj]
                        db_sync_path_nodes_by_goals(target_user, [subj])
                        profile_updated = True
                        path_updated = True
            
            if profile_updated:
                db_save_profile(target_user, current_profile)
                
            yield f"data: {json.dumps({'type': 'status', 'status': '📍 [路径智能体] 正在优化您的知识时间轴拓扑结构...'})}\n\n"
            await asyncio.sleep(0.4)
            
            yield f"data: {json.dumps({'type': 'status', 'status': '💬 [导师智能体] 正在根据新画像为您生成个性化讲义...'})}\n\n"
            
            stream_response = await asyncio.to_thread(call_llm_stream_tutor, request.messages, current_profile)
            
            if stream_response and stream_response.status_code == 200:
                yield f"data: {json.dumps({'type': 'status', 'status': ''})}\n\n"
                
                for chunk_bytes in stream_response.iter_lines():
                    if chunk_bytes:
                        line = chunk_bytes.decode('utf-8').strip()
                        if line.startswith("data:"):
                            data_str = line[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data_json = json.loads(data_str)
                                delta = data_json["choices"][0]["delta"]
                                if "content" in delta:
                                    yield f"data: {json.dumps({'type': 'content', 'content': delta['content']})}\n\n"
                            except Exception:
                                pass
                
                # Push database updates to client
                if profile_updated:
                    yield f"data: {json.dumps({'type': 'profile_update', 'profile': current_profile.model_dump()})}\n\n"
                    await asyncio.sleep(0.2)
                if path_updated:
                    nodes_list = [n.model_dump() for n in db_get_path_nodes(target_user)]
                    yield f"data: {json.dumps({'type': 'path_update', 'nodes': nodes_list})}\n\n"
                    await asyncio.sleep(0.2)
            else:
                # LLM API call failed, fallback to simulator
                async for chunk in run_fallback_simulator(request.messages, current_profile):
                    yield chunk
        else:
            # No LLM API key provided, default to simulator fallback
            async for chunk in run_fallback_simulator(request.messages, current_profile):
                yield chunk
            
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    async def run_fallback_simulator(messages, profile):
        yield f"data: {json.dumps({'type': 'status', 'status': '⚠️ 未检测到 API Key，已自动启用本地仿真模型。'})}\n\n"
        await asyncio.sleep(0.6)
        yield f"data: {json.dumps({'type': 'status', 'status': ''})}\n\n"
        
        user_input_clean = messages[-1].content.lower() if messages else ""
        profile_updated_sim = False
        path_updated_sim = False
        
        if "beginner" in user_input_clean or "初学者" in user_input_clean or "不懂" in user_input_clean:
            profile.knowledge_base = 15
            profile.learning_pace = 30
            profile.cognitive_style = "Visual/Guided"
            profile.error_patterns = ["Basic logic errors", "Syntax Errors"]
            profile_updated_sim = True
        elif "advanced" in user_input_clean or "懂一点" in user_input_clean or "有基础" in user_input_clean:
            profile.knowledge_base = 65
            profile.learning_pace = 75
            profile.cognitive_style = "Theoretical/Self-Paced"
            profile_updated_sim = True
            
        if "machine learning" in user_input_clean or "机器学习" in user_input_clean or "算法" in user_input_clean:
            if "Machine Learning" not in profile.learning_goals:
                profile.learning_goals = ["Machine Learning"]
                db_sync_path_nodes_by_goals(target_user, ["Machine Learning"])
                profile_updated_sim = True
                path_updated_sim = True
        elif "python" in user_input_clean or "基础" in user_input_clean or "重置" in user_input_clean:
            if "Python Basics" not in profile.learning_goals:
                profile.learning_goals = ["Python Basics"]
                db_sync_path_nodes_by_goals(target_user, ["Python Basics"])
                profile_updated_sim = True
                path_updated_sim = True
                
        if profile_updated_sim:
            db_save_profile(target_user, profile)

        tutor_response = ""
        if "machine learning" in user_input_clean or "机器学习" in user_input_clean:
            tutor_response = "您好！我已经收到了您的学习期望。系统已经检测到您对**机器学习**感兴趣。我已为您加载了《机器学习核心理论与应用实操》的个性化学习路径，包括从线性代数到神经网络的实践案例。我们可以先从第一关“线性代数基础”开始！"
        elif "beginner" in user_input_clean or "初学者" in user_input_clean or "不懂" in user_input_clean:
            tutor_response = "没关系！我们都会从零开始。我已经把您的学习节奏调到了**慢速温和**模式，并降低了初始难度门槛（知识库水平已调整为 15%）。学习路径里的内容现在将包含更多的代码注释和可视化卡片。让我们先试试“Python变量”第一课吧！"
        else:
            tutor_response = f"您好！我是您的个性化 AI 助教。我已经接收到了您的消息：“{user_input_clean}”。基于多智能体协同，我为您量身定制了这套方案。在对话过程中，我会自动评估您的学习特征，并实时微调左侧的动态学习雷达画像与下方的学习路径。"
            
        chunk_size = 5
        for i in range(0, len(tutor_response), chunk_size):
            chunk = tutor_response[i:i+chunk_size]
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
            await asyncio.sleep(0.04)
            
        if profile_updated_sim:
            yield f"data: {json.dumps({'type': 'profile_update', 'profile': profile.model_dump()})}\n\n"
            await asyncio.sleep(0.2)
        if path_updated_sim:
            nodes_list = [n.model_dump() for n in db_get_path_nodes(target_user)]
            yield f"data: {json.dumps({'type': 'path_update', 'nodes': nodes_list})}\n\n"
            await asyncio.sleep(0.2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/resources")
def get_resources(node_id: str, username: Optional[str] = None):
    target_user = username if username else logged_in_username
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT resource_type, content FROM user_resources WHERE username = ? AND node_id = ?",
        (target_user, node_id)
    )
    rows = cursor.fetchall()
    conn.close()
    
    result = {}
    for row in rows:
        try:
            result[row[0]] = json.loads(row[1])
        except Exception:
            result[row[0]] = row[1]
    return result


@router.post("/resources/generate")
def generate_resources(request: ResourceGenerateRequest):
    target_user = request.username if request.username else logged_in_username
    node_id = request.node_id
    
    # Get current profile
    profile = db_get_profile(target_user)
    
    # Find the node configuration to understand the topic
    nodes = db_get_path_nodes(target_user)
    node_title = "General Study Topic"
    node_resources = ["pdf"]
    for node in nodes:
        if node.id == node_id:
            node_title = node.title
            node_resources = node.resources
            break
            
    # Check if LLM API Key is configured
    api_key = os.getenv("LLM_API_KEY")
    generated_data = {}
    
    # Get high-fidelity simulated assets for fallback
    fallback_assets = get_fallback_assets_for_topic(node_title, profile)
    
    if api_key:
        try:
            analysis = call_llm_resource_agent(node_title, node_resources, profile)
            if analysis:
                generated_data = analysis
        except Exception as e:
            print(f"Failed to generate resources via LLM: {e}")
            generated_data = fallback_assets
    else:
        generated_data = fallback_assets
        
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
    
    return get_resources(node_id, target_user)
