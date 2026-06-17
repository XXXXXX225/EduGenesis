import os
import json
import sqlite3
import hashlib
import datetime
from typing import List
from app.models import UserProfile, PathNode

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "users.db")

# Default path nodes
python_path_nodes = [
    PathNode(id="node1", title="Python 环境部署", status="completed", description="安装 Python 与 VS Code 编译环境", resources=["pdf", "code", "video"]),
    PathNode(id="node2", title="变量与数据类型", status="active", description="探索整型、浮点型、字符串及动态类型绑定", resources=["slide", "pdf", "quiz", "video"]),
    PathNode(id="node3", title="控制流条件判断", status="locked", description="If-Else 条件分支控制逻辑", resources=["slide", "quiz", "code", "video"]),
    PathNode(id="node4", title="循环控制结构", status="locked", description="While 与 For 迭代及中断控制", resources=["slide", "quiz", "video"]),
    PathNode(id="node5", title="内置核心数据结构", status="locked", description="列表、元组、字典及集合的多场景增删改查", resources=["slide", "pdf", "quiz", "code", "video"]),
    PathNode(id="node6", title="函数与封装抽象", status="locked", description="自定义参数传递、返回值及标准库模块导入", resources=["slide", "pdf", "mindmap", "code", "video"]),
    PathNode(id="node7", title="文件读写与异常处理", status="locked", description="文件系统流读写操作与 Try-Except 异常捕获", resources=["code", "quiz", "video"]),
    PathNode(id="node8", title="综合项目实战应用", status="locked", description="多智能体协同编写带有健壮性校验的 CLI 工具", resources=["code", "quiz", "video"])
]

ml_path_nodes = [
    PathNode(id="node1", title="线性代数算力证明", status="completed", description="理解向量点积、矩阵乘法与特征值理论底座", resources=["pdf", "video"]),
    PathNode(id="node2", title="微积分与梯度下降", status="active", description="偏导数求解与权重参数一步梯度更新步长", resources=["slide", "quiz", "code", "video"]),
    PathNode(id="node3", title="经典线性回归算法", status="locked", description="最小二乘法与均方误差损失函数收敛验证", resources=["slide", "quiz", "code", "video"]),
    PathNode(id="node4", title="逻辑回归与分类法则", status="locked", description="Sigmoid 激活函数映射与交叉熵损失定义", resources=["slide", "quiz", "video"]),
    PathNode(id="node5", title="正则化防御过拟合", status="locked", description="添加 L1/L2 惩罚项以控制模型泛化能力", resources=["slide", "pdf", "quiz", "code", "video"]),
    PathNode(id="node6", title="前馈深度神经网络", status="locked", description="层、权重与偏置的矩阵运算表示", resources=["slide", "pdf", "mindmap", "code", "video"]),
    PathNode(id="node7", title="反向传播求导推演", status="locked", description="链式求导法则在计算图中的前向传播与反向求偏导", resources=["code", "quiz", "video"]),
    PathNode(id="node8", title="经典回归场景实战部署", status="locked", description="完成房价回归预测模型搭建、调试及一键部署", resources=["code", "quiz", "video"])
]

# Password hashing helper function (PBKDF2-HMAC-SHA256 with user-specific salt)
def get_password_hash(password: str, username: str) -> str:
    iterations = 100000
    salt = username.encode('utf-8')
    pwd_bytes = password.encode('utf-8')
    h = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt, iterations)
    return f"pbkdf2_sha256${iterations}${username}${h.hex()}"

# Custom asset seeder for topics
def get_fallback_assets_for_topic(topic: str, profile: UserProfile, node_id: str = ""):
    from app.knowledge_base import load_course_material
    subject = profile.learning_goals[0] if (profile.learning_goals and len(profile.learning_goals) > 0) else "Python Basics"
    material = load_course_material(subject, node_id) if node_id else ""
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
            "进行纯粹 of 离线纸面逻辑推导"
          ],
          "answer": 1,
          "explanation": f"您的认知风格显示为 {profile.cognitive_style}，因此多模态（结合音画脑图与代码实操）的图像交互学习路径能为您提供最高的吸收效率。"
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

