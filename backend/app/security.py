import ast

# AST static analyzer for python sandbox safety
def is_code_safe(code: str) -> (bool, str):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        # If the code has compile errors, pass check and let pytest show error details
        return True, ""

    allowed_modules = {"math"}
    forbidden_calls = {"eval", "exec", "open", "compile", "globals", "locals", "getattr", "setattr", "delattr", "dir", "vars", "breakpoint"}

    for node in ast.walk(tree):
        # 1. Imports check
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name not in allowed_modules:
                    return False, f"在安全沙盒中不允许导入模块 '{alias.name}'（安全校验智能体限制）。"
        elif isinstance(node, ast.ImportFrom):
            if node.module not in allowed_modules:
                return False, f"在安全沙盒中不允许从模块 '{node.module}' 导入（安全校验智能体限制）。"

        # 2. Dangerous function calls
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in forbidden_calls:
                    return False, f"不允许使用危险的内置函数 '{node.func.id}'（安全校验智能体限制）。"
            elif isinstance(node.func, ast.Attribute):
                if node.func.attr in forbidden_calls:
                    return False, f"不允许调用危险属性/函数 '{node.func.attr}'（安全校验智能体限制）。"

        # 3. Dunder attribute access
        if isinstance(node, ast.Attribute):
            blocked_dunders = {"__class__", "__subclasses__", "__globals__", "__code__", "__dict__", "__init__", "__new__"}
            if node.attr in blocked_dunders:
                return False, f"安全校验智能体拦截：禁止访问系统内部属性 '{node.attr}'。"

    return True, ""
