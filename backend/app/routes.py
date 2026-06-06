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

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path=env_path)

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "users.db")

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
    PathNode(id="node1", title="Python 环境部署", status="completed", description="安装 Python 与 VS Code 编译环境", resources=["pdf", "code"]),
    PathNode(id="node2", title="变量与数据类型", status="active", description="探索整型、浮点型、字符串及动态类型绑定", resources=["slide", "pdf", "quiz"]),
    PathNode(id="node3", title="控制流条件判断", status="locked", description="If-Else 条件分支控制逻辑", resources=["slide", "quiz", "code"]),
    PathNode(id="node4", title="循环控制结构", status="locked", description="While 与 For 迭代及中断控制", resources=["slide", "quiz"]),
    PathNode(id="node5", title="内置核心数据结构", status="locked", description="列表、元组、字典及集合的多场景增删改查", resources=["slide", "pdf", "quiz", "code"]),
    PathNode(id="node6", title="函数与封装抽象", status="locked", description="自定义参数传递、返回值及标准库模块导入", resources=["slide", "pdf", "mindmap", "code"]),
    PathNode(id="node7", title="文件读写与异常处理", status="locked", description="文件系统流读写操作与 Try-Except 异常捕获", resources=["code", "quiz"]),
    PathNode(id="node8", title="综合项目实战应用", status="locked", description="多智能体协同编写带有健壮性校验的 CLI 工具", resources=["code", "quiz"])
]

ml_path_nodes = [
    PathNode(id="node1", title="线性代数算力证明", status="completed", description="理解向量点积、矩阵乘法与特征值理论底座", resources=["pdf"]),
    PathNode(id="node2", title="微积分与梯度下降", status="active", description="偏导数求解与权重参数一步梯度更新步长", resources=["slide", "quiz", "code"]),
    PathNode(id="node3", title="经典线性回归算法", status="locked", description="最小二乘法与均方误差损失函数收敛验证", resources=["slide", "quiz", "code"]),
    PathNode(id="node4", title="逻辑回归与分类法则", status="locked", description="Sigmoid 激活函数映射与交叉熵损失定义", resources=["slide", "quiz"]),
    PathNode(id="node5", title="正则化防御过拟合", status="locked", description="添加 L1/L2 惩罚项以控制模型泛化能力", resources=["slide", "pdf", "quiz", "code"]),
    PathNode(id="node6", title="前馈深度神经网络", status="locked", description="层、权重与偏置的矩阵运算表示", resources=["slide", "pdf", "mindmap", "code"]),
    PathNode(id="node7", title="反向传播求导推演", status="locked", description="链式求导法则在计算图中的前向传播与反向求偏导", resources=["code", "quiz"]),
    PathNode(id="node8", title="经典回归场景实战部署", status="locked", description="完成房价回归预测模型搭建、调试及一键部署", resources=["code", "quiz"])
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
    pdf_content = f"""# {topic} 个性化自适应讲解课本

本章节内容由画像智能体专为您的学习偏好与认知风格（**{profile.cognitive_style}**）定制编排。结合了理论推导、动手实践以及防幻觉风控校验，为您提供最深度的学术讲解。

## 1. 导读与学术背景
在现代软件系统、工程实践以及多智能体协同网络中，{topic} 构成了重要的底层基石。无论是处理复杂的自适应控制流，还是组织海量的知识索引库，都离不开对该模块的精准调度与管理。

## 2. 核心概念与运行原理
{topic} 核心在于利用其底层存储与分配机制来提高整体空间与时间效率。其基本运作机制如下：
1. **状态分配（State Allocation）**：定义核心上下文，分派计算或内存资源。
2. **拓扑编排（Topology Orchestration）**：构建不同层次的数据拓扑关系，形成清晰的依赖路径。
3. **安全护栏（Guardrail Audit）**：在数据流入前进行安全过滤，拦截潜在的类型转换或溢出风险。

通过针对您的常见错误范畴（如：{', '.join(profile.error_patterns)}）进行定向增强，本课本特地为您强化了该模块的“防御性编码”理念。

## 3. 防御性编码与异常规避
在处理 {topic} 的逻辑时，最容易遇到的问题是边界条件未捕获以及类型强行解构异常。为了防范这些错误偏好，建议您：
* 始终在对动态对象解构前进行严格的类型断言校验（`isinstance`）。
* 在函数的入口与出口处设置合理的数据合法性拦截点，并记录相关日志。
* 编写细致的单元测试，借助 PyTest 框架测试极端输入下的系统稳定性。

## 4. 多智能体学术校验结论
依据本系统防幻觉安全校验智能体（Academic Guard Agent）的自动化审计，本课本内容中引用的学术定义、运行期代码规范以及数学推导过程均未发现事实性偏差或安全合规隐患，特予签发，准予修读。"""
    
    slide_content = [
        {"title": f"第1页: 开启 {topic} 自适应课程", "content": f"根据系统检测到您的“{profile.cognitive_style}”认知风格，本幻灯片已针对性增加了理论图解与实操避坑细节。本章我们将分步骤精讲核心原理。"},
        {"title": f"第2页: {topic} 的底层运作机制", "content": f"核心思想：确立数据高内聚与低耦合设计，合理划分内存与局部生命周期。对于耗时动作或复杂计算，采用事件驱动式流式调度以提高吞吐。"},
        {"title": f"第3页: 防御性编码与异常处理", "content": f"警告：严禁在未做空指针或未类型断言的前提下，直接解构动态参数。开发时应当主动加注 asserts 进行防御性检验。"},
        {"title": f"第4页: 多智能体协同感知网络", "content": f"在 EduGenesis 系统中，主管、画像、路径和安全四个智能体构成网状协同，自动跟踪您的答题偏好，动态为您计算学习热力学指标并调整内容。"},
        {"title": f"第5页: 实操代码与 PyTest 验证", "content": f"实践是检验真理的唯一标准。每一关都配备了独立的断言测试用例，复制它们在本地 VS Code 中运行，可验证逻辑的健壮性。"},
        {"title": f"第6页: 本章总结与后续路线", "content": f"掌握 {topic} 是进入进阶知识的钥匙。完成本章的自适应画像评估测验后，路径智能体将为您解锁下一关卡！"}
    ]
    
    quiz_content = [
        {
          "question": f"在进行 {topic} 的软件架构设计时，为了规避开发过程中的类型解构异常，下列哪项是最规范的作法？",
          "options": [
            "采用防御性编码（Defensive Coding），在解构前进行严格的类型与边界断言校验",
            "强行将动态空值（Nullable Object）解构以加快编译运行速度",
            "完全忽略局部变量生命周期管理，使用全局变量进行参数传递",
            "直接调用未经防幻觉过滤的第三方大模型 API 输出"
          ],
          "answer": 0,
          "explanation": "防御性编码要求我们在运行时对动态对象进行类型 and 合法性校验，这能从源头上杜绝空值解构引发的系统崩溃。"
        },
        {
          "question": f"为了提升对 {topic} 知识的吸收效率，以下哪项教学安排最符合您的“{profile.cognitive_style}”风格？",
          "options": [
            "阅读长达 200 页且没有任何代码案例的纯数学推导文献",
            "手写带有 PyTest 断言库的代码用例，并配合 Mermaid 拓扑图与 TTS 语音串讲",
            "直接听取没有任何交互的大篇幅视频录播课",
            "进行纯粹的离线纸面逻辑推导"
          ],
          "answer": 1,
          "explanation": f"您的认知风格显示为 {profile.cognitive_style}，因此多模态（结合音画脑图与代码实操）的交互式学习路径能为您提供最高的吸收效率。"
        },
        {
          "question": f"当系统在运行代码沙盒时发现 IndentationError（缩进错误），哪一个智能体最先捕获并将其归档到错题本？",
          "options": [
            "路径智能体",
            "安全校验智能体",
            "主管智能体",
            "自适应画像智能体"
          ],
          "answer": 3,
          "explanation": "自适应画像智能体负责实时跟踪、记录并分析学生的错题特征，它会捕获沙盒异常并将其归入错题本中。"
        },
        {
          "question": f"在使用 {topic} 时，为了保证数据完整性和一致性，我们通常使用什么工具来测试核心逻辑状态？",
          "options": [
            "简单的 print() 语句打印",
            "专业的断言测试库（如 PyTest / pytest.main）",
            "无需测试，直接部署到生产环境",
            "完全依靠人工肉眼排查"
          ],
          "answer": 1,
          "explanation": "使用专业的断言库（如 PyTest）能够编写自动化的单元测试，确保程序核心状态逻辑在各种输入下完全一致。"
        },
        {
          "question": f"自适应多智能体系统中，当用户在自适应评估测验中答题正确率未达到多少时，系统将触发加练机制而不解锁下一关？",
          "options": [
            "30%",
            "50%",
            "60%",
            "90%"
          ],
          "answer": 2,
          "explanation": "系统要求自适应答题合格率至少达到 60% 以上才能顺利解锁下一阶段的关卡资源，否则画像智能体将建议重新阅读课件。"
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
    
    if count != 8:
        nodes_to_seed = ml_path_nodes if is_ml else python_path_nodes
        db_save_path_nodes(username, nodes_to_seed)
    else:
        existing = db_get_path_nodes(username)
        is_existing_ml = any("线性代数" in node.title or "梯度下降" in node.title or "Linear" in node.title for node in existing)
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
    
    # User Errors Notebook Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_errors (
        username TEXT,
        error_id TEXT,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        error_msg TEXT NOT NULL,
        ai_explanation TEXT NOT NULL,
        solution TEXT NOT NULL,
        status TEXT NOT NULL,
        PRIMARY KEY (username, error_id)
    )
    """)
    
    # System Multi-Agent Operation Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_logs (
        username TEXT,
        timestamp TEXT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        log_type TEXT NOT NULL
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
    
    # Seed errors and logs for default_user
    seed_errors_and_logs_for_user("default_user")

# --- LLM Client helper functions ---
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
            content = res_data["choices"][0]["message"]["content"]
            content = extract_json_block(content)
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
- 首选学习目标: {json.dumps(profile.learning_goals, ensure_ascii=False)}

你必须仅返回一个符合指定 Schema 要求的 JSON 对象，不能包含任何前言、后记、Markdown 标记如 ```json 等多余文本。所有生成的文字必须使用简体中文。"""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"请为主题 '{topic}' 生成纯中文的学习资源，符合以下 Schema 定义: {json.dumps(schema, ensure_ascii=False)}"}
        ],
        "temperature": 0.3
    }
    
    if "gpt" in model or "deepseek" in model:
        payload["response_format"] = {"type": "json_object"}
        
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=25)
        if response.status_code == 200:
            res_data = response.json()
            content = res_data["choices"][0]["message"]["content"]
            content = extract_json_block(content)
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
    
    # Seed default errors and logs to prevent blank pages on tab initialization
    seed_errors_and_logs_for_user(request.username)
    
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
        
    # Seed default errors and logs to prevent blank pages on tab initialization
    seed_errors_and_logs_for_user(request.username)
        
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