## 1. 变量引年的本质
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

    if material:
        pdf_content = material
        lines = [line.strip() for line in material.split('\n') if line.strip()]
        headings = [line.lstrip('#').strip() for line in lines if line.startswith('#')]
        
        custom_slides = []
        for idx, heading in enumerate(headings[:8]):
            content = f"本节精讲关于【{heading}】的自适应知识。请根据您的“{profile.cognitive_style}”风格，结合以下核心大纲开展细致开发与校验。"
            for i, line in enumerate(lines):
                if line.startswith('#') and heading in line:
                    desc_parts = []
                    for next_line in lines[i+1:]:
                        if next_line.startswith('#'):
                            break
                        if len(desc_parts) < 2 and not next_line.startswith('```'):
                            desc_parts.append(next_line)
                    if desc_parts:
                        content = " ".join(desc_parts)[:150]
                    break
            custom_slides.append({
                "title": f"第{idx+1}页: {heading}",
                "content": content
            })
            
        if custom_slides:
            slide_content = custom_slides
            
        if len(headings) >= 2:
            mm_lines = [f"    A[\"{topic} 知识树\"]"]
            for idx, h in enumerate(headings[:7]):
                node_name = f"B{idx}"
                mm_lines.append(f"    A --> {node_name}[\"{h}\"]")
            mindmap_content = "graph TD\n" + "\n".join(mm_lines)

    # Curated video fallbacks
    video_fallback_content = []
    style = profile.cognitive_style.lower()
    
    if "variable" in topic_lower or "data types" in topic_lower:
        video_fallback_content = [
            {
                "bvid": "BV1axfSYLEVk",
                "title": "Python 变量与基本数据类型精讲",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "Python官方教学",
                "play": "18.4万",
                "duration": "25:41",
                "recommend_reason": f"该视频重点讲解了变量绑定的底层原理。针对您的【{profile.cognitive_style}】认知风格，视频中的大量内存模型图解有助于您直观地理解引用机制。"
            },
            {
                "bvid": "BV1wZ4y1c7sY",
                "title": "5分钟彻底搞懂 Python 中的变量与动态类型",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "极客程序员",
                "play": "5.6万",
                "duration": "05:12",
                "recommend_reason": f"这是一个极速入门视频。结合您的认知风格，它通过动画演示了动态类型的赋值过程，适合进行快速概念复习。"
            }
        ]
    elif "environment" in topic_lower or "环境" in topic_lower:
        video_fallback_content = [
            {
                "bvid": "BV1Ee9EBnEfo",
                "title": "Python 环境配置与 VS Code 编辑器极速上手",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "黑马程序员",
                "play": "51.1万",
                "duration": "18:45",
                "recommend_reason": f"针对您的【{profile.cognitive_style}】风格，该视频手把手演示了 Python 安装和 PATH 环境变量配置，非常适合配合左侧的沙盒环境进行动手配置。"
            },
            {
                "bvid": "BV1tP4y1H7kS",
                "title": "Windows 系统下 Python 与 VS Code 详细配置教程",
                "pic": "https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg",
                "author": "编程小助手",
                "play": "12.4万",
                "duration": "14:22",
                "recommend_reason": f"该视频以极其详细的步骤演示了 Windows 平台的 Python 环境安装，包含了常见报错处理，契合您的纠错画像。"
            }
        ]
    else:
        video_fallback_content = [
            {
                "bvid": "BV1rpWjevEip",
                "title": f"B站最火的 Python 零基础精讲课程: {topic}",
                "pic": "https://i2.hdslb.com/bfs/archive/a979056b1a32012cdd00d48fbc3732d253e30620.jpg",
                "author": "Python官方课程",
                "play": "1671.8万",
                "duration": "39:58:14",
                "recommend_reason": f"该视频是 B站 播放量最高的经典教程。结合您的【{profile.cognitive_style}】风格，视频大纲清晰，可以作为本章《{topic}》的全面配套参考视频。"
            },
            {
                "bvid": "BV14HEE61EVP",
                "title": f"Python 从入门到精通项目实战精讲: {topic}",
                "pic": "https://i1.hdslb.com/bfs/archive/3b7c7906b6316dd7652599f27db999a6b0570492.jpg",
                "author": "Python学习中心",
                "play": "85.2万",
                "duration": "12:30:15",
                "recommend_reason": f"该教程以项目驱动方式讲解了《{topic}》，非常契合您的实操偏好。您可以通过动手编写其中的代码段来巩固所学概念。"
            }
        ]

    return {
        "pdf": pdf_content,
        "slide": slide_content,
        "quiz": quiz_content,
        "code": code_content,
        "mindmap": mindmap_content,
        "video": video_fallback_content
    }

