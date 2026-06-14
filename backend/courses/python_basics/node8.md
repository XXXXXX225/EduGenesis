# Python 综合项目实战与自动化单元测试

本章节整合前面学过的所有知识点，实现一个具备防御性参数校验、异常处理以及 Pytest 自动化测试套件的命令行应用程序。

## 1. 结构化项目设计
实现一个简单的学生学情成绩管理计算系统。包含以下功能：
* 输入学生分数并计算均值、标准差。
* 过滤异常的无效成绩。
* 可视化报告生成（格式化控制台输出）。

## 2. 自动化单元测试 (Pytest Framework)
测试是验证系统正确性的核心手段。编写专门的断言测试脚本验证边界条件（例如：空输入、非法负数分数）：
```python
import pytest

def calculate_average(scores):
    if not scores:
        return 0
    if any(s < 0 or s > 100 for s in scores):
        raise ValueError("分数必须在 0 到 100 之间")
    return sum(scores) / len(scores)

def test_average_normal():
    assert calculate_average([90, 80, 70]) == 80

def test_average_empty():
    assert calculate_average([]) == 0

def test_average_invalid():
    with pytest.raises(ValueError):
        calculate_average([90, -10])
```

## 3. 防御性工程规范
在真实开发中，所有的核心算法和业务逻辑都必须拥有对应的测试用例保护，防止重构时引入历史退化 Bug。
