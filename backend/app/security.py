import ast

# AST static analyzer for python sandbox safety
def is_code_safe(code: str) -> (bool, str):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        # If the code has compile errors, pass check and let pytest show error details
        return True, ""

    allowed_modules = {"math"}
    
    # Combined forbidden symbols (both calling them and referencing them are blocked)
    forbidden_symbols = {
        "__import__",
        "eval",
        "exec",
        "open",
        "compile",
        "globals",
        "locals",
        "getattr",
        "setattr",
        "delattr",
        "dir",
        "vars",
        "breakpoint",
        "input",
        "help",
        "__builtins__",
        "__loader__",
        "__spec__",
        "__class__",
        "__subclasses__",
        "__globals__",
        "__code__",
        "__dict__",
        "__init__",
        "__new__",
        "__getattribute__",
        "__getitem__",
        "__class_getitem__"
    }

    for node in ast.walk(tree):
        # 1. Imports check
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name not in allowed_modules:
                    return False, f"在安全沙盒中不允许导入模块 '{alias.name}'（安全校验智能体限制）。"
        elif isinstance(node, ast.ImportFrom):
            if node.module not in allowed_modules:
                return False, f"在安全沙盒中不允许从模块 '{node.module}' 导入（安全校验智能体限制）。"

        # 2. Block name references to forbidden symbols or starting with __
        if isinstance(node, ast.Name):
            if node.id in forbidden_symbols or node.id.startswith("__"):
                return False, f"安全校验智能体拦截：禁止使用敏感标识符/变量 '{node.id}'。"

        # 3. Block attribute access starting with __ or matching forbidden words
        if isinstance(node, ast.Attribute):
            if node.attr.startswith("__") or node.attr in forbidden_symbols:
                return False, f"安全校验智能体拦截：禁止访问系统内部属性或方法 '{node.attr}'。"

        # 4. Block string constants containing '__' to prevent dynamic bypass (e.g. '__cl' + 'ass__')
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            if "__" in node.value:
                return False, "安全校验智能体拦截：防逃逸机制禁止在字符串中包含双下划线 '__'。"
        elif isinstance(node, ast.Str) and isinstance(node.s, str):
            if "__" in node.s:
                return False, "安全校验智能体拦截：防逃逸机制禁止在字符串中包含双下划线 '__'。"

        # 5. Block format strings or dynamic f-strings containing double underscores
        if isinstance(node, ast.JoinedStr):
            for value in node.values:
                if isinstance(value, ast.Constant) and isinstance(value.value, str):
                    if "__" in value.value:
                        return False, "安全校验智能体拦截：禁止在 f-string 中包含双下划线 '__'。"
                elif isinstance(value, ast.Str) and isinstance(value.s, str):
                    if "__" in value.s:
                        return False, "安全校验智能体拦截：禁止在 f-string 中包含双下划线 '__'。"

    return True, ""