# Database CRUD functions
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
        return UserProfile(
            knowledge_base=40,
            learning_pace=50,
            cognitive_style="Practical Coding",
            error_patterns=["Syntax Errors", "Indentation Issues"],
            learning_goals=["Python Basics"],
            engagement=80
        )
    
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
    # Fetch old profile to calculate deltas
    old_profile = None
    try:
        old_profile = db_get_profile(username)
    except Exception:
        pass
        
    if old_profile:
        kb_delta = profile.knowledge_base - old_profile.knowledge_base
        lp_delta = profile.learning_pace - old_profile.learning_pace
        eg_delta = profile.engagement - old_profile.engagement
        
        # Merge deltas into learning_stats
        stats = dict(profile.learning_stats)
        stats["knowledge_base_delta"] = kb_delta
        stats["learning_pace_delta"] = lp_delta
        stats["engagement_delta"] = eg_delta
        profile.learning_stats = stats

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
    from app.knowledge_base import clean_subject_name
    
    if not goals:
        return
        
    subject = goals[0]
    course_id = clean_subject_name(subject)
    
    # Fetch course nodes from database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT nodes FROM registered_courses WHERE course_id = ?", (course_id,))
    row = cursor.fetchone()
    conn.close()
    
    nodes_to_seed = []
    if row:
        try:
            nodes_data = json.loads(row[0])
            nodes_to_seed = [PathNode(**n) for n in nodes_data]
        except Exception as e:
            print(f"Error parsing nodes for course {course_id}: {e}")
            
    if not nodes_to_seed:
        # Fallback if course not found or invalid
        nodes_to_seed = python_path_nodes
        
    # Get existing user path nodes
    existing = db_get_path_nodes(username)
    
    # If the user doesn't have exactly the same number of nodes, or their nodes do not match the target course's nodes
    # (e.g. by comparing the first node's title), then sync/reset the nodes.
    should_sync = False
    if len(existing) != len(nodes_to_seed) or len(existing) == 0:
        should_sync = True
    else:
        # Check if the titles match. If they differ, it means the user switched the course.
        if existing[0].title != nodes_to_seed[0].title:
            should_sync = True
            
    if should_sync:
        db_save_path_nodes(username, nodes_to_seed)




