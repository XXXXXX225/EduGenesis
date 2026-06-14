# Python 控制流分支与条件判断

控制流决定了程序在不同条件下的执行路径。在 Python 中，控制流通过缩进来标识代码块，这是与其他语言（如使用花括号 `{}`）最显著的区别。

## 1. If-Elif-Else 分支结构
Python 使用结构化的条件判断分支：
```python
if condition_a:
    # 执行块 A
elif condition_b:
    # 执行块 B
else:
    # 执行兜底块
```

## 2. 缩进规则（Indentation）
Python 严格依靠缩进（推荐 4 个空格）来区分代码块。混合使用空格和 Tab 会导致 `TabError` 或 `IndentationError`。良好的 IDE 会自动将 Tab 转换为 4 个空格。

## 3. 逻辑运算符与成员运算符
* **逻辑联结**：使用 `and`（与）、`or`（或）、`not`（非）。
* **成员检索**：`in` 和 `not in` 运算符可以优雅地检索一个元素是否存在于列表、元组、字典或集合中。
* **防御性断言**：在进入特定分支前，可以使用 `assert` 确保前置条件成立。