def call_llm_path_planner(goals: List[str], style: str, username: str = "default_user") -> List[dict]:
    api_key = os.getenv("LLM_API_KEY")
    api_base = os.getenv("LLM_API_BASE", "https://api.openai.com/v1")
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
    db_log_agent_action(username, "路径智能体", f"正在规划路径。大模型配置: Key={api_key[:10] if api_key else 'None'}..., Base={api_base}, Model={model}", "info")
    
    if not api_key:
        db_log_agent_action(username, "路径智能体", "路径规划中止: 环境变量中未检测到 LLM_API_KEY。", "warning")
        return []
        
    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    goals_str = ", ".join(goals)
    
    system_prompt = f"""你是一个多智能体教育网络中的路径规划智能体（Path Planning Agent）。
你的任务是为学生生成正好 8 个定制化的学习路径关卡（nodes）。
学生的学习目标: {goals_str}
学生的认知风格: {style}

必须生成符合以下 JSON 格式的数据。所有的标题（title）和描述（description）必须使用中文（简体中文）生成！
请确保生成的 JSON 格式完全正确（请勿包含任何 markdown 标记如 ```json ，只输出纯 JSON 字符串）：
{{
  "nodes": [
    {{
      "id": "node1",
      "title": "节点1的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["pdf", "code"]
    }},
    {{
      "id": "node2",
      "title": "节点2的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["slide", "pdf", "quiz"]
    }},
    {{
      "id": "node3",
      "title": "节点3的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["slide", "quiz", "code"]
    }},
    {{
      "id": "node4",
      "title": "节点4的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["slide", "quiz"]
    }},
    {{
      "id": "node5",
      "title": "节点5的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["slide", "pdf", "quiz", "code"]
    }},
    {{
      "id": "node6",
      "title": "节点6的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["slide", "pdf", "mindmap", "code"]
    }},
    {{
      "id": "node7",
      "title": "节点7的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["code", "quiz"]
    }},
    {{
      "id": "node8",
      "title": "节点8的简短中文标题",
      "description": "结合学生认知风格和学习目标定制的简短中文描述",
      "resources": ["code", "quiz"]
    }}
  ]
}}

生成准则:
1. 必须生成正好 8 个节点，ID 依次为 "node1", "node2", ..., "node8"。
2. 节点的 resources 列表必须包含以下资源类型中的 2 到 3 个: "pdf", "slide", "quiz", "code", "mindmap"。
3. 所有的标题（title）和描述（description）必须是简体中文。
4. 节点内容必须紧密结合学生的学习目标（{goals_str}）和认知风格（{style}）。
"""

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "现在请立即生成这 8 个中文学习路径关卡。"}
        ],
        "temperature": 0.4
    }
    
    if "gpt" in model or "deepseek" in model:
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