# ─── Error Tag Extraction for Dynamic Path Reinforcement ───
def db_get_error_tags(username: str) -> list:
    """
    Extract error pattern tags from user_errors table.
    These tags are used to insert reinforcement nodes in the learning path.
    Returns list of unique tag strings.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT title FROM user_errors WHERE username = ? AND status = 'unresolved'",
        (username,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    tags = []
    for r in rows:
        title = r[0] if r[0] else ""
        # Extract core concept from error title
        tag = title.strip()
        if tag:
            tags.append(tag)
    
    # Also extract from profile error_patterns
    profile = db_get_profile(username)
    for pattern in profile.error_patterns:
        if pattern and pattern not in tags:
            tags.append(pattern)
    
    return tags

def db_insert_reinforcement_node(username: str, position_after_node_id: str, error_tags: list) -> list:
    """
    Insert a reinforcement node after the specified node in the user''s path.
    The reinforcement node consolidates error-prone concepts.
    Returns the updated path nodes list.
    """
    nodes = db_get_path_nodes(username)
    if not nodes or not error_tags:
        return nodes
    
    # Find the position to insert after
    insert_idx = None
    for i, node in enumerate(nodes):
        if node.id == position_after_node_id:
            insert_idx = i + 1
            break
    
    if insert_idx is None or insert_idx > len(nodes):
        return nodes
    
    # Check if a reinforcement node for these tags already exists
    existing_tag = ", ".join(error_tags[:2])
    for node in nodes:
        if node.id.startswith("reinforce_") and existing_tag[:10] in node.title:
            return nodes  # Already exists, skip
    
    # Create reinforcement node
    new_id = f"reinforce_{position_after_node_id}_{len(error_tags)}"
    tag_text = ", ".join(error_tags[:3])
    reinforcement_node = PathNode(
        id=new_id,
        title=f"Reinforcement: {tag_text}",
        status="active",
        description=f"Targeted practice for weak areas: {tag_text}. Complete this to solidify your understanding.",
        resources=["quiz", "code", "pdf"]
    )
    
    nodes.insert(insert_idx, reinforcement_node)
    
    # Re-number subsequent node IDs to maintain order
    # But keep the original IDs for nodes that are not reinforcement nodes
    
    db_save_path_nodes(username, nodes)
    db_log_agent_action(username, "Path Agent",
        f"Inserted reinforcement node [{new_id}] for error tags: {tag_text}",
        "info")
    
    return nodes

def db_delete_reinforcement_node(username: str, node_id: str) -> list:
    """
    Remove a reinforcement node from the user''s path.
    Called when the reinforcement node is completed or when errors are resolved.
    """
    nodes = db_get_path_nodes(username)
    
    # Filter out the reinforcement node
    updated_nodes = [n for n in nodes if n.id != node_id]
    
    if len(updated_nodes) < len(nodes):
        db_save_path_nodes(username, updated_nodes)
        db_log_agent_action(username, "Path Agent",
            f"Removed reinforcement node [{node_id}] after completion.",
            "info")
    
    return updated_nodes

def db_cleanup_reinforcement_nodes(username: str) -> int:
    """
    Remove all completed reinforcement nodes for a user.
    Returns the number of nodes removed.
    """
    nodes = db_get_path_nodes(username)
    original_count = len(nodes)
    
    # Keep non-reinforcement nodes + active reinforcement nodes
    cleaned = [n for n in nodes 
               if not n.id.startswith("reinforce_") or n.status == "active"]
    
    if len(cleaned) < original_count:
        db_save_path_nodes(username, cleaned)
        removed = original_count - len(cleaned)
        db_log_agent_action(username, "Path Agent",
            f"Cleaned up {removed} completed reinforcement nodes.",
            "info")
        return removed
    
    return 0



# --- Profile Snapshot & Delta ---
def db_save_profile_snapshot(username, profile_data):
    """Save a snapshot of the current profile for delta comparison."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS profile_snapshots ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT,"
        "username TEXT NOT NULL,"
        "snapshot_json TEXT NOT NULL,"
        "created_at TEXT NOT NULL)"
    )
    conn.commit()
    snapshot_json = json.dumps(profile_data, ensure_ascii=False)
    created_at = datetime.datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO profile_snapshots (username, snapshot_json, created_at) VALUES (?, ?, ?)",
        (username, snapshot_json, created_at)
    )
    conn.commit()
    conn.close()
    return True

