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
