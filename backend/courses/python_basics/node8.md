# 综合项目实战应用：CLI 账单管理工具

本章将通过一个完整的综合实战案例，串联环境部署、变量类型、控制流、循环结构、核心数据容器、函数抽象、文件读写及异常处理的所有前置知识，构建一个健壮的命令行（CLI）账单管理工具。

## 1. 业务逻辑设计与结构封装
我们将设计一个账单管理器，能够将账单记录持久化保存到文本文件中。包含三个核心 API 函数：
1. `load_bills(filepath)`：安全载入文件，解析为账单数据结构。
2. `add_bill(filepath, item, amount)`：校验参数后追加新账单，并保存。
3. `calculate_total(filepath)`：读取账单文件，求和并计算总额。

账单文件每一行采用逗号分隔的结构：`项目名称,金额`。

## 2. 核心模块实现
以下是该 CLI 工具的完整代码实现：

```python
# -*- coding: utf-8 -*-
import os

def load_bills(filepath):
    """
    安全读取账单文件，返回账单列表。每个账单以字典形式表示。
    """
    bills = []
    if not os.path.exists(filepath):
        return bills
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split(",")
                if len(parts) != 2:
                    continue  # 忽略格式破损的行
                item, amount_str = parts[0].strip(), parts[1].strip()
                try:
                    amount = float(amount_str)
                    bills.append({"item": item, "amount": amount})
                except ValueError:
                    continue  # 忽略金额解析失败的行
    except Exception as e:
        print(f"读取账单文件出错: {e}")
    return bills

def add_bill(filepath, item, amount):
    """
    向账单文件中追加一条新记录，带防御性校验。
    """
    if not item:
        raise ValueError("账单项目名称不能为空")
    try:
        val = float(amount)
        if val <= 0:
            raise ValueError("账单金额必须大于0")
    except (TypeError, ValueError):
        raise ValueError("账单金额必须是合法的数值类型")
        
    # 追加模式写入文件
    try:
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(f"{item},{val}\n")
    except Exception as e:
        raise RuntimeError(f"保存账单数据失败: {e}")
    return True

def calculate_total(filepath):
    """
    读取账单并返回总金额。
    """
    bills = load_bills(filepath)
    total = sum(bill["amount"] for bill in bills)
    return total
```

## 3. Pytest 单元测试验证
为了确保我们的 CLI 核心引擎完全符合设计预期，我们需要在同一目录下编写单元测试用例进行校验：

```python
# test_billing.py
import pytest

def test_add_and_calculate(tmp_path):
    # 使用 pytest 提供的 tmp_path 临时目录以避免污染工作区
    test_file = tmp_path / "test_bills.txt"
    filepath = str(test_file)
    
    # 1. 验证新文件初始化为空
    assert calculate_total(filepath) == 0.0
    
    # 2. 添加正常数据
    add_bill(filepath, "餐饮", 45.5)
    add_bill(filepath, "交通", 12.0)
    
    # 3. 验证总额求和
    assert calculate_total(filepath) == 57.5
    
    # 4. 验证金额校验异常拦截
    with pytest.raises(ValueError, match="金额必须大于0"):
        add_bill(filepath, "娱乐", -10.0)
        
    with pytest.raises(ValueError, match="金额必须是合法的"):
        add_bill(filepath, "娱乐", "abc")
```
在虚拟环境下运行 `pytest` 命令，该测试通过后，即可证明我们的账单管理核心引擎具备出色的健壮性与稳定性。