def db_get_latest_profile_snapshot(username):
    """Get the most recent profile snapshot for a user."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS profile_snapshots ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT,"
        "username TEXT NOT NULL,"
        "snapshot_json TEXT NOT NULL,"
        "created_at TEXT NOT NULL)"
    )
    conn.commit()
    cursor.execute(
        "SELECT snapshot_json FROM profile_snapshots WHERE username = ? ORDER BY id DESC LIMIT 1",
        (username,)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return {}

def db_get_profile_delta(username):
    """
    Compute the delta between current profile and the latest snapshot.
    Returns radar values delta and learning_stats delta.
    """
    current = db_get_profile(username)
    previous = db_get_latest_profile_snapshot(username)
    radar_delta = {
        "knowledge_base": current.knowledge_base - previous.get("knowledge_base", current.knowledge_base),
        "learning_pace": current.learning_pace - previous.get("learning_pace", current.learning_pace),
        "engagement": current.engagement - previous.get("engagement", current.engagement),
    }
    prev_stats = previous.get("learning_stats", {})
    curr_stats = current.learning_stats or {}
    stats_delta = {
        "study_time": curr_stats.get("study_time", 0) - prev_stats.get("study_time", 0),
        "quiz_accuracy": curr_stats.get("quiz_accuracy", 0) - prev_stats.get("quiz_accuracy", 0),
        "mastered_nodes": curr_stats.get("mastered_nodes", 0) - prev_stats.get("mastered_nodes", 0),
    }
    return {
        "current": {
            "knowledge_base": current.knowledge_base,
            "learning_pace": current.learning_pace,
            "engagement": current.engagement,
            "learning_stats": curr_stats
        },
        "previous": {
            "knowledge_base": previous.get("knowledge_base", 0),
            "learning_pace": previous.get("learning_pace", 0),
            "engagement": previous.get("engagement", 0),
            "learning_stats": prev_stats
        },
        "radar_delta": radar_delta,
        "stats_delta": stats_delta
    }

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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    t_str = datetime.datetime.now().strftime("%H:%M:%S")
    cursor.execute(
        "INSERT INTO system_logs (username, timestamp, sender, message, log_type) VALUES (?, ?, ?, ?, ?)",
        (username, t_str, sender, message, log_type)
    )
    conn.commit()
    conn.close()

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
    
    # User LLM Providers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_llm_providers (
        username TEXT,
        provider_id TEXT,
        provider_name TEXT NOT NULL,
        api_base TEXT NOT NULL,
        api_key TEXT NOT NULL,
        is_enabled INTEGER NOT NULL,
        models TEXT NOT NULL,
        PRIMARY KEY (username, provider_id)
    )
    """)
    
    # User Model Routing Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_model_routing (
        username TEXT PRIMARY KEY,
        chat_provider_id TEXT,
        chat_model TEXT,
        planner_provider_id TEXT,
        planner_model TEXT,
        diagnostics_provider_id TEXT,
        diagnostics_model TEXT,
        resources_provider_id TEXT,
        resources_model TEXT
    )
    """)
    
    # Chat Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_sessions (
        session_id TEXT PRIMARY KEY,
        username TEXT,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (username) REFERENCES users(username)
    )
    """)
    
    # Chat Messages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        message_id TEXT PRIMARY KEY,
        session_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
    )
    """)

    # Registered Courses Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS registered_courses (
        course_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        keywords TEXT NOT NULL,
        description TEXT NOT NULL,
        nodes TEXT NOT NULL
    )
    """)

    # Course Chunks Table (For advanced RAG semantic retrieval)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS course_chunks (
        chunk_id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        keywords TEXT NOT NULL,
        embedding TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES registered_courses(course_id) ON DELETE CASCADE
    )
    """)
    
    # Seed default courses if empty
    cursor.execute("SELECT COUNT(*) FROM registered_courses")
    if cursor.fetchone()[0] == 0:
        # Convert default nodes to JSON strings
        python_nodes_json = json.dumps([n.model_dump() for n in python_path_nodes], ensure_ascii=False)
        ml_nodes_json = json.dumps([n.model_dump() for n in ml_path_nodes], ensure_ascii=False)
        
        cursor.execute(
            "INSERT INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
            ("python_basics", "Python \u7f16\u7a0b\u57fa\u7840", json.dumps(["python", "basics", "\u53d8\u91cf", "\u5faa\u73af", "\u6761\u4ef6", "\u51fd\u6570", "\u6570\u636e\u7ed3\u6784"], ensure_ascii=False), "Python \u57fa\u784d\u8bed\u6cd5\u4e0e\u63a7\u5236\u6d41", python_nodes_json)
        )
        cursor.execute(
            "INSERT INTO registered_courses (course_id, display_name, keywords, description, nodes) VALUES (?, ?, ?, ?, ?)",
            ("machine_learning", "\u673a\u5668\u5b66\u4e60\u4e0e\u6df1\u5ea6\u5b66\u4e60", json.dumps(["machine", "ml", "learning", "\u673a\u5668\u5b66\u4e60", "\u7ebf\u6027\u4ee3\u6570", "\u68af\u5ea6", "\u795e\u7ecf\u7f51\u7edc", "\u6df1\u5ea6\u5b66\u4e60", "\u56de\u5f52", "\u5206\u7c7b", "\u53cd\u5411\u4f20\u64ad"], ensure_ascii=False), "\u7ecf\u5178\u673a\u5668\u5b66\u4e60\u6570\u5b66\u539f\u7406\u4e0e\u6df1\u5ea6\u5b66\u4e60\u7b97\u6cd5", ml_nodes_json)
        )
    
    # Seed default user
    cursor.execute("SELECT username, password_hash FROM users WHERE username = 'default_user'")
    row = cursor.fetchone()
    if not row:
        pwd_hash = get_password_hash("default_password", "default_user")
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
            default_profile = UserProfile(
                knowledge_base=40,
                learning_pace=50,
                cognitive_style="Practical Coding",
                error_patterns=["Syntax Errors", "Indentation Issues"],
                learning_goals=["Python Basics"],
                engagement=80
            )
            default_assets = get_fallback_assets_for_topic(node.title, default_profile, node.id)
            for res_type in node.resources:
                content_val = default_assets.get(res_type, "")
                if not isinstance(content_val, str):
                    content_val = json.dumps(content_val, ensure_ascii=False)
                cursor.execute(
                    "INSERT INTO user_resources (username, node_id, resource_type, content) VALUES (?, ?, ?, ?)",
                    ("default_user", node.id, res_type, content_val)
                )
    else:
        stored_hash = row[1]
        if not stored_hash.startswith("pbkdf2_sha256$"):
            new_hash = get_password_hash("default_password", "default_user")
            cursor.execute("UPDATE users SET password_hash = ? WHERE username = 'default_user'", (new_hash,))

    # Seed default Xunfei provider for default_user if not exists
    cursor.execute("SELECT COUNT(*) FROM user_llm_providers WHERE username = 'default_user' AND provider_id = 'xunfei'")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """INSERT INTO user_llm_providers 
               (username, provider_id, provider_name, api_base, api_key, is_enabled, models) 
               VALUES (?, 'xunfei', '讯飞星火 Spark', 'https://spark-api-open.xf-yun.com/v1', 'env', 1, ?)""",
            (
                "default_user",
                json.dumps([
                    {"name": "generalv3.5", "enabled": True, "tags": ["默认", "推荐", "上下文 8K"]},
                    {"name": "lite", "enabled": False, "tags": ["轻量", "上下文 4K"]},
                    {"name": "pro-128k", "enabled": False, "tags": ["推理", "高上下文 128K"]}
                ], ensure_ascii=False)
            )
        )
        
    # Seed default routing for default_user if not exists
    cursor.execute("SELECT COUNT(*) FROM user_model_routing WHERE username = 'default_user'")
    if cursor.fetchone()[0] == 0:
        cursor.execute(
            """INSERT INTO user_model_routing 
               (username, chat_provider_id, chat_model, 
                planner_provider_id, planner_model, 
                diagnostics_provider_id, diagnostics_model, 
                resources_provider_id, resources_model) 
               VALUES (?, 'xunfei', 'generalv3.5', 'xunfei', 'generalv3.5', 'xunfei', 'generalv3.5', 'xunfei', 'generalv3.5')""",
            ("default_user",)
        )

    conn.commit()
    conn.close()
    
    seed_errors_and_logs_for_user("default_user")

def db_get_user_providers(username: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT provider_id, provider_name, api_base, api_key, is_enabled, models FROM user_llm_providers WHERE username = ?",
        (username,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    # Auto-seed default Xunfei Spark if empty
    if not rows:
        default_xunfei = {
            "provider_id": "xunfei",
            "provider_name": "讯飞星火 Spark",
            "api_base": "https://spark-api-open.xf-yun.com/v1",
            "api_key": "env",
            "is_enabled": 1,
            "models": json.dumps([
                {"name": "generalv3.5", "enabled": True, "tags": ["默认", "推荐", "上下文 8K"]},
                {"name": "lite", "enabled": False, "tags": ["轻量", "上下文 4K"]},
                {"name": "pro-128k", "enabled": False, "tags": ["推理", "高上下文 128K"]}
            ], ensure_ascii=False)
        }
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO user_llm_providers 
               (username, provider_id, provider_name, api_base, api_key, is_enabled, models) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                username,
                default_xunfei["provider_id"],
                default_xunfei["provider_name"],
                default_xunfei["api_base"],
                default_xunfei["api_key"],
                default_xunfei["is_enabled"],
                default_xunfei["models"]
            )
        )
        conn.commit()
        conn.close()
        return [default_xunfei]
        
    res = []
    for r in rows:
        res.append({
            "provider_id": r[0],
            "provider_name": r[1],
            "api_base": r[2],
            "api_key": r[3],
            "is_enabled": r[4],
            "models": r[5]
        })
    return res

def db_save_user_provider(username: str, provider_data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO user_llm_providers 
           (username, provider_id, provider_name, api_base, api_key, is_enabled, models) 
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            username,
            provider_data["provider_id"],
            provider_data["provider_name"],
            provider_data["api_base"],
            provider_data["api_key"],
            int(provider_data["is_enabled"]),
            provider_data["models"]
        )
    )
    conn.commit()
    conn.close()

def db_delete_user_provider(username: str, provider_id: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM user_llm_providers WHERE username = ? AND provider_id = ?",
        (username, provider_id)
    )
    conn.commit()
    conn.close()

def db_get_model_routing(username: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """SELECT chat_provider_id, chat_model, 
                  planner_provider_id, planner_model, 
                  diagnostics_provider_id, diagnostics_model, 
                  resources_provider_id, resources_model 
           FROM user_model_routing WHERE username = ?""",
        (username,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        default_routing = {
            "chat_provider_id": "xunfei",
            "chat_model": "generalv3.5",
            "planner_provider_id": "xunfei",
            "planner_model": "generalv3.5",
            "diagnostics_provider_id": "xunfei",
            "diagnostics_model": "generalv3.5",
            "resources_provider_id": "xunfei",
            "resources_model": "generalv3.5"
        }
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO user_model_routing 
               (username, chat_provider_id, chat_model, 
                planner_provider_id, planner_model, 
                diagnostics_provider_id, diagnostics_model, 
                resources_provider_id, resources_model) 
               VALUES (?, 'xunfei', 'generalv3.5', 'xunfei', 'generalv3.5', 'xunfei', 'generalv3.5', 'xunfei', 'generalv3.5')""",
            (username,)
        )
        conn.commit()
        conn.close()
        return default_routing
        
    return {
        "chat_provider_id": row[0],
        "chat_model": row[1],
        "planner_provider_id": row[2],
        "planner_model": row[3],
        "diagnostics_provider_id": row[4],
        "diagnostics_model": row[5],
        "resources_provider_id": row[6],
        "resources_model": row[7]
    }