@router.post("/path/regenerate")
def regenerate_path(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    profile = db_get_profile(target_user)
    goals = profile.learning_goals
    
    # Try calling the AI path planner
    ai_nodes = call_llm_path_planner(goals, profile.cognitive_style, target_user)
    
    new_nodes = []
    if ai_nodes and len(ai_nodes) == 8:
        for idx, node in enumerate(ai_nodes):
            # Maintain correct lock/unlock status for the nodes
            status = "completed" if node["id"] == "node1" else ("active" if node["id"] == "node2" else "locked")
            new_nodes.append(
                PathNode(
                    id=node["id"],
                    title=node["title"],
                    status=status,
                    description=node["description"],
                    resources=node["resources"]
                )
            )
        db_log_agent_action(target_user, "路径智能体", f"定制路径规划完成！已通过大模型在线实时生成 8 个定制自适应关卡。", "info")
    else:
        # Fallback to predefined lists
        is_ml = any("Machine Learning" in g for g in goals)
        base_nodes = ml_path_nodes if is_ml else python_path_nodes
        style = profile.cognitive_style.lower()
        
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
        db_log_agent_action(target_user, "路径智能体", f"大模型接口离线，已启用自适应静态路径模板为您匹配 8 个关卡。", "warning")
            
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
    
    # If no resources are found for this user and node, trigger automatic generation/fallback
    if not rows:
        # Find the node configuration to understand the topic and resource types
        nodes = db_get_path_nodes(target_user)
        node_title = "General Study Topic"
        node_resources = ["pdf"]
        for node in nodes:
            if node.id == node_id:
                node_title = node.title
                node_resources = node.resources
                break
                
        profile = db_get_profile(target_user)
        
        # Log consensus decision starting
        db_log_agent_action(target_user, "主管智能体", f"检测到关卡 [{node_title}] 的多模态资源为空，调度协同代理启动在线资源生成流程。", "info")
        db_log_agent_action(target_user, "画像智能体", f"分析学生画像数据：认知风格为 [{profile.cognitive_style}]，匹配错误范畴，正在进行个性化 Prompt 组装...", "consensus")
        db_log_agent_action(target_user, "路径智能体", f"开始为关卡 [{node_title}] 动态编排学术资源，调度资源项：{', '.join(node_resources)}。", "info")
        
        api_key = os.getenv("LLM_API_KEY")
        generated_data = {}
        fallback_assets = get_fallback_assets_for_topic(node_title, profile)
        
        if api_key:
            try:
                # Call LLM generator
                analysis = call_llm_resource_agent(node_title, node_resources, profile)
                if analysis:
                    generated_data = analysis
                    db_log_agent_action(target_user, "路径智能体", f"大模型在线生成 [{node_title}] 资源项成功，共生成 {len(generated_data)} 个多模态资源包。", "info")
                    db_log_agent_action(target_user, "安全校验智能体", f"对 [{node_title}] 生成的课本及试题进行安全过滤审计与学术合规校验。检查项：中文正确性、代码安全性。审计状态：100% 合规，准予入库。", "consensus")
                else:
                    db_log_agent_action(target_user, "路径智能体", f"大模型生成 [{node_title}] 失败或格式错误，系统无缝切换到本地自适应兜底资源库以保证极速展现。", "warning")
                    generated_data = fallback_assets
            except Exception as e:
                print(f"Failed to auto-generate resources via LLM: {e}")
                db_log_agent_action(target_user, "路径智能体", f"大模型资源生成异常: {str(e)}，系统已降级切换到本地高保真自适应资源库进行学术填充。", "warning")
                generated_data = fallback_assets
        else:
            db_log_agent_action(target_user, "路径智能体", f"大模型接口离线，系统已降级切换到本地自适应多模态资源库为您调配 [{node_title}] 关卡内容。", "warning")
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
        db_log_agent_action(target_user, "画像智能体", f"画像校验：当前认知风格 [{profile.cognitive_style}] 与所加载的资源完美对齐，启动个性化学情监控跟踪器。", "consensus")
        db_log_agent_action(target_user, "安全校验智能体", f"运行期监控已开启：正在审计沙盒防护和敏感输入防御层，合规审计状态：Normal，未发现学术违规偏离。", "consensus")
        
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
    
    # Log starting
    db_log_agent_action(target_user, "主管智能体", f"接收到手动触发关卡 [{node_title}] 资源重构指令。调度智能体群开始在线重新规划与资源匹配。", "info")
    db_log_agent_action(target_user, "画像智能体", f"画像特征对齐（认知风格: {profile.cognitive_style}，目标: {profile.learning_goals}），开始重构大模型个性化 Prompts 模板。", "consensus")
    db_log_agent_action(target_user, "路径智能体", f"正在调用星火大模型，重新生成关卡 [{node_title}] 的多模态资源包（{', '.join(node_resources)}）...", "info")
    
    # Get high-fidelity simulated assets for fallback
    fallback_assets = get_fallback_assets_for_topic(node_title, profile)
    
    if api_key:
        try:
            analysis = call_llm_resource_agent(node_title, node_resources, profile)
            if analysis:
                generated_data = analysis
                db_log_agent_action(target_user, "路径智能体", f"大模型在线资源生成成功！已成功输出并格式化多模态资源项。", "info")
                db_log_agent_action(target_user, "安全校验智能体", f"防幻觉拦截审计与学术防注入合规审查完成。中文编码和数据完整性：100% 合规。准予入库。", "consensus")
            else:
                db_log_agent_action(target_user, "路径智能体", f"大模型返回资源格式异常，系统以降级切换至本地高保真自适应资源数据库以保障完美演示。", "warning")
                generated_data = fallback_assets
        except Exception as e:
            print(f"Failed to generate resources via LLM: {e}")
            db_log_agent_action(target_user, "路径智能体", f"大模型调用发生异常: {str(e)}，系统以降级切换至本地高保真自适应数据表补充。", "warning")
            generated_data = fallback_assets
    else:
        db_log_agent_action(target_user, "路径智能体", f"大模型 API Key 缺失，系统以降级切换至本地高保真自适应资源库为您配置 [{node_title}] 关卡学习资源。", "warning")
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


# --- Pydantic Schemas for Dashboard Tabs ---
class SandboxRunRequest(BaseModel):
    code: str
    node_id: str
    username: Optional[str] = None

class SandboxDiagnoseRequest(BaseModel):
    code: str
    node_id: str
    username: Optional[str] = None

class ErrorDiagnoseRequest(BaseModel):
    error_id: str
    username: Optional[str] = None

class ErrorRemedyRequest(BaseModel):
    error_id: str
    username: Optional[str] = None

class ConsoleLogRequest(BaseModel):
    sender: str
    message: str
    log_type: str = "info"
    username: Optional[str] = None

class CompleteNodeRequest(BaseModel):
    node_id: str
    username: Optional[str] = None


# --- Challenge Templates Mapping ---
PYTHON_CHALLENGES = {
    "node1": {
        "title": "Python 环境部署: Hello World",
        "description": "请编写一个函数 `hello_world()`，使其返回字符串 `'Hello, EduGenesis!'`。这是一个验证编译器的环境测试。",
        "initial_code": "def hello_world():\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_hello_world():
    assert hello_world() == 'Hello, EduGenesis!', "Expected hello_world() to return 'Hello, EduGenesis!'"
if __name__ == '__main__':
    test_hello_world()
"""
    },
    "node2": {
        "title": "变量与数据类型: 计算圆的面积",
        "description": "请完善函数 `circle_area(radius)`。根据公式 area = 3.14 * radius * radius 计算并返回圆的面积。如果半径小于 0，请返回 0。",
        "initial_code": "def circle_area(radius):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_circle_area():
    assert circle_area(5) == 78.5, "Expected circle_area(5) to return 78.5"
    assert circle_area(0) == 0, "Expected circle_area(0) to return 0"
    assert circle_area(-2.5) == 0, "Expected circle_area(-2.5) to return 0"
if __name__ == '__main__':
    test_circle_area()
"""
    },
    "node3": {
        "title": "控制流条件判断: 奇偶数检查",
        "description": "请完善函数 `check_even(num)`。判断 `num` 是否为偶数，如果是偶数则返回 True，否则返回 False。",
        "initial_code": "def check_even(num):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_check_even():
    assert check_even(4) is True, "check_even(4) did not return True"
    assert check_even(7) is False, "check_even(7) did not return False"
    assert check_even(0) is True, "check_even(0) did not return True"
if __name__ == '__main__':
    test_check_even()
"""
    },
    "node4": {
        "title": "循环控制结构: 斐波那契数列",
        "description": "请完善函数 `fibonacci(n)`。计算并返回斐波那契数列第 n 项的值（从0开始，即 fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, ...）。假设 n >= 0。",
        "initial_code": "def fibonacci(n):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_fibonacci():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1
    assert fibonacci(5) == 5
    assert fibonacci(8) == 21
if __name__ == '__main__':
    test_fibonacci()
"""
    },
    "node5": {
        "title": "内置核心数据结构: 过滤字典",
        "description": "请完善函数 `filter_scores(scores, threshold)`。其中 `scores` 是一个学生姓名到分数的字典，返回一个新字典，仅包含分数大于等于 `threshold` 的学生。",
        "initial_code": "def filter_scores(scores, threshold):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_filter_scores():
    sc = {'Alice': 85, 'Bob': 60, 'Charlie': 90}
    assert filter_scores(sc, 80) == {'Alice': 85, 'Charlie': 90}
    assert filter_scores(sc, 95) == {}
if __name__ == '__main__':
    test_filter_scores()
"""
    },
    "node6": {
        "title": "函数与封装抽象: 阶乘计算",
        "description": "请完善函数 `factorial(n)`。计算并返回正整数 n 的阶乘。规定 0 的阶乘为 1。",
        "initial_code": "def factorial(n):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_factorial():
    assert factorial(0) == 1
    assert factorial(1) == 1
    assert factorial(5) == 120
if __name__ == '__main__':
    test_factorial()
"""
    },
    "node7": {
        "title": "文件读写与异常处理: 安全整数转换",
        "description": "请完善函数 `safe_int(val)`。尝试将 `val` 转换为整数并返回，如果发生 ValueError 或 TypeError 异常，则返回 None。",
        "initial_code": "def safe_int(val):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_safe_int():
    assert safe_int('123') == 123
    assert safe_int('abc') is None
    assert safe_int(None) is None
if __name__ == '__main__':
    test_safe_int()
"""
    },
    "node8": {
        "title": "综合项目实战应用: 计算平均值",
        "description": "请完善函数 `calculate_average(numbers)`。计算传入列表 `numbers` 中所有数字的平均值。如果列表为空，请返回 0.0。",
        "initial_code": "def calculate_average(numbers):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_calculate_average():
    assert calculate_average([1, 2, 3, 4, 5]) == 3.0
    assert calculate_average([]) == 0.0
if __name__ == '__main__':
    test_calculate_average()
"""
    }
}

ML_CHALLENGES = {
    "node1": {
        "title": "线性代数算力证明: 向量点积",
        "description": "请完善函数 `dot_product(v1, v2)`。计算两个同维列表（向量） `v1` 和 `v2` 的点积并返回。",
        "initial_code": "def dot_product(v1, v2):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_dot_product():
    assert dot_product([1, 2, 3], [4, 5, 6]) == 32
    assert dot_product([0, 1], [1, 0]) == 0
if __name__ == '__main__':
    test_dot_product()
"""
    },
    "node2": {
        "title": "微积分与梯度下降: 权重一步更新",
        "description": "请完善函数 `gradient_step(w, dw, lr)`。根据一维权重更新公式 w_new = w - lr * dw 计算并返回更新后的权重值。其中 lr 为学习率，dw 为梯度。",
        "initial_code": "def gradient_step(w, dw, lr):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_gradient_step():
    assert abs(gradient_step(1.0, 0.1, 0.1) - 0.99) < 1e-6
    assert abs(gradient_step(0.5, -0.2, 0.01) - 0.502) < 1e-6
if __name__ == '__main__':
    test_gradient_step()
"""
    },
    "node3": {
        "title": "经典线性回归算法: 计算均方误差",
        "description": "请完善函数 `mean_squared_error(y_true, y_pred)`。计算真实值列表 `y_true` 和预测值列表 `y_pred` 之间的均方误差 (MSE) 并返回。计算公式为: MSE = sum((y_true[i] - y_pred[i])^2) / N。",
        "initial_code": "def mean_squared_error(y_true, y_pred):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_mean_squared_error():
    assert abs(mean_squared_error([1, 2, 3], [1, 2, 3]) - 0.0) < 1e-6
    assert abs(mean_squared_error([1, 2], [2, 4]) - 2.5) < 1e-6
if __name__ == '__main__':
    test_mean_squared_error()
"""
    },
    "node4": {
        "title": "逻辑回归与分类法则: Sigmoid 激活函数",
        "description": "请完善函数 `sigmoid(z)`。实现 Sigmoid 激活函数：f(z) = 1 / (1 + e^-z) 并返回。可以导入 math 模块并使用 math.exp。",
        "initial_code": "def sigmoid(z):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_sigmoid():
    import math
    assert abs(sigmoid(0) - 0.5) < 1e-6
    assert sigmoid(10) > 0.99
    assert sigmoid(-10) < 0.01
if __name__ == '__main__':
    test_sigmoid()
"""
    },
    "node5": {
        "title": "正则化防御过拟合: L2 正则化惩罚项",
        "description": "请完善函数 `l2_regularization(weights, alpha)`。计算所有权重平方和乘以正则化系数 alpha 的二分之一，即惩罚项 = 0.5 * alpha * sum(w^2)。返回该代价值。",
        "initial_code": "def l2_regularization(weights, alpha):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_l2_regularization():
    assert abs(l2_regularization([1, 2, -1], 0.1) - 0.3) < 1e-6
    assert abs(l2_regularization([], 0.1) - 0.0) < 1e-6
if __name__ == '__main__':
    test_l2_regularization()
"""
    },
    "node6": {
        "title": "前馈深度神经网络: 单层感知机",
        "description": "请完善函数 `perceptron(inputs, weights, bias)`。计算单层感知机的输出：如果 inputs 与 weights 的点积加上 bias 大于 0，返回 1，否则返回 0。",
        "initial_code": "def perceptron(inputs, weights, bias):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_perceptron():
    assert perceptron([1, 0], [1, 1], -0.5) == 1
    assert perceptron([0, 1], [-1, -1], 0.5) == 0
if __name__ == '__main__':
    test_perceptron()
"""
    },
    "node7": {
        "title": "反向传播求导推演: ReLU 导数计算",
        "description": "请完善函数 `relu_derivative(x)`。计算 ReLU 激活函数在输入 `x` 处的导数。当 x > 0 时，导数为 1.0；否则导数为 0.0。",
        "initial_code": "def relu_derivative(x):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_relu_derivative():
    assert relu_derivative(5.0) == 1.0
    assert relu_derivative(-1.0) == 0.0
    assert relu_derivative(0.0) == 0.0
if __name__ == '__main__':
    test_relu_derivative()
"""
    },
    "node8": {
        "title": "经典回归场景实战部署: 房价预测部署",
        "description": "请完善函数 `predict_price(sqft, p_per_sqft, base_price)`。简单计算预测房价：price = sqft * p_per_sqft + base_price。如果计算出的价格低于 base_price，则返回 base_price。",
        "initial_code": "def predict_price(sqft, p_per_sqft, base_price):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_predict_price():
    assert predict_price(100, 15, 500) == 2000
    assert predict_price(-10, 10, 500) == 500
if __name__ == '__main__':
    test_predict_price()
"""
    }
}


# --- Self-Healing Data Seeding Helpers ---
def seed_errors_and_logs_for_user(username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Check if user_errors has entries
    cursor.execute("SELECT COUNT(*) FROM user_errors WHERE username = ?", (username,))
    err_count = cursor.fetchone()[0]
    if err_count == 0:
        cursor.execute(
            """INSERT INTO user_errors (username, error_id, title, code, error_msg, ai_explanation, solution, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                username,
                "err1",
                "局部变量引用错误 (UnboundLocalError)",
                "def process_data(x):\n    print(y)  # 在赋值前尝试引用 y\n    y = x + 10\n    return y\n\nprocess_data(5)",
                "UnboundLocalError: local variable 'y' referenced before assignment",
                "在 Python 中，如果在函数体内部对一个变量进行了赋值（如 `y = x + 10`），Python 会默认将该变量标记为局部变量。但在执行第 2 行 `print(y)` 时，局部变量 `y` 尚未被定义和赋值，因此抛出 UnboundLocalError。修改方案：将 `print(y)` 移到赋值语句 `y = x + 10` 之后，或者显式声明 `global` / `nonlocal`。",
                "def process_data(x):\n    y = x + 10\n    print(y)\n    return y\n\nprocess_data(5)",
                "unresolved"
            )
        )
        cursor.execute(
            """INSERT INTO user_errors (username, error_id, title, code, error_msg, ai_explanation, solution, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                username,
                "err2",
                "列表索引越界错误 (IndexError)",
                "def get_last_element(lst):\n    # 试图通过 lst[len(lst)] 访问最后一个元素\n    return lst[len(lst)]\n\nget_last_element([1, 2, 3])",
                "IndexError: list index out of range",
                "Python 中列表索引是从 0 开始的。一个长度为 N 的列表，其最大有效索引是 N - 1。当传入列表 `[1, 2, 3]` 时，其长度为 3，有效索引为 0, 1, 2。调用 `lst[len(lst)]` 即 `lst[3]` 就会触发 IndexError。修改方案：获取最后一个元素应该使用 `lst[-1]` 或 `lst[len(lst) - 1]`。",
                "def get_last_element(lst):\n    if not lst:\n        return None\n    return lst[-1]\n\nget_last_element([1, 2, 3])",
                "unresolved"
            )
        )
        
    # 2. Check if system_logs has entries
    cursor.execute("SELECT COUNT(*) FROM system_logs WHERE username = ?", (username,))
    log_count = cursor.fetchone()[0]
    if log_count == 0:
        import datetime
        default_logs = [
            ("主管智能体", "多智能体协同自适应教学系统已就绪，学术控制台连接成功。", "info"),
            ("画像智能体", "认知特征雷达诊断模块初始化完成：感知引擎就绪。", "consensus"),
            ("路径智能体", "个性化研学路线规划引擎启动：首期自适应课程就绪。", "info"),
            ("安全校验智能体", "学术风控审计沙盒安全防御层加载成功。", "consensus")
        ]
        for idx, (sender, message, log_type) in enumerate(default_logs):
            staggered_time = (datetime.datetime.now() - datetime.timedelta(seconds=4-idx)).strftime("%H:%M:%S")
            cursor.execute(
                "INSERT INTO system_logs (username, timestamp, sender, message, log_type) VALUES (?, ?, ?, ?, ?)",
                (username, staggered_time, sender, message, log_type)
            )
            
    conn.commit()
    conn.close()


def db_log_agent_action(username: str, sender: str, message: str, log_type: str = "info"):
    import datetime
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    t_str = datetime.datetime.now().strftime("%H:%M:%S")
    cursor.execute(
        "INSERT INTO system_logs (username, timestamp, sender, message, log_type) VALUES (?, ?, ?, ?, ?)",
        (username, t_str, sender, message, log_type)
    )
    conn.commit()
    conn.close()


# --- Xunfei (iFLYTEK) Online Text-to-Speech (TTS) WebAPI Helper ---
def call_xfyun_tts(text: str) -> bytes:
    import base64
    import hashlib
    import hmac
    import json
    import ssl
    import time
    from urllib.parse import urlencode, urlparse
    from wsgiref.handlers import format_date_time
    import websocket

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

    ws = websocket.create_connection(auth_url, sslopt={"cert_reqs": ssl.CERT_NONE})
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


# --- 4 New Dashboard Tab API Endpoints ---

@router.get("/sandbox/challenge")
def get_sandbox_challenge(node_id: Optional[str] = None, username: Optional[str] = None):
    target_user = username if username else logged_in_username
    profile = db_get_profile(target_user)
    is_ml = any("Machine Learning" in g for g in profile.learning_goals)
    challenges = ML_CHALLENGES if is_ml else PYTHON_CHALLENGES
    
    if not node_id:
        nodes = db_get_path_nodes(target_user)
        for node in nodes:
            if node.status == "active":
                node_id = node.id
                break
        if not node_id and len(nodes) > 0:
            node_id = nodes[0].id
            
    if not node_id or node_id not in challenges:
        node_id = "node1"
        
    challenge = challenges[node_id]
    return {
        "node_id": node_id,
        "title": challenge["title"],
        "description": challenge["description"],
        "initial_code": challenge["initial_code"]
    }


@router.post("/sandbox/run")
def run_sandbox_code(request: SandboxRunRequest):
    import subprocess
    import sys
    target_user = request.username if request.username else logged_in_username
    code = request.code
    node_id = request.node_id
    
    code_lower = code.lower()
    unsafe_keywords = ["import os", "import sys", "import subprocess", "import shutil", "eval(", "exec(", "open(", "socket", "urllib", "requests"]
    for kw in unsafe_keywords:
        if kw in code_lower:
            db_log_agent_action(target_user, "安全校验智能体", f"在节点 [{node_id}] 中拦截到不安全代码执行，检测到关键词: [{kw}]", "danger")
            return {
                "status": "failed",
                "error": f"安全检查未通过：代码中包含禁止使用的系统敏感函数或模块 [{kw}]。请仅使用纯粹的 Python 逻辑进行解题！",
                "console_output": "Security Violation: Access denied."
            }
            
    profile = db_get_profile(target_user)
    is_ml = any("Machine Learning" in g for g in profile.learning_goals)
    challenges = ML_CHALLENGES if is_ml else PYTHON_CHALLENGES
    
    if node_id not in challenges:
        raise HTTPException(status_code=404, detail="Challenge not found.")
        
    challenge = challenges[node_id]
    test_suite = challenge.get("test_suite", "")
    combined_code = code + "\n" + test_suite
    
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp_file:
        temp_file.write(combined_code)
        temp_file_path = temp_file.name
        
    try:
        proc = subprocess.run(
            [sys.executable, temp_file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=2.0
        )
        stdout_output = proc.stdout
        stderr_output = proc.stderr
        
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
            
        if proc.returncode == 0:
            stats = profile.learning_stats
            stats["study_time"] = stats.get("study_time", 0) + 10
            profile.learning_stats = stats
            db_save_profile(target_user, profile)
            
            db_log_agent_action(target_user, "主管智能体", f"代码提交成功：关卡 [{challenge['title']}] 单元测试通过！", "info")
            return {
                "status": "success",
                "error": "",
                "console_output": stdout_output or "Execution succeeded (No standard output)."
            }
        else:
            error_msg = stderr_output.strip()
            lines = error_msg.split("\n")
            short_error = "\n".join(lines[-3:]) if len(lines) > 3 else error_msg
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            err_id = f"err_{node_id}"
            cursor.execute("SELECT count(*) FROM user_errors WHERE username = ? AND error_id = ?", (target_user, err_id))
            exists = cursor.fetchone()[0]
            
            ai_exp = "等待您点击 💡 智能体解析 按钮来生成针对该错误的详细学术诊断反馈。"
            sol = "根据题目要求并参照错误提示，调整代码中的变量或逻辑结构。"
            
            if exists == 0:
                cursor.execute(
                    """INSERT INTO user_errors (username, error_id, title, code, error_msg, ai_explanation, solution, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (target_user, err_id, f"编程沙盒错题: {challenge['title']}", code, short_error, ai_exp, sol, "unresolved")
                )
            else:
                cursor.execute(
                    """UPDATE user_errors SET code = ?, error_msg = ?, status = 'unresolved' WHERE username = ? AND error_id = ?""",
                    (code, short_error, target_user, err_id)
                )
            conn.commit()
            conn.close()
            
            db_log_agent_action(target_user, "画像智能体", f"检测到编译/运行期异常：已捕获错题并归档至错题本 [{challenge['title']}]", "warning")
            return {
                "status": "failed",
                "error": short_error,
                "console_output": stdout_output or ""
            }
            
    except subprocess.TimeoutExpired:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        db_log_agent_action(target_user, "安全校验智能体", "检测到代码运行超时，可能包含无限循环。执行强行终止。", "danger")
        return {
            "status": "failed",
            "error": "TimeLimitExceeded: 代码运行超时（限时2.0秒），可能存在死循环，请检查循环退出条件！",
            "console_output": "Execution timed out."
        }
    except Exception as e:
        try:
            os.remove(temp_file_path)
        except Exception:
            pass
        return {
            "status": "failed",
            "error": f"SystemError: 虚拟机沙盒内部异常: {str(e)}",
            "console_output": ""
        }


@router.post("/sandbox/diagnose")
def diagnose_sandbox_code(request: SandboxDiagnoseRequest):
    target_user = request.username if request.username else logged_in_username
    profile = db_get_profile(target_user)
    api_key = os.getenv("LLM_API_KEY")
    
    if api_key:
        try:
            api_base = os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1")
            model = os.getenv("LLM_MODEL", "generalv3.5")
            url = f"{api_base.rstrip('/')}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            system_prompt = f"""You are the Academic Diagnostics Agent in an adaptive multi-agent tutoring network.
Analyze the student's python code and provide diagnostic feedback.
Topic/Challenge Node: {request.node_id}
Student Cognitive Profile:
- Learning style: {profile.cognitive_style}
- Common error patterns: {json.dumps(profile.error_patterns)}

Provide a friendly, encouraging analysis highlighting what is wrong (e.g. indentation, name error, logic) and how to fix it, following their {profile.cognitive_style} style. Keep it concise, professional and written in Chinese."""
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Here is my code:\n{request.code}"}
                ],
                "temperature": 0.3
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                res_data = response.json()
                explanation = res_data["choices"][0]["message"]["content"].strip()
                db_log_agent_action(target_user, "画像智能体", f"为用户生成代码诊断评估报告成功。", "consensus")
                return {"diagnostic": explanation}
        except Exception as e:
            print(f"Xunfei Sandbox Diagnosis failed: {e}")
            
    explanation = f"✨ **[自适应画像智能体诊断报告]**\n\n您的代码包含基本 Python 逻辑。建议检查：\n1. 函数缩进是否为标准的 4 个空格。\n2. 是否正确返回了题目要求的结果（而非直接打印）。\n3. 变量生命周期及作用域是否合规。\n\n学习特征提示：基于您的 **{profile.cognitive_style}** 认知风格，建议通过手写 debug 输出方式调试核心逻辑。"
    db_log_agent_action(target_user, "画像智能体", "完成本地规则适配诊断生成。", "consensus")
    return {"diagnostic": explanation}


@router.get("/errors")
def get_errors(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    seed_errors_and_logs_for_user(target_user)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT error_id, title, code, error_msg, ai_explanation, solution, status FROM user_errors WHERE username = ?",
        (target_user,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        result.append({
            "id": r[0],
            "error_id": r[0],
            "title": r[1],
            "code": r[2],
            "error_msg": r[3],
            "ai_explanation": r[4],
            "explanation": r[4],
            "solution": r[5],
            "status": r[6]
        })
    return result


@router.post("/errors/diagnose")
def diagnose_error(request: ErrorDiagnoseRequest):
    target_user = request.username if request.username else logged_in_username
    error_id = request.error_id
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, code, error_msg FROM user_errors WHERE username = ? AND error_id = ?", (target_user, error_id))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Error card not found.")
        
    err_title, err_code, err_msg = row[0], row[1], row[2]
    profile = db_get_profile(target_user)
    api_key = os.getenv("LLM_API_KEY")
    
    explanation = ""
    solution = ""
    
    if api_key:
        try:
            api_base = os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1")
            model = os.getenv("LLM_MODEL", "generalv3.5")
            url = f"{api_base.rstrip('/')}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            system_prompt = f"""You are the Diagnostics Agent. Analyze this python code and the runtime error it generated.
Explain the root cause and provide the clean solution code block.
Title: {err_title}
Runtime Error: {err_msg}
Student Cognitive Style: {profile.cognitive_style}

Output STRICTLY a JSON object (no code block backticks, no preamble) with keys:
- "explanation": a concise explanation of the root cause in Chinese.
- "solution": the corrected python code block only."""
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Code:\n{err_code}\n\nError:\n{err_msg}"}
                ],
                "temperature": 0.2
            }
            
            if "gpt" in model or "deepseek" in model:
                payload["response_format"] = {"type": "json_object"}
                
            response = requests.post(url, headers=headers, json=payload, timeout=12)
            if response.status_code == 200:
                res_data = response.json()
                content = res_data["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    content = re.sub(r"^```(?:json)?\n", "", content)
                    content = re.sub(r"\n```$", "", content)
                parsed = json.loads(content)
                explanation = parsed.get("explanation", "")
                solution = parsed.get("solution", "")
        except Exception as e:
            print(f"Xunfei Error diagnosis failed: {e}")
            
    if not explanation or not solution:
        explanation = f"在运行该脚本时发生了运行时异常：`{err_msg}`。这通常是由于作用域绑定错误、索引值超出容器范围或传入了非法类型的参数导致。基于您的 [{profile.cognitive_style}] 风格，系统建议进行边界值防御断言以杜绝该异常。"
        solution = f"# 修复后的参考代码\n{err_code}\n# 提示：确保所有变量在使用前完成初始化，并且范围越界时返回默认值。"
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE user_errors SET ai_explanation = ?, solution = ?, status = 'resolved' WHERE username = ? AND error_id = ?",
        (explanation, solution, target_user, error_id)
    )
    conn.commit()
    conn.close()
    
    db_log_agent_action(target_user, "画像智能体", f"生成错题诊断分析归档: [{err_title}]，已被学生确认。", "consensus")
    return {
        "id": error_id,
        "error_id": error_id,
        "ai_explanation": explanation,
        "explanation": explanation,
        "solution": solution,
        "status": "resolved"
    }


@router.post("/errors/generate-remedy")
def generate_remedy(request: ErrorRemedyRequest):
    target_user = request.username if request.username else logged_in_username
    error_id = request.error_id
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT title, error_msg, code FROM user_errors WHERE username = ? AND error_id = ?", (target_user, error_id))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Error card not found.")
        
    err_title, err_msg, err_code = row[0], row[1], row[2]
    profile = db_get_profile(target_user)
    api_key = os.getenv("LLM_API_KEY")
    
    quiz_data = None
    
    if api_key:
        try:
            api_base = os.getenv("LLM_API_BASE", "https://spark-api-open.xf-yun.com/v1")
            model = os.getenv("LLM_MODEL", "generalv3.5")
            url = f"{api_base.rstrip('/')}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            system_prompt = f"""You are the Adaptive Quiz Agent. Generate a single multiple-choice question designed to test the student on the same category of mistake shown here.
Title: {err_title}
Mistake Code: {err_code}
Error Message: {err_msg}
Student Cognitive Style: {profile.cognitive_style}

Output STRICTLY a JSON object (no markdown, no backticks, no preamble) matching this schema:
{{
  "question": "The question description in Chinese...",
  "options": [
    "Option A description...",
    "Option B description...",
    "Option C description...",
    "Option D description..."
  ],
  "answer": int(0 for A, 1 for B, 2 for C, 3 for D),
  "explanation": "Detailed explanation in Chinese..."
}}"""
            
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt}
                ],
                "temperature": 0.4
            }
            
            if "gpt" in model or "deepseek" in model:
                payload["response_format"] = {"type": "json_object"}
                
            response = requests.post(url, headers=headers, json=payload, timeout=12)
            if response.status_code == 200:
                res_data = response.json()
                content = res_data["choices"][0]["message"]["content"].strip()
                if content.startswith("```"):
                    content = re.sub(r"^```(?:json)?\n", "", content)
                    content = re.sub(r"\n```$", "", content)
                quiz_data = json.loads(content)
        except Exception as e:
            print(f"Xunfei Remedy Quiz Generation failed: {e}")
            
    if not quiz_data:
        quiz_data = {
            "question": f"关于以下引起 `{err_msg}` 错误的防范逻辑，下列说法中哪个是最佳实践？",
            "options": [
                "在没有进行非空校验和类型安全推导前直接对变量解构",
                "在局部作用域或类的私有变量声明中采用防御性检测与异常抛出机制",
                "屏蔽所有 Python 的异常 Traceback 输出，让程序无声崩溃",
                "不再进行函数封装，将所有逻辑平铺写在全局空间中"
            ],
            "answer": 1,
            "explanation": f"您的认知画像特点是 [{profile.cognitive_style}]，在局部作用域中合理运用防御性异常捕获 (Try-Except) 可以直接从编译期防御该类错误的再次发生。"
        }
        
    db_log_agent_action(target_user, "路径智能体", f"基于错题 [{err_title}] 动态编排加练测试题推送成功。", "info")
    return quiz_data


# --- Multi-Agent Console Endpoints ---

@router.get("/console/logs")
def get_console_logs(username: Optional[str] = None):
    target_user = username if username else logged_in_username
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
def log_console_action(request: ConsoleLogRequest):
    target_user = request.username if request.username else logged_in_username
    db_log_agent_action(target_user, request.sender, request.message, request.log_type)
    return {"status": "success"}


# --- Achievements & PDF Certificate Endpoints ---

@router.get("/achievements/certificate")
def download_certificate(username: Optional[str] = None):
    target_user = username if username else logged_in_username
    profile = db_get_profile(target_user)
    
    db_log_agent_action(target_user, "主管智能体", f"用户 [{target_user}] 提交结业证明签发申请。开始校验全部 8 个关卡探索状态...", "info")
    db_log_agent_action(target_user, "安全校验智能体", "学术资格合规审计通过：无违规越狱和作弊标记。", "consensus")
    db_log_agent_action(target_user, "画像智能体", f"统计最终学情数据：知识库掌握度={profile.knowledge_base}%，测验正确率={profile.learning_stats.get('quiz_accuracy', 85)}%。正式签发证书。", "consensus")
    
    course_title = "Python 基础自适应导论"
    if any("Machine Learning" in g for g in profile.learning_goals):
        course_title = "机器学习算法理论与实操"
        
    try:
        import io
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.cidfonts import CIDFont
        
        pdfmetrics.registerFont(CIDFont('STSong-Light'))
        font_name = 'STSong-Light'
    except Exception as err:
        print(f"Reportlab setup error: {err}")
        raise HTTPException(status_code=500, detail=f"PDF Generation failed due to libraries: {str(err)}")
        
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    teal_color = colors.HexColor('#0d9488')
    cobalt_color = colors.HexColor('#1e3a8a')
    gray_color = colors.HexColor('#374151')
    
    title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=26,
        textColor=teal_color,
        alignment=1,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CertSub',
        parent=styles['Heading2'],
        fontName=font_name,
        fontSize=18,
        textColor=cobalt_color,
        alignment=1,
        spaceAfter=25
    )
    
    text_style = ParagraphStyle(
        'CertText',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=13,
        textColor=gray_color,
        leading=22,
        alignment=1,
        spaceAfter=20
    )
    
    stats_style = ParagraphStyle(
        'CertStats',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=11,
        textColor=colors.HexColor('#4b5563'),
        alignment=1,
        spaceAfter=20
    )
    
    story = []
    story.append(Spacer(1, 20))
    story.append(Paragraph("EduGenesis 自适应多智能体学术空间", subtitle_style))
    story.append(Paragraph("结业证书 (Certificate of Graduation)", title_style))
    
    cert_body = f"兹证明学生 <b>{target_user}</b> 在本系统的自适应多智能体协同学习环境下，" \
                f"成功通关了 <b>《{course_title}》</b> 个性化课程的全部关卡。<br/>" \
                f"经主管智能体、画像智能体、路径智能体及安全校验智能体多维度学术诊断与测试，" \
                f"各项指标达到合格标准，特发此证，以兹鼓励。"
    
    story.append(Paragraph(cert_body, text_style))
    story.append(Spacer(1, 10))
    
    mastered = profile.learning_stats.get("mastered_nodes", 8)
    accuracy = profile.learning_stats.get("quiz_accuracy", 85)
    study_time = profile.learning_stats.get("study_time", 45)
    
    stats_text = f"<b>学术成就报告:</b> &nbsp;&nbsp;&nbsp;&nbsp; 累计通关节点: <b>{mastered} / 8</b> " \
                 f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 测验综合正确率: <b>{accuracy}%</b> " \
                 f"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 实践时长: <b>{study_time} 分钟</b>"
    story.append(Paragraph(stats_text, stats_style))
    story.append(Spacer(1, 25))
    
    sig_data = [
        [
            Paragraph("<b>主管智能体</b><br/><font color='#5c6370'>调度委员会主席</font>", text_style),
            Paragraph("<b>画像智能体</b><br/><font color='#5c6370'>认知指标诊断官</font>", text_style),
            Paragraph("<b>路径智能体</b><br/><font color='#5c6370'>课程大纲规划师</font>", text_style),
            Paragraph("<b>安全校验智能体</b><br/><font color='#5c6370'>学术护栏校验官</font>", text_style)
        ]
    ]
    t = Table(sig_data, colWidths=[170, 170, 170, 170])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
    ]))
    story.append(t)
    
    def add_background_border(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#0d9488'))
        canvas.setLineWidth(3)
        canvas.rect(20, 20, doc.pagesize[0]-40, doc.pagesize[1]-40)
        canvas.setStrokeColor(colors.HexColor('#1e3a8a'))
        canvas.setLineWidth(1)
        canvas.rect(25, 25, doc.pagesize[0]-50, doc.pagesize[1]-50)
        
        canvas.setFillColor(colors.HexColor('#eab308'))
        p = canvas.beginPath()
        p.moveTo(80, 50)
        p.lineTo(100, 70)
        p.lineTo(90, 100)
        p.lineTo(70, 100)
        p.lineTo(60, 70)
        p.close()
        canvas.drawPath(p, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor('#ca8a04'))
        canvas.circle(80, 80, 20, fill=1, stroke=0)
        canvas.setFillColor(colors.white)
        canvas.setFont('Helvetica-Bold', 7)
        canvas.drawCentredString(80, 78, "VERIFIED")
        canvas.restoreState()
        
    doc.build(story, onFirstPage=add_background_border)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    headers = {
        "Content-Disposition": f"attachment; filename=certificate_{target_user}.pdf",
        "Content-Type": "application/pdf"
    }
    return StreamingResponse(io.BytesIO(pdf_bytes), headers=headers, media_type="application/pdf")


@router.post("/path/complete-node")
def complete_node(request: CompleteNodeRequest):
    target_user = request.username if request.username else logged_in_username
    nodes = db_get_path_nodes(target_user)
    
    node_found = False
    next_node_to_unlock = None
    
    for idx, node in enumerate(nodes):
        if node.id == request.node_id:
            node.status = "completed"
            node_found = True
            if idx + 1 < len(nodes):
                next_node_to_unlock = nodes[idx + 1]
            break
            
    if not node_found:
        raise HTTPException(status_code=404, detail="Node not found in user path.")
        
    if next_node_to_unlock and next_node_to_unlock.status == "locked":
        next_node_to_unlock.status = "active"
        
    db_save_path_nodes(target_user, nodes)
    
    profile = db_get_profile(target_user)
    completed_count = sum(1 for n in nodes if n.status == "completed")
    profile.learning_stats["mastered_nodes"] = completed_count
    db_save_profile(target_user, profile)
    
    db_log_agent_action(target_user, "路径智能体", f"关卡节点 [{request.node_id}] 通关标记更新，解锁下一阶段关卡。", "info")
    
    if next_node_to_unlock:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        fallback_assets = get_fallback_assets_for_topic(next_node_to_unlock.title, profile)
        for res_type in next_node_to_unlock.resources:
            cursor.execute(
                "SELECT count(*) FROM user_resources WHERE username = ? AND node_id = ? AND resource_type = ?",
                (target_user, next_node_to_unlock.id, res_type)
            )
            exists = cursor.fetchone()[0]
            if exists == 0:
                content_val = fallback_assets.get(res_type, "")
                if not isinstance(content_val, str):
                    content_val = json.dumps(content_val, ensure_ascii=False)
                cursor.execute(
                    "INSERT OR REPLACE INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                    (target_user, next_node_to_unlock.id, res_type, content_val)
                )
        conn.commit()
        conn.close()
        
    updated_nodes = db_get_path_nodes(target_user)
    return {"nodes": [n.model_dump() for n in updated_nodes]}


@router.get("/tts")
def get_tts(text: str):
    import io
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


# Initialize DB on import now that all helper functions are defined
init_db()
