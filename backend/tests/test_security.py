import pytest
from app.security import is_code_safe

def test_safe_code():
    # Standard, safe code samples
    safe_code_1 = """
def check_even(num):
    if num % 2 == 0:
        return True
    return False
"""
    safe_code_2 = """
import math
def circle_area(r):
    return math.pi * r * r
"""
    is_safe, msg = is_code_safe(safe_code_1)
    assert is_safe is True
    assert msg == ""

    is_safe, msg = is_code_safe(safe_code_2)
    assert is_safe is True
    assert msg == ""

def test_forbidden_imports():
    # Importing dangerous module like os
    unsafe_import = "import os\nos.system('echo dangerous')"
    is_safe, msg = is_code_safe(unsafe_import)
    assert is_safe is False
    assert "不允许导入模块" in msg

    unsafe_from_import = "from sys import exit\nexit(0)"
    is_safe, msg = is_code_safe(unsafe_from_import)
    assert is_safe is False
    assert "不允许从模块" in msg

def test_forbidden_identifiers_and_dunders():
    # Referencing banned identifiers
    unsafe_banned = "eval('1 + 1')"
    is_safe, msg = is_code_safe(unsafe_banned)
    assert is_safe is False
    assert "禁止使用敏感标识符/变量" in msg

    # Accessing dunder attributes directly
    unsafe_attr = "object.__class__"
    is_safe, msg = is_code_safe(unsafe_attr)
    assert is_safe is False
    assert "禁止访问系统内部属性或方法" in msg

def test_string_dunder_escapes():
    # String literal contains dunder
    unsafe_str = "x = '__class__'"
    is_safe, msg = is_code_safe(unsafe_str)
    assert is_safe is False
    assert "禁止在字符串中包含双下划线" in msg

    # Concatenated bypasses containing dunder in strings
    unsafe_concat = "x = 'test__' + 'bypass'"
    is_safe, msg = is_code_safe(unsafe_concat)
    assert is_safe is False
    assert "禁止在字符串中包含双下划线" in msg

def test_fstring_dunder_escapes():
    # Format/f-strings containing dunder
    unsafe_fstring = "f'testing {object.__class__}'"
    is_safe, msg = is_code_safe(unsafe_fstring)
    # The f-string itself triggers AST checks on Attribute and potentially JoinedStr containing dunder
    assert is_safe is False

def test_security_agent_code_scanning():
    from app.agents.coordinator import SecurityAgent
    
    agent = SecurityAgent()
    
    # 1. Context with safe code block
    context_safe = {
        "username": "test_user",
        "node_title": "Test Title",
        "node_resources": ["pdf"],
        "generated_data": {
            "pdf": "这里是一段教材内容：\n```python\nx = 10\ny = 20\nprint(x + y)\n```"
        },
        "fallback_assets": {
            "pdf": "Fallback content"
        }
    }
    res_safe = agent.run(context_safe)
    assert res_safe["security_passed"] is True
    assert res_safe["generated_data"]["pdf"] != "Fallback content"
    
    # 2. Context with unsafe code block (using import os)
    context_unsafe = {
        "username": "test_user",
        "node_title": "Test Title",
        "node_resources": ["pdf"],
        "generated_data": {
            "pdf": "这里是一段教材内容：\n```python\nimport os\nos.system('echo bad')\n```"
        },
        "fallback_assets": {
            "pdf": "Fallback content"
        }
    }
    res_unsafe = agent.run(context_unsafe)
    assert res_unsafe["security_passed"] is False
    assert res_unsafe["generated_data"]["pdf"] == "Fallback content"

def test_agent_command_bus_log_and_dispatch():
    from app.agents.coordinator import AgentCommandBus
    
    # Test dispatching a command from Tutor to Path Planner
    AgentCommandBus.send_command(
        sender="AI助教聊天",
        recipient="路径大纲规划",
        command="REPLAN_PATH",
        payload={"kb_score": 80, "pace_score": 80},
        username="test_user"
    )
    
    # Verify log is written to system_logs table
    import sqlite3
    from app.db import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT sender, message FROM system_logs WHERE username = 'test_user' ORDER BY rowid DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    
    assert len(rows) >= 2
    
    senders = [r[0] for r in rows]
    messages = [r[1] for r in rows]
    
    # Assert Tutor -> Path Planner REPLAN_PATH command exists
    assert any("AI助教聊天 ➔ 路径大纲规划" in s for s in senders)
    assert any("REPLAN_PATH" in m for m in messages)
    
    # Assert Path Planner confirmation log exists
    assert any("路径大纲规划" in s for s in senders)
    assert any("重新规划已完成" in m for m in messages)
    
    # Assert Path Planner -> Resource Generator PRE_GENERATE_RESOURCES command exists
    assert any("路径大纲规划 ➔ 学术资源生成" in s for s in senders)
    assert any("PRE_GENERATE_RESOURCES" in m for m in messages)