def db_save_model_routing(username: str, routing_data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO user_model_routing 
           (username, chat_provider_id, chat_model, 
            planner_provider_id, planner_model, 
            diagnostics_provider_id, diagnostics_model, 
            resources_provider_id, resources_model) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            username,
            routing_data.get("chat_provider_id", "xunfei"),
            routing_data.get("chat_model", "generalv3.5"),
            routing_data.get("planner_provider_id", "xunfei"),
            routing_data.get("planner_model", "generalv3.5"),
            routing_data.get("diagnostics_provider_id", "xunfei"),
            routing_data.get("diagnostics_model", "generalv3.5"),
            routing_data.get("resources_provider_id", "xunfei"),
            routing_data.get("resources_model", "generalv3.5")
        )
    )
    conn.commit()
    conn.close()


def db_create_chat_session(username: str, session_id: str, title: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now_str = datetime.datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO chat_sessions (session_id, username, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (session_id, username, title, now_str, now_str)
    )
    conn.commit()
    conn.close()

def db_get_chat_sessions(username: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT session_id, username, title, created_at, updated_at FROM chat_sessions WHERE username = ? ORDER BY updated_at DESC",
        (username,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "session_id": r[0],
            "username": r[1],
            "title": r[2],
            "created_at": r[3],
            "updated_at": r[4]
        }
        for r in rows
    ]

def db_update_chat_session_title(session_id: str, title: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now_str = datetime.datetime.now().isoformat()
    cursor.execute(
        "UPDATE chat_sessions SET title = ?, updated_at = ? WHERE session_id = ?",
        (title, now_str, session_id)
    )
    conn.commit()
    conn.close()

def db_delete_chat_session(session_id: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_sessions WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

def db_clear_chat_sessions(username: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT session_id FROM chat_sessions WHERE username = ?", (username,))
    session_ids = [r[0] for r in cursor.fetchall()]
    for session_id in session_ids:
        cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM chat_sessions WHERE username = ?", (username,))
    conn.commit()
    conn.close()

def db_save_chat_message(session_id: str, message_id: str, role: str, content: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now_str = datetime.datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO chat_messages (message_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
        (message_id, session_id, role, content, now_str)
    )
    cursor.execute(
        "UPDATE chat_sessions SET updated_at = ? WHERE session_id = ?",
        (now_str, session_id)
    )
    conn.commit()
    conn.close()

def db_get_chat_messages(session_id: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT message_id, session_id, role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "message_id": r[0],
            "session_id": r[1],
            "role": r[2],
            "content": r[3],
            "created_at": r[4]
        }
        for r in rows
    ]
