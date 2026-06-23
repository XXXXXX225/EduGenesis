# -*- coding: utf-8 -*-
# EduGenesis Demonstration Course Resources Database

import math

PYTHON_BASICS_RESOURCES = {
    "node1": {
        "quiz": [
            {
                "question": "关于 Python 环境变量中的 PATH，下列说法正确的是？",
                "options": [
                    "它只用来加速下载第三方包，与命令执行无关",
                    "必须把 python.exe 所在的目录加入 PATH，终端才能全局直接通过命令运行 python",
                    "它是一个安全沙盒限制，防止 Python 访问系统核心文件",
                    "PATH 在 Windows 下无效，只在 Linux / macOS 下起作用"
                ],
                "answer": 1,
                "explanation": "系统终端依靠 PATH 环境变量去寻找可执行程序。如果不把 python.exe 所在的文件夹加入 PATH，终端就会提示‘命令未找到’。"
            },
            {
                "question": "在使用 pip 安装 Python 第三方库时，为了加速国内的下载速度，我们通常会做什么？",
                "options": [
                    "频繁插拔网线以重置网关缓存",
                    "配置并切换到国内镜像源（如清华大学、阿里云或豆瓣镜像）",
                    "升级操作系统的防火墙级别",
                    "使用 Python 的解释器多线程编译参数"
                ],
                "answer": 1,
                "explanation": "默认的官方 PyPI 源服务器在国外，国内网络直接连接可能会很慢甚至连接超时。国内高校和企业提供了同步的镜像源（如清华源、阿里源），切换国内镜像源可大幅提升下载速度。"
            },
            {
                "question": "在 VS Code 中开发 Python，哪一个核心扩展插件是官方推荐且必须安装 of？",
                "options": [
                    "Docker 插件",
                    "Chinese (Simplified) 汉化插件",
                    "Python (by Microsoft) 官方插件",
                    "Auto Rename Tag 插件"
                ],
                "answer": 2,
                "explanation": "由微软官方发布的 Python 插件提供了核心的代码自动补全（Pylance）、Linting 语法检测、代码格式化（Black/Ruff）以及断点调试（Debugger）支持，是开发必配插件。"
            }
        ],
        "slides": [
            {"title": "1. 解释器与 IDE 配置大纲", "content": "理解解释器与集成开发环境（IDE）的区别。解释器负责将 Python 代码编译为字节码并执行；IDE 负责编写、组织与调试代码。"},
            {"title": "2. 环境变量 (PATH) 的本质", "content": "PATH 是操作系统级的文件查找路径列表。在安装 Python 时勾选 'Add to PATH' 可以自动将解释器二进制路径注册到 PATH 列表中，便于终端全局调用。"},
            {"title": "3. 编写第一个 Hello World 脚本", "content": "新建 'app.py'，写入 `print('Hello EduGenesis')`，在终端中输入 `python app.py` 即可激活运行。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# Python 环境检测脚本

import sys
import os
import json

def test_python_interpreter():
    # 验证主版本号大于或等于 3
    major_version = sys.version_info.major
    print(f"当前 Python 版本: {sys.version}")
    assert major_version >= 3, "请使用 Python 3 及以上版本进行开发"

def test_json_module_load():
    # 验证基础内置标准库可用性
    data = {"platform": "EduGenesis", "course": "Python Basics"}
    json_str = json.dumps(data)
    loaded = json.loads(json_str)
    assert loaded["platform"] == "EduGenesis"
    assert loaded["course"] == "Python Basics"
""",
        "videos": [
            {
                "bvid": "BV1Ee9EBnEfo",
                "title": "Python 环境配置与 VS Code 编辑器极速上手",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "黑马程序员",
                "play": "51.1万",
                "duration": "18:45",
                "recommend_reason": "该视频非常清晰地演示了 Windows/macOS 系统下安装 Python 解释器以及配置 VS Code 开发套件的步骤，适合零基础学习。"
            }
        ]
    },
    "node2": {
        "quiz": [
            {
                "question": "在 Python 中，声明 a = [1, 2]，随后执行 b = a。当执行 a.append(3) 后，b 的值会是多少？",
                "options": [
                    "[1, 2]",
                    "[1, 2, 3]",
                    "抛出 RuntimeError 运行时异常",
                    "None"
                ],
                "answer": 1,
                "explanation": "在 Python 中，赋值 `b = a` 只是创建了对同一个列表对象的另一个引用（标签）。由于列表是可变数据类型（Mutable），通过 `a` 修改对象时，指向相同地址的 `b` 读出的数据也会一并更新。"
            },
            {
                "question": "关于 Python 中的数据类型，下列说法错误的是哪一项？",
                "options": [
                    "整型 (int) 具有任意精度，可以表示无限大的整数",
                    "浮点数 (float) 底层对应双精度，没有单独的 double 类型",
                    "字符串 (str) 是不可变类型，不能对其中某一位字符直接赋值修改",
                    "布尔值 (bool) 不属于数值类型，它是一个全新的底层原始类型"
                ],
                "answer": 3,
                "explanation": "在 Python 中，布尔类型 `bool` 实际上是整型 `int` 的子类（Subclass）。`True` 对应数值 `1`，`False` 对应数值 `0`。你可以用 `isinstance(True, int)` 验证得到 True。"
            },
            {
                "question": "按照 PEP 8 命名规范，普通变量名称、函数名称推荐使用什么命名规范？",
                "options": [
                    "驼峰命名法（camelCase，例如 userAge）",
                    "大驼峰命名法（PascalCase，例如 UserAge）",
                    "下划线蛇形命名法（snake_case，例如 user_age）",
                    "匈牙利命名法（例如 iUserAge）"
                ],
                "answer": 2,
                "explanation": "Python 官方推荐 PEP 8 规范：普通变量和函数名使用小写字母和下划线（snake_case）；类名使用大驼峰命名（PascalCase）；常量使用全大写字母（UPPER_CASE）。"
            }
        ],
        "slides": [
            {"title": "1. 变量与动态绑定", "content": "Python 变量不需要显式声明类型。变量是对象的引用（标签），同一个变量名在运行中可以随时重新绑定到其他类型的数据对象上。"},
            {"title": "2. 数值类型 int 与 float", "content": "Python 内置高精度 int，支持超长整数；float 使用 64 位双精度浮点数存储，可表示绝大多数科学计算值。"},
            {"title": "3. 字符类型与不可变性", "content": "字符串 `str` 在内存中一经创建就无法就地修改。更改字符串会直接在内存中分配并生成全新的字符串对象。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 变量类型与引用测试

def test_variable_reference():
    # 建立对象绑定
    a = [10, 20]
    b = a  # 传递引用
    a.append(30)
    
    # 验证 a 与 b 是否指向同一引用
    assert b == [10, 20, 30]
    assert id(a) == id(b)

def test_immutable_type():
    s = "Edu"
    assert s + "Genesis" == "EduGenesis"
    # s += "Genesis" 只是重新绑定引用，原 "Edu" 并没有变
    assert s == "Edu"
""",
        "videos": [
            {
                "bvid": "BV1axfSYLEVk",
                "title": "Python 变量与基本数据类型精讲",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "Python官方教学",
                "play": "18.4万",
                "duration": "25:41",
                "recommend_reason": "视频中通过大量图表展示了变量绑定的内存地址分配，适合对引用机制感到困惑的学生学习。"
            }
        ]
    },
    "node3": {
        "quiz": [
            {
                "question": "在 Python 中进行条件判断时，以下哪个对象在求值时会被判定为布尔假值（Falsy）？",
                "options": [
                    "数字 0.0",
                    "包含单个空格的字符串 \" \"",
                    "含有数字的列表 [0]",
                    "字符串 \"False\""
                ],
                "answer": 0,
                "explanation": "Python 的 Falsy 假值包括：`None`、`False`、数值零（`0`、`0.0`、`0j`）、空序列与空容器（`\"\"`、`[]`、`()`、`{}`、`set()`）。其余对象如含有空格的字符串、含有 0 的列表等都是 True。"
            },
            {
                "question": "关于 Python 中的多分支结构 `if-elif-else`，下列说法正确的是？",
                "options": [
                    "不管条件是否满足，程序必定会把每个 if 和 elif 的语句体全部执行一遍",
                    "它只在满足第一个为 True 的条件分支时执行其对应的语句块，随后直接跳出整个多分支结构",
                    "Python 会同时并行执行多个为 True 的分支",
                    "elif 必须出现在 else 后面，否则会编译报错"
                ],
                "answer": 1,
                "explanation": "if-elif-else 是顺序独占式执行的。一旦从上到下发现第一个条件为 True 的分支，便会执行对应的语句体，执行完后直接跳出（短路），不再评估后续分支的条件。"
            },
            {
                "question": "假设已知变量 `a = True`, `b = False`。下列布尔逻辑表达式中，求值结果为 True 的是？",
                "options": [
                    "not a",
                    "a and b",
                    "a or b",
                    "not (a or not b)"
                ],
                "answer": 2,
                "explanation": "`a or b` 会在其中任何一个变量为 True 时返回 True。由于 a 为 True，所以 `a or b` 是 True。"
            }
        ],
        "slides": [
            {"title": "1. 条件判断逻辑控制", "content": "控制流的核心在于 `if-elif-else` 分支。代码块利用缩进（Indentation，推荐 4 个空格）划分层次，取代了花括号。"},
            {"title": "2. 布尔真假值测试", "content": "Python 采用非常灵活的真假值判定。数字 0、空列表 `[]`、空字典 `{}` 等均在条件判断中被评估为假（Falsy），简化了空值防护。"},
            {"title": "3. 逻辑运算符与短路评估", "content": "布尔运算包含 `and`, `or`, `not`。`and` 与 `or` 具有短路评估特性：如果前半部分已决定最终结果，则不会计算后半部分。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 条件控制流逻辑测试

def evaluate_score_level(score):
    if score >= 90:
        return "Excellent"
    elif score >= 60:
        return "Pass"
    else:
        return "Fail"

def test_score_level_flow():
    assert evaluate_score_level(95) == "Excellent"
    assert evaluate_score_level(75) == "Pass"
    assert evaluate_score_level(40) == "Fail"

def test_falsy_evaluation():
    empty_list = []
    empty_str = ""
    zero_num = 0
    
    # 验证空容器、零在布尔上下文中为假值
    assert not empty_list
    assert not empty_str
    assert not zero_num
""",
        "videos": [
            {
                "bvid": "BV1w84y1p7gH",
                "title": "零基础学 Python：控制流与 if 条件分支",
                "pic": "https://i0.hdslb.com/bfs/archive/4b6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "课代表阿伟",
                "play": "12.2万",
                "duration": "14:15",
                "recommend_reason": "视频中生动形象地介绍了条件分叉，并详细讲解了缩进的规范性，适合刚入门的学生练习规范编码。"
            }
        ]
    },
    "node4": {
        "quiz": [
            {
                "question": "在 Python 循环中，关键字 `break` 和 `continue` 的本质区别是？",
                "options": [
                    "break 只是跳过当前这次循环，continue 会永久终止循环并跳出",
                    "break 用于进入下一层嵌套循环，continue 用于退出当前函数",
                    "break 会直接终止并退出当前的整个循环体；continue 则是结束当次循环，直接进入下一次的循环条件判断",
                    "两者功能完全一致，只是针对 for 和 while 的写法不同"
                ],
                "answer": 2,
                "explanation": "`break` 会立即打断并退出最近一层的整个循环语句；而 `continue` 是跳过当前循环体内剩下的代码，立即跳往循环顶部，开始下一次的迭代与条件检测。"
            },
            {
                "question": "关于 Python 循环语句（`for` 或 `while`）后面附带的 `else` 子句，下列说法正确的是？",
                "options": [
                    "else 子句每次循环迭代都会被执行一次",
                    "else 子句只有在循环体因为执行了 break 语句被强行打断时，才会被触发执行",
                    "else 子句在循环体正常迭代完毕（条件变为 False 退出）时被执行。若循环是被 break 强行打断的，则 else 不会被执行",
                    "else 必须出现在 try-except 后面，不能和循环语句搭配使用"
                ],
                "answer": 2,
                "explanation": "Python 的 loop-else 结构中，`else` 代表“非 break 退出”。即如果循环完整地执行完（比如 for 正常遍历完列表，while 条件自然变为 False），`else` 就会执行；如果被 `break` 提前截断，`else` 则被跳过。"
            },
            {
                "question": "使用 `range(1, 5)` 进行 for 循环，循环体一共会被执行多少次？",
                "options": [
                    "3 次",
                    "4 次",
                    "5 次",
                    "根据系统环境动态决定次数"
                ],
                "answer": 1,
                "explanation": "`range(start, stop)` 具有“左闭右开”（含头不含尾）的特征。`range(1, 5)` 生成的序列为 `[1, 2, 3, 4]`，因此循环体共执行 4 次。"
            }
        ],
        "slides": [
            {"title": "1. For 与 While 循环控制", "content": "Python 提供了两种循环结构：`while` 用于基于条件的重复，`for` 用于迭代任何序列/容器中的元素。"},
            {"title": "2. 循环打破与跳过", "content": "利用 `break` 能够即时停止整个循环体；利用 `continue` 能够过滤当前轮次剩余的操作，极速开启下一轮迭代。"},
            {"title": "3. 独特的 Loop-Else 语法", "content": "`for...else` 和 `while...else` 允许在循环正常执行结束时运行一段特定代码，通常用于查找元素时，如果中途被 break 打断就不触发 else。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 循环结构控制测试

def calculate_sum_of_odds(n):
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            continue  # 跳过偶数
        total += i
    return total

def find_target_in_loop(lst, target):
    # 模拟 loop-else 查找
    found = False
    for item in lst:
        if item == target:
            found = True
            break
    else:
        found = False  # 如果循环遍历完都没找到，执行 else
    return found

def test_sum_odds():
    assert calculate_sum_of_odds(5) == 9  # 1 + 3 + 5 = 9
    assert calculate_sum_of_odds(10) == 25  # 1 + 3 + 5 + 7 + 9 = 25

def test_loop_else_find():
    assert find_target_in_loop([1, 2, 3, 4], 3) is True
    assert find_target_in_loop([1, 2, 3, 4], 9) is False
""",
        "videos": [
            {
                "bvid": "BV1B7411P79g",
                "title": "Python 循环精讲：For, While 语句与 break/continue",
                "pic": "https://i1.hdslb.com/bfs/archive/1c6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "微软学术推广",
                "play": "8.5万",
                "duration": "16:20",
                "recommend_reason": "视频中对 Loop-else 的经典用例进行了剖析，能够帮助您掌握 Python 特色循环语法的开发细节。"
            }
        ]
    },
    "node5": {
        "quiz": [
            {
                "question": "关于 Python 的核心数据结构，以下哪种说法是正确的？",
                "options": [
                    "列表 (List) 具有不可变性，一经初始化就不能修改其长度",
                    "元组 (Tuple) 是可变类型，可以通过下标索引对其内部某个元素进行重新赋值",
                    "字典 (Dict) 是以键值对（Key-Value）形式存储数据的，它的键（Key）必须是不可变（可哈希）的数据类型",
                    "集合 (Set) 支持元素重复，且是有序存储的"
                ],
                "answer": 2,
                "explanation": "字典使用哈希表实现，键必须可哈希（不可变，如 int、float、str、tuple）。元组是不可变的（Immutable）；列表是可变的（Mutable）；集合是不重复且无序的。"
            },
            {
                "question": "已知一个列表 `x = [1, 2, 3]`。下列哪项操作会删除列表的最后一个元素并将其返回？",
                "options": [
                    "x.remove(3)",
                    "x.pop()",
                    "del x[-1]",
                    "x.clear()"
                ],
                "answer": 1,
                "explanation": "`pop()` 方法会移除列表中指定位置的元素（默认是最后一个元素）并返回该元素。`del x[-1]` 和 `remove(3)` 虽然能删除，但并不返回被删的元素。"
            },
            {
                "question": "假设两个集合 `A = {1, 2, 3}`, `B = {3, 4, 5}`。它们的交集（Intersection）运算 `A & B` 结果为？",
                "options": [
                    "{1, 2, 3, 4, 5}",
                    "{1, 2}",
                    "{3}",
                    "{4, 5}"
                ],
                "answer": 2,
                "explanation": "交集运算符 `&` 返回两个集合中共同包含的元素集合。由于 A 和 B 唯一的共同元素是 3，交集结果为 `{3}`。"
            }
        ],
        "slides": [
            {"title": "1. 内置容器结构分类", "content": "Python 提供了 4 种核心容器：`list`（有序、可变列表）、`tuple`（有序、不可变元组）、`dict`（无序、键值对映射键必须唯一且可哈希）、`set`（无序、唯一无重复集合）。"},
            {"title": "2. 可变与不可变的边界", "content": "列表与字典支持增删改就地操作。元组是不可变的，这使得它不仅能作为安全的数据传输容器，还可以作为字典的键。"},
            {"title": "3. 列表切片与推导式", "content": "Python 的切片操作 `lst[start:stop:step]` 能够高效地进行子序列裁剪；列表推导式则提供了高效声明列表的单行流方式。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 核心数据结构用法测试

def test_list_and_tuple_mutability():
    # 列表可变
    lst = [1, 2, 3]
    lst[0] = 99
    assert lst == [99, 2, 3]
    
    # 验证列表 pop 返回被删除的元素
    popped = lst.pop()
    assert popped == 3
    assert lst == [99, 2]

def test_dict_and_set_operations():
    # 字典基础操作
    user_scores = {"alice": 95, "bob": 80}
    user_scores["charlie"] = 90
    assert user_scores.get("bob") == 80
    assert "alice" in user_scores
    
    # 集合运算
    set_a = {1, 2, 3}
    set_b = {3, 4}
    
    intersection = set_a & set_b
    union = set_a | set_b
    
    assert intersection == {3}
    assert union == {1, 2, 3, 4}
""",
        "videos": [
            {
                "bvid": "BV18t411u7T7",
                "title": "Python 数据结构四剑客：列表、元组、字典、集合",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "廖雪峰",
                "play": "24.1万",
                "duration": "28:10",
                "recommend_reason": "视频中对四种基本结构的内存开销和复杂度进行了系统对比，有助于您理解哈希字典的高效检索机制。"
            }
        ]
    },
    "node6": {
        "quiz": [
            {
                "question": "在 Python 函数定义中，参数前带有单个星号 `*args` 和双星号 `**kwargs` 分别代表什么？",
                "options": [
                    "*args 用于接收任意数量的关键字参数并打包为列表，**kwargs 接收位置参数打包为集合",
                    "*args 用于接收任意多个位置参数并打包成一个元组（Tuple）；**kwargs 接收任意多个关键字参数并打包成字典（Dict）",
                    "它们代表该参数是全局指针，可以直接修改函数体外部变量",
                    "这是只读参数，任何人都不能对其进行重新赋值"
                ],
                "answer": 1,
                "explanation": "`*args` 收集多余的位置实参存入元组；`**kwargs` 收集多余的键值对实参存入字典。这使得 Python 函数可以设计出具有高度灵活性和自适应性的参数接口。"
            },
            {
                "question": "在 Python 函数内部定义一个局部变量。如果想强行让该变量去修改外部全局作用域里的全局变量的值，应使用哪个关键字？",
                "options": [
                    "nonlocal",
                    "global",
                    "extern",
                    "static"
                ],
                "answer": 1,
                "explanation": "`global` 关键字在函数内部声明某个变量是外部定义的全局变量，这样对其重新赋值时就会更改全局作用域中的值。如果不加声明，Python 会隐式定义一个同名的本地局部变量。"
            },
            {
                "question": "关于 Python 函数的默认参数值设置，下列哪项规范是最佳实践所提倡的？",
                "options": [
                    "总是使用空列表 [] 或空字典 {} 作为可变默认参数值",
                    "应该避免使用任何默认参数值以防止编译混乱",
                    "应该使用不可变类型（如 None、数字、字符串）作为默认参数值；如果默认值需要是列表，则默认值设为 None，并在函数内部进行初始化",
                    "默认参数可以写在没有默认值的普通参数前面"
                ],
                "answer": 2,
                "explanation": "因为 Python 函数的默认值对象在**定义时仅创建并初始化一次**。如果使用可变对象（如空列表 `[]`），在后续多次调用中如果改变了它，它会持续累加。因此应推荐使用 `None` 作为占位符。"
            }
        ],
        "slides": [
            {"title": "1. 函数声明与参数解构", "content": "利用 `def` 关键字定义函数。Python 函数不仅支持普通的位置和关键字参数，还支持不定长解构参数 `*args` 和 `**kwargs`。"},
            {"title": "2. 作用域 LEGB 法则", "content": "Python 变量解析顺序遵循 LEGB 原则：Local（局部） -> Enclosing（闭包外层） -> Global（全局） -> Built-in（内置作用域）。"},
            {"title": "3. 默认值陷阱防范", "content": "绝对不要使用空列表 `[]` 作为默认参数。因为函数在加载时仅初始化一次参数默认对象，应该使用 `None` 作为哨兵值并在内部处理。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 函数封装与作用域测试

GLOBAL_COUNTER = 100

def modify_global_counter(val):
    global GLOBAL_COUNTER
    GLOBAL_COUNTER = val

def append_to_element(item, target_list=None):
    # 规避 mutable default argument 默认参数值陷阱
    if target_list is None:
        target_list = []
    target_list.append(item)
    return target_list

def test_global_scope():
    modify_global_counter(400)
    assert GLOBAL_COUNTER == 400

def test_mutable_default_workaround():
    a = append_to_element(1)
    b = append_to_element(2)
    # 验证 a 与 b 是彼此独立的全新列表，而不是共享同一个 [] 缓存
    assert a == [1]
    assert b == [2]
""",
        "videos": [
            {
                "bvid": "BV1o84y1p7yV",
                "title": "深入理解 Python 中的函数参数传递与 LEGB 作用域",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "程序员老徐",
                "play": "10.4万",
                "duration": "22:15",
                "recommend_reason": "视频对值传递、引用传递和函数默认参数陷阱进行了深入的代码演示，适合加深底层设计理解。"
            }
        ]
    },
    "node7": {
        "quiz": [
            {
                "question": "使用 `with open('data.txt', 'r') as f` 来打开文件，最核心的安全保障和优势在于？",
                "options": [
                    "它能对文件内容自动进行大模型合规校验与过滤",
                    "它是一个上下文管理器（Context Manager），不管在读写中是否发生报错或中断，都会在退出 with 块时自动关闭文件并释放内存句柄",
                    "它能自动检测网络异常并上传文件备份",
                    "它比普通的 open() 快 10 倍以上"
                ],
                "answer": 1,
                "explanation": "`with` 语句通过实现上下文管理协议（`__enter__` 和 `__exit__`），确保在执行完毕或抛出任何异常退出时，系统底层能 100% 自动执行 `close()` 释放文件句柄，防范内存泄露。"
            },
            {
                "question": "在 Python 异常处理结构 `try...except...else...finally` 中，关于 `finally` 代码块描述正确的是？",
                "options": [
                    "只有在没有捕获到任何异常时，finally 块才会被执行",
                    "只有在 except 捕获到异常时，finally 块才会被执行",
                    "不管程序是否发生异常，也不管是在 try 还是 except 内部中途执行了 return 语句，finally 块都必定会被最终执行一次",
                    "它的功能完全可以通过 else 代替，是一种累赘的语法结构"
                ],
                "answer": 2,
                "explanation": "`finally` 的执行级别最高。不论在 `try` 执行期间是否发生错误、报错是否被 catch、或者是否执行了 `return`、`break` 语句跳出，`finally` 里的清理代码块都必会最终被呼唤并执行。"
            },
            {
                "question": "在 except 子句中，捕获具体的异常类型（如 `except ZeroDivisionError:`）比直接使用裸的 `except:` 有什么好处？",
                "options": [
                    "没有什么区别，只是打字量不同",
                    "裸的 except 会自动拦截键盘的中断信号（Ctrl+C）以及系统级正常退出，使得程序极难通过常规手段终止，并隐藏未知的逻辑 Bug",
                    "捕获具体的异常会使得程序运行变慢",
                    "这是一种语法限制，Python 3 不再支持裸的 except:"
                ],
                "answer": 1,
                "explanation": "直接使用裸的 `except:` 会隐式地捕获包括 `SystemExit`、`KeyboardInterrupt` 在内的所有异常，导致用户在终端敲 Ctrl+C 无法退出进程。按照健壮性编码，应当只捕获预期的异常，将未知的错误抛给上层。"
            }
        ],
        "slides": [
            {"title": "1. 文件句柄与 Context Manager", "content": "操作系统中的文件句柄是有限的资源。开发中应习惯使用 `with open()` 上下文管理器，自动确保使用完毕后彻底关闭释放句柄。"},
            {"title": "2. 异常处理 Try-Except 结构", "content": "异常处理核心在于拦截并规避运行时错误。使用 `try-except` 捕获异常，并使用 `else` 处理无错分支，使用 `finally` 处理清理。"},
            {"title": "3. 抛出与传递自定义异常", "content": "通过 `raise` 可以主动抛出特定异常（如 `ValueError`）。合理地设计异常流，能防止未处理错误穿透整个系统导致崩溃。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 文件读写与异常安全测试

import os

def read_and_write_file_safe(file_path, text):
    # 使用 with 自动释放句柄
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return None

def test_file_io_flow():
    test_file = "test_scratch_file.txt"
    content = "EduGenesis Adaptive Learning Platform"
    
    result = read_and_write_file_safe(test_file, content)
    assert result == content
    
    # 善后清理
    if os.path.exists(test_file):
        os.remove(test_file)

def test_exception_handling():
    # 测试 try-except-finally
    execution_indicator = []
    try:
        x = 10 / 0
    except ZeroDivisionError:
        execution_indicator.append("except_trigger")
    finally:
        execution_indicator.append("finally_trigger")
        
    assert "except_trigger" in execution_indicator
    assert "finally_trigger" in execution_indicator
""",
        "videos": [
            {
                "bvid": "BV1d54y1t71m",
                "title": "Python 异常处理与文件读写：with 语句深度解析",
                "pic": "https://i0.hdslb.com/bfs/archive/4b6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "极客学院",
                "play": "11.5万",
                "duration": "19:40",
                "recommend_reason": "视频深入阐述了 with 语句背后的 Context Protocol（__exit__ 原理），对掌握高级异常防范有极高价值。"
            }
        ]
    },
    "node8": {
        "quiz": [
            {
                "question": "在 Python 项目开发中，如何以最符合工程范式的方式引入自定义包中的函数？",
                "options": [
                    "将自定义的代码文件内容直接复制到主程序头部",
                    "利用 python.exe 系统 PATH 环境变量手动动态拼接字符串引入",
                    "使用 `from models.utils import format_results` 等语句进行层级导入，并在目录中放置 __init__.py 以标记包目录",
                    "直接在终端通过 python 脚本解密引入"
                ],
                "answer": 2,
                "explanation": "Python 使用包（Package） and 模块（Module）系统进行封装。在文件夹下创建 `__init__.py` 可以将普通目录升级为一个可识别导入的 Python 包，随后使用标准的 import 语句进行层级导入。"
            },
            {
                "question": "在编写 Python 核心生产代码模块时，以下哪项是最推荐的做法以保证代码的长期健康和可维护性？",
                "options": [
                    "写完代码直接推送到生产分支，不进行任何单元测试",
                    "使用 pytest 等框架为模块核心逻辑编写一系列边缘断言单元测试，每次修改时跑自动化测试校验",
                    "直接依靠线上用户的真实崩溃反馈来调试代码",
                    "将所有复杂算法封装在无法更改的编译闭包中"
                ],
                "answer": 1,
                "explanation": "单元测试是保证软件质量的唯一黄金标准。通过针对各类入参编写 PyTest 测试用例，我们能够在后续重构或修改时自动捕捉隐蔽的 regression 缺陷。"
            },
            {
                "question": "在很多 Python 文件中经常会看到有如下语句：`if __name__ == '__main__':`。这行代码的真实用处是？",
                "options": [
                    "它是一个装饰器，用于提升当前文件的执行优先级",
                    "这是系统自动加上去的，没有任何实际意义",
                    "它使得该文件既可以作为脚本被直接运行（此时该代码块内的代码会执行），又可以在被其他文件 import 引入时，防止该代码块被自动触发执行",
                    "为了告诉解释器此文件是 main.py 的拷贝"
                ],
                "answer": 2,
                "explanation": "当 Python 脚本被直接运行时，内置变量 `__name__` 会被赋值为 `__main__`，从而触发 if 块内的调试或演示程序；如果该文件是被其他文件 `import` 引入的，`__name__` 会被设为文件名，if 块便不会执行，避免了重复调用的混乱。"
            }
        ],
        "slides": [
            {"title": "1. 模块化与工程架构", "content": "软件开发讲究高内聚低耦合。Python 使用模块和包来进行代码隔离与重用，在文件夹下创建 `__init__.py` 即可定义包。"},
            {"title": "2. PyTest 自动化单元测试", "content": "PyTest 框架已成为行业测试事实规范。使用以 `test_` 开头的函数，结合 `assert`，可以在开发时对各项业务边界条件进行快速拦截。"},
            {"title": "3. 入口控制 __name__ 原理", "content": "掌握 `if __name__ == '__main__'` 的隔离技巧，能让您的文件兼具‘直接执行脚本’与‘可被安全导入模块’的双重实用特征。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 综合项目管理系统实战测试

class StudentManager:
    \"\"\"
    综合项目管理类：模拟学生账户添加及平均分计算
    \"\"\"
    def __init__(self):
        self.students = {}  # name -> score

    def add_student(self, name, score):
        if not isinstance(name, str) or len(name.strip()) == 0:
            raise ValueError("学生姓名不合法")
        if not isinstance(score, (int, float)) or score < 0 or score > 100:
            raise ValueError("分数必须在 0 - 100 之间")
        self.students[name.strip()] = score

    def get_average_score(self):
        if not self.students:
            return 0.0
        return sum(self.students.values()) / len(self.students)

def test_student_manager_success():
    manager = StudentManager()
    manager.add_student("Alice", 95)
    manager.add_student("Bob", 85)
    
    assert manager.get_average_score() == 90.0

def test_student_manager_invalid_input():
    manager = StudentManager()
    
    import pytest
    with pytest.raises(ValueError):
        manager.add_student("", 80)  # 空名字报错
        
    with pytest.raises(ValueError):
        manager.add_student("Dave", 120)  # 异常分数报错
""",
        "videos": [
            {
                "bvid": "BV11K4y1p7aY",
                "title": "Python 规范工程实战：目录结构规划、测试与发布",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "微软软件大联盟",
                "play": "14.6万",
                "duration": "35:10",
                "recommend_reason": "视频系统演示了工程项目的架构管理，展示了从目录规划到单元测试并打包的全部工程流程，适合实战参考。"
            }
        ]
    }
}

MACHINE_LEARNING_RESOURCES = {
    "node1": {
        "quiz": [
            {
                "question": "在机器学习与模式识别中，计算两个向量的点积（Dot Product）所蕴含的最核心的几何与算法意义是？",
                "options": [
                    "计算两个向量构成的平面的夹角正弦值",
                    "衡量两个向量的方向一致度以及在空间中的投影（相似性度量）",
                    "将两个向量完全融融合为一个新的复数",
                    "点积总是等于两个向量的夹角弧度值"
                ],
                "answer": 1,
                "explanation": "向量点积公式为 $a \\cdot b = \\sum a_i b_i = |a||b|\\cos\\theta$。当两个向量模长为 1 时，点积等于它们的余弦夹角（Cosine Similarity），主要用于计算用户画像特征的相似度。"
            },
            {
                "question": "已知一个特征矩阵 A 维度为 (m, n)，权重参数向量 w 的维度为 (n, 1)。则它们的乘积 A w 得到的输出向量的维度是？",
                "options": [
                    "(m, 1)",
                    "(n, m)",
                    "(n, 1)",
                    "该矩阵乘法不符合维度对齐规则，无法相乘"
                ],
                "answer": 0,
                "explanation": "根据矩阵相乘规则，$(m \\times n)$ 的矩阵与 $(n \\times p)$ 的矩阵相乘，结果的维度为 $(m \\times p)$。此处 $p=1$，因此结果为 $(m \\times 1)$ 的列向量。这对应着 m 个样本的前向预测输出。"
            },
            {
                "question": "在矩阵特征值与特征向量的定义公式 A x = λ x 中，关于特征向量 x 的描述下列哪项是正确的？",
                "options": [
                    "x 可以是任意常数数值",
                    "x 是一个非零向量，它在被矩阵 A 进行线性映射后，其空间方向不发生改变，只进行了长度拉伸",
                    "x 只能是全为 1 的均匀向量",
                    "λ 是矩阵 A 的转置矩阵，且必须对称"
                ],
                "answer": 1,
                "explanation": "特征向量的本质是：线性变换下方向不变的基。在乘上变换矩阵 A 后，特征向量 x 只经历了大小拉伸（拉伸因子即特征值 λ），这对主成分分析（PCA）降维具有重要基石作用。"
            }
        ],
        "slides": [
            {"title": "1. 线性代数：机器学习数据建模基石", "content": "在线性回归、主成分分析（PCA）以及神经网络计算中，所有的特征均被表示为高维空间向量；矩阵乘法则是特征线性组合的表达手段。"},
            {"title": "2. 向量点积与相似度计算", "content": "点积反映了两个方向夹角及模长的综合影响。余弦相似度就是通过点积消除向量模长影响得到的，广泛应用于分类判决和相似度匹配。"},
            {"title": "3. 特征分解的几何直观", "content": "特征分解（Eigendecomposition）揭示了矩阵线性变换的拉伸主轴。特征向量就是这些轴线，它们在投影映射中承担了高维空间基底的转换任务。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 矩阵运算基础逻辑测试 (用纯 Python 模拟 Numpy 基础算子)

def calculate_vector_dot_product(vec_a, vec_b):
    if len(vec_a) != len(vec_b):
        raise ValueError("维度必须相同")
    return sum(a * b for a, b in zip(vec_a, vec_b))

def calculate_matrix_multiply(matrix_a, matrix_b):
    # A (m, n) * B (n, p) -> C (m, p)
    m = len(matrix_a)
    n = len(matrix_a[0])
    p = len(matrix_b[0])
    
    # 初始化输出矩阵
    c = [[0] * p for _ in range(m)]
    
    for i in range(m):
        for j in range(p):
            for k in range(n):
                c[i][j] += matrix_a[i][k] * matrix_b[k][j]
    return c

def test_dot_product():
    a = [1, 2, 3]
    b = [4, 5, 6]
    assert calculate_vector_dot_product(a, b) == 32  # 1*4 + 2*5 + 3*6 = 4+10+18 = 32

def test_matrix_multiply():
    a = [[1, 2], [3, 4]]
    b = [[5], [6]]
    # (2, 2) * (2, 1) -> (2, 1)
    # [1*5+2*6] = [17]
    # [3*5+4*6] = [39]
    res = calculate_matrix_multiply(a, b)
    assert res == [[17], [39]]
""",
        "videos": [
            {
                "bvid": "BV1ys411Y7S2",
                "title": "线性代数的本质 (3Blue1Brown 中文版配音)",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "3Blue1Brown",
                "play": "150.3万",
                "duration": "12:15",
                "recommend_reason": "这是公认的线性代数神级科普课程。通过直观的几何图形变换，讲解了矩阵乘法与行列式，强烈推荐！"
            }
        ]
    },
    "node2": {
        "quiz": [
            {
                "question": "在多元函数的数学定义中，函数的梯度（Gradient）是一个向量，它的几何指向是？",
                "options": [
                    "函数在这个点上下降最快的方向",
                    "函数在这个点上升最快（切线斜率增大最快）的方向",
                    "与函数切面完全平行的正交法向量",
                    "指向全局极小值的方向"
                ],
                "answer": 1,
                "explanation": "多元函数的梯度是指向函数增长最快的方向。因此，为了最小化损失函数，我们必须沿着梯度的**反方向**（负梯度方向）进行迭代参数更新，这就叫梯度下降。"
            },
            {
                "question": "在梯度下降法参数更新公式 $w = w - \\alpha \\cdot dw$ 中，$\\alpha$ 代表的核心超参数是？",
                "options": [
                    "正则化惩罚因子",
                    "学习率（Learning Rate），控制每次参数沿着负梯度方向更新的步长",
                    "冲量惯性系数",
                    "批次样本容量"
                ],
                "answer": 1,
                "explanation": "学习率 $\alpha$ 决定了每次迭代权重滑动的距离。学习率过小会导致收敛极慢；过大会导致在极值点附近剧烈震荡甚至发散。"
            },
            {
                "question": "当目标损失函数是一个非凸（Non-convex）曲面时，梯度下降在求极小值时经常会面临什么问题？",
                "options": [
                    "必定能收敛到全局最优点",
                    "容易在梯度为 0 的局部极小值点或鞍点（Saddle Point）处停滞不前，难以求得全局最优解",
                    "它只适用于 1 维线性函数，对多元参数无效",
                    "参数只能无限增大"
                ],
                "answer": 1,
                "explanation": "因为传统梯度下降（GD）是根据当前位置的局部斜率更新的。在非凸曲面上，一旦滑入鞍点或局部极小值区（局部梯度 dw 趋于 0），权重更新便会停止，从而无法爬出以寻找全局最优点。"
            }
        ],
        "slides": [
            {"title": "1. 导数、偏导与梯度", "content": "导数衡量单变量斜率；偏导数衡量多元函数在某一独立维度上的局部倾斜；梯度则是各偏导数组成的向量，指示函数增长最快的方向。"},
            {"title": "2. 负梯度反向迭代更新", "content": "为了使损失（Loss）逼近最小值，机器学习采用“顺着下坡走”的思想，即沿着梯度的反方向（$-dw$）按步长 $\\alpha$ 修正参数。"},
            {"title": "3. 学习率控制策略", "content": "学习率 $\\alpha$ 控制下山步子的大小。它是整个机器学习最关键的超参数之一，通常采用指数衰减或自适应优化器进行平滑调节。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 梯度下降求凸函数最小值实战
import math

def test_gradient_descent_optimization():
    # 模拟最小化 f(x) = (x - 3)^2 + 4
    # 真实全局最小值在 x = 3 处，最小损失为 4
    # f'(x) = 2 * (x - 3)
    
    x = 10.0  # 初始权重
    learning_rate = 0.1
    epochs = 50
    
    for _ in range(epochs):
        df_dx = 2 * (x - 3.0)  # 局部导数
        x = x - learning_rate * df_dx  # 负梯度更新
        
    # 经过50次更新，x 应极其接近 3.0
    print(f"收敛后的 x 值: {x}")
    assert math.isclose(x, 3.0, abs_tol=1e-3)
""",
        "videos": [
            {
                "bvid": "BV1J4411V7vM",
                "title": "梯度下降算法的数学推导与直观解析",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "同济大学公开课",
                "play": "15.6万",
                "duration": "18:32",
                "recommend_reason": "视频用简洁明了的语言和 3D 图表梳理了梯度向量的数学起源，适合打牢偏导求导根基。"
            }
        ]
    },
    "node3": {
        "quiz": [
            {
                "question": "在经典一元线性回归模型 $y = w \\cdot x + b$ 中，均方误差（MSE）损失函数的核心作用是？",
                "options": [
                    "用来直接计算输入特征 x 的概率分布",
                    "计算模型预测输出 $\\hat{y}$ 与真实标签 $y$ 的平方差的均值，作为衡量预测偏差的代价标量",
                    "对参数 w 和 b 进行类型转换",
                    "这是一种降维手段"
                ],
                "answer": 1,
                "explanation": "均方误差公式为 $MSE = \\frac{1}{N}\\sum (y_i - \\hat{y}_i)^2$。由于进行了平方运算，它不仅放大了大误差的惩罚，而且其连续可导的特性极易进行梯度求导优化。"
            },
            {
                "question": "在线性回归求参数闭式解（Analytical Solution）时，最小二乘法（Least Squares Method）的数学目标是？",
                "options": [
                    "让每个预测点与真实点之间的绝对距离之和最大",
                    "寻找能使残差平方和（Sum of Squared Residuals）达到最小的参数 w 和 b",
                    "对样本数据进行均匀分割",
                    "将特征过滤为 0"
                ],
                "answer": 1,
                "explanation": "最小二乘法是回归模型求最优解析解的经典工具。它直接计算偏导数为 0 时的解析方程组，从而使得回归线到所有数据点的垂直距离的平方和达到最小。"
            },
            {
                "question": "在训练线性回归时，如果输入的特征 x 与真实标签 y 呈现完美的负线性相关，那么求出的斜率 w 的符号必定为？",
                "options": [
                    "正号（+）",
                    "负号（-）",
                    "0",
                    "与学习率方向一致"
                ],
                "answer": 1,
                "explanation": "特征与目标负相关意味着：x 越大，y 越小。因此拟合出的最佳直线是单调递减的，对应的斜率参数 w 必定小于 0。"
            }
        ],
        "slides": [
            {"title": "1. 线性回归算法模型", "content": "线性回归旨在寻找变量间的线性关联模型。对于 1D 特征，其公式表达为 $y = wx + b$，目标是求解斜率 $w$ 和偏置 $b$。"},
            {"title": "2. 均方误差损失函数", "content": "MSE 代价函数是预测值与标签的差值平方和。它是二次曲面，拥有唯一的全局最小值，避免了局部最优解问题。"},
            {"title": "3. 最小二乘解析求导", "content": "对于低维矩阵数据，可以通过矩阵求逆公式直接得到全局唯一解析闭式解（Normal Equation），省去了迭代循环的过程。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 最小二乘法求线性回归解析解
import math

def calculate_ols_closed_form(points):
    # 模拟 OLS：w = cov(x, y) / var(x)
    n = len(points)
    x_mean = sum(p[0] for p in points) / n
    y_mean = sum(p[1] for p in points) / n
    
    numerator = sum((p[0] - x_mean) * (p[1] - y_mean) for p in points)
    denominator = sum((p[0] - x_mean) ** 2 for p in points)
    
    w = numerator / denominator
    b = y_mean - w * x_mean
    return w, b

def test_ols_regression():
    # 模拟斜率为 1.5, 偏置为 1.0 的点集加上些许噪声
    # 测试点: (1, 2.5), (2, 4.0), (3, 5.5) -> 完美符合 y = 1.5x + 1.0
    data = [(1, 2.5), (2, 4.0), (3, 5.5)]
    w, b = calculate_ols_closed_form(data)
    
    assert math.isclose(w, 1.5)
    assert math.isclose(b, 1.0)
""",
        "videos": [
            {
                "bvid": "BV1dK4y1P7v9",
                "title": "线性回归模型的原理解析与最小二乘法数学求解",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "微软亚洲研究院",
                "play": "10.1万",
                "duration": "24:12",
                "recommend_reason": "视频推演了最小二乘解析解的矩阵求导公式，逻辑非常清晰，是回归理论的必看大片。"
            }
        ]
    },
    "node4": {
        "quiz": [
            {
                "question": "在逻辑回归中，Sigmoid 激活函数最主要的作用是什么？",
                "options": [
                    "过滤高维特征中的冗余噪音",
                    "将实数空间（$-\\infty, +\\infty$）的任意输出值映射到（0, 1）区间内，以表示分类预测的概率",
                    "执行矩阵乘法运算",
                    "将二分类问题转变为多分类问题"
                ],
                "answer": 1,
                "explanation": "Sigmoid 公式为 $S(z) = 1 / (1 + e^{-z})$。它能将线性网络的输出平滑缩放到 $(0, 1)$ 区间，从而可以将预测结果解读为该样本属于正类的概率。"
            },
            {
                "question": "逻辑回归在解决二分类（Binary Classification）问题时，通常采用的损失函数是？",
                "options": [
                    "均方误差损失（MSE Loss）",
                    "交叉熵损失（Binary Cross-Entropy Loss / 对数损失）",
                    "绝对值误差损失（MAE Loss）",
                    "Hinge 损失函数"
                ],
                "answer": 1,
                "explanation": "二分类交叉熵损失为 $L = -[y\\log\\hat{y} + (1-y)\\log(1-\\hat{y})]$。它与极大似然估计等价。当模型预测置信度越高但预测错时，其惩罚值趋于无穷大，能有效迫使决策边界收敛。"
            },
            {
                "question": "若已知逻辑回归计算出的激活输入 $z = 0$，经过 Sigmoid 激活函数处理后，预测该样本属于正类的概率值是？",
                "options": [
                    "0.0",
                    "0.5",
                    "1.0",
                    "无法确定，取决于初始偏置值"
                ],
                "answer": 1,
                "explanation": "Sigmoid 函数在自变量 $z=0$ 时取得中心对称点值：$S(0) = 1 / (1 + e^0) = 1 / (1 + 1) = 0.5$。这通常作为分类判定边界的核心临界点。"
            }
        ],
        "slides": [
            {"title": "1. 逻辑回归：经典二分类法则", "content": "逻辑回归是广义线性模型。虽然名称包含回归，但它实质上是通过拟合一个线性决策面来完成分类判定。"},
            {"title": "2. Sigmoid 函数与其导数特征", "content": "Sigmoid 函数 $S(z) = 1/(1+e^{-z})$ 具有优美的 S 曲线。它将无限输入压缩到 $(0, 1)$ 区间，且导数极易计算：$S'(z) = S(z)(1-S(z))$。"},
            {"title": "3. 交叉熵损失函数原理", "content": "如果使用 MSE 优化逻辑回归，曲面高度非凸且会出现梯度消失。采用二分类交叉熵（BCE）损失能够保证在求导优化时拥有凸函数性质。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# Sigmoid 函数与对数损失函数计算测试
import math

def calculate_sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))

def calculate_binary_cross_entropy(y_true, y_pred_prob):
    # 为防 Log(0) 异常，需要做微量截断
    epsilon = 1e-15
    y_pred_prob = max(epsilon, min(1.0 - epsilon, y_pred_prob))
    return - (y_true * math.log(y_pred_prob) + (1 - y_true) * math.log(1 - y_pred_prob))

def test_sigmoid_values():
    assert calculate_sigmoid(0) == 0.5
    assert calculate_sigmoid(100) > 0.9999
    assert calculate_sigmoid(-100) < 0.0001

def test_cross_entropy():
    # 完美预测损失几乎为 0
    loss_good = calculate_binary_cross_entropy(1.0, 0.9999)
    # 错误预测损失极大
    loss_bad = calculate_binary_cross_entropy(1.0, 0.0001)
    
    assert loss_good < 0.001
    assert loss_bad > 9.0
""",
        "videos": [
            {
                "bvid": "BV1hM4y197bA",
                "title": "从零构建机器学习：逻辑回归原理解析",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "AI研习社",
                "play": "13.4万",
                "duration": "28:15",
                "recommend_reason": "视频中演示了线性决策边界被 sigmoid 压平的过程，通俗易懂地解开了二分类概率起源。"
            }
        ]
    },
    "node5": {
        "quiz": [
            {
                "question": "在防御过拟合（Overfitting）时，L1 正则化（Lasso）和 L2 正则化（Ridge）在惩罚项定义上的区别是？",
                "options": [
                    "L1 惩罚项是所有权重绝对值之和（L1范数）；L2 惩罚项是所有权重平方和的一半（L2范数的平方）",
                    "L1 正则化总是使用全局常数，L2 只能依赖反向传播求导",
                    "两者公式完全相同，只是优化系数相差 10 倍",
                    "L1 用于回归问题，L2 只能用于神经网络分类"
                ],
                "answer": 0,
                "explanation": "L1 正则化项表达式为 $\\Omega(w) = ||w||_1 = \\sum |w_i|$；L2 正则化项为 $\\Omega(w) = \\frac{1}{2}||w||_2^2 = \\frac{1}{2}\\sum w_i^2$。惩罚项将附加在主损失函数后参与共同更新。"
            },
            {
                "question": "关于 L1 正则化相比 L2 正则化，为什么更容易让特征权重产生稀疏性（Sparsity，即很多参数值直接缩减为绝对零）？",
                "options": [
                    "因为 L1 正则化只在多线程下运行",
                    "从几何观点看，L1 惩罚项的等高线是一组带尖角的棱形折线，与损失等高线相交时，更容易落在权重坐标轴的尖角顶点上（即某些维度权重为 0）",
                    "L1 正则化使用了对数求导",
                    "因为 L1 会将训练集样本容量缩小"
                ],
                "answer": 1,
                "explanation": "在数学几何上，L1 惩罚项在坐标轴上拥有不可导的“尖角”。损失等值线向外扩张时，最先相交的切点通常是这些尖角（如 $w_1=0$）。因此，L1 正则化天生具有特征选择（Feature Selection）功能。"
            },
            {
                "question": "在加入正则化项后，超参数 $\\lambda$（正则化系数）的主要作用是调节什么平衡？",
                "options": [
                    "调节训练集和测试集数据数量的分配比例",
                    "平衡模型对训练数据的拟合能力（降低经验风险）与限制权重大小以防过拟合（降低结构风险）之间的关系",
                    "直接控制网络的梯度更新学习率",
                    "决定特征缩放的标准差大小"
                ],
                "answer": 1,
                "explanation": "正则化项将权重大小视为系统复杂度的一部分。较大的 $\\lambda$ 强力限制权重大小，降低过拟合风险，但如果设得过大可能会使模型过于简单，导致欠拟合（Underfitting）。"
            }
        ],
        "slides": [
            {"title": "1. 机器学习过拟合的危害", "content": "如果模型参数过多，它不仅会学习到真实规律，还会将训练集中的随机噪音一并记住，导致在测试集上的泛化误差迅速升高。"},
            {"title": "2. L1 正则化与稀疏降噪", "content": "L1 范数通过惩罚权重的绝对值之和，能够强制消除不重要特征的权重系数（直接拉伸到 0），形成天然的特征选择。"},
            {"title": "3. L2 正则化与权重衰减", "content": "L2 正则化通过惩罚权重平方和，会使权重系数变得极其平滑且趋于均匀的小值。在反向更新中，其相当于在每一步进行了一次‘权重衰减’（Weight Decay）。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# L1 与 L2 正则化项计算测试
import math

def calculate_l1_penalty(weights, lam):
    return lam * sum(abs(w) for w in weights)

def calculate_l2_penalty(weights, lam):
    # 常规 L2 使用一半平方和
    return 0.5 * lam * sum(w ** 2 for w in weights)

def test_l1_regularization_value():
    w = [1.5, -2.0, 0.5]
    lam = 0.1
    # sum = 1.5 + 2.0 + 0.5 = 4.0 -> L1 = 0.4
    assert math.isclose(calculate_l1_penalty(w, lam), 0.4)

def test_l2_regularization_value():
    w = [2.0, -1.0, 3.0]
    lam = 0.2
    # sum_sq = 4 + 1 + 9 = 14.0 -> L2 = 0.5 * 0.2 * 14 = 1.4
    assert math.isclose(calculate_l2_penalty(w, lam), 1.4)
""",
        "videos": [
            {
                "bvid": "BV1oV411P7C8",
                "title": "奥卡姆剃刀原理：L1与L2正则化防止过拟合详解",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "李沐-动手学深度学习",
                "play": "35.2万",
                "duration": "30:45",
                "recommend_reason": "视频用生动形象的代码实操演示了加入正则化前后模型边界的变化，是理解防过拟合的必看教程。"
            }
        ]
    },
    "node6": {
        "quiz": [
            {
                "question": "在前馈神经网络（Feedforward Neural Network）中，如果不引入非线性激活函数（例如 ReLU、Sigmoid），网络的学习能力将退化为？",
                "options": [
                    "退化为只能表示简单的多层线性映射组合，等价于一个单层的线性回归模型，完全无法拟合复杂的非线性决策曲面",
                    "退化为无法进行任何向前传播",
                    "计算结果会出现浮点数溢出",
                    "等价于支持向量机分类器"
                ],
                "answer": 0,
                "explanation": "因为多层线性变换的级联在数学上依然等价于一个单一的线性变换：$W_2(W_1 x + b_1) + b_2 = W_{new} x + b_{new}$。只有引入非线性激活函数，网络才具备万能近似定理（Universal Approximation）赋予的强大表达力。"
            },
            {
                "question": "对于深度学习目前最常用的 ReLU 激活函数 $f(x) = \\max(0, x)$，当输入为负数 $x = -2.5$ 时，其函数输出为？",
                "options": [
                    "-2.5",
                    "0.0",
                    "1.0",
                    "NaN"
                ],
                "answer": 1,
                "explanation": "ReLU（修正线性单元）的定义是负数部分输出归 0，正数部分输出等于自身。对于 $x=-2.5 \\le 0$，最大值函数 $\\max(0, -2.5)$ 直接返回 `0.0`。"
            },
            {
                "question": "假设一个单隐藏层神经网络，输入维度是 4，隐藏神经元个数是 8，输出层维度为 3。那么输入层到隐藏层权重矩阵 W1 的元素总数是？",
                "options": [
                    "12 个",
                    "32 个",
                    "24 个",
                    "96 个"
                ],
                "answer": 1,
                "explanation": "权重矩阵 W1 的维度为 (4, 8) 或 (8, 4)，它连接了输入层和隐藏层。矩阵中拥有的参数连接个数等于 $4 \\times 8 = 32$ 个（不包括偏置量）。"
            }
        ],
        "slides": [
            {"title": "1. 神经网络基本架构", "content": "神经网络借鉴了生物元突触结构。层与层之间全连接，输入信号经过权重矩阵与偏置的加权变换后送入激活函数。"},
            {"title": "2. 激活函数与非线性拟合", "content": "为了避免多层计算退化为单层线性回归，必须在层间加上非线性激活函数（如 ReLU, Sigmoid）。"},
            {"title": "3. 矩阵化前向计算公式", "content": "前向传播可以用优美的矩阵乘法表达：$Z = W \\cdot X + B$，接着 $A = f(Z)$。现代 GPU 硬件就是针对这类大规模并行乘法进行了高度优化。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 神经网络前向传播计算模拟 (纯 Python 实现)
import math

def calculate_relu(x):
    return max(0.0, x)

def calculate_dense_layer_forward(inputs, weights, biases):
    # inputs (n,), weights (m, n), biases (m,)
    m = len(weights)
    outputs = []
    for i in range(m):
        # 向量乘法
        z = sum(x * w for x, w in zip(inputs, weights[i])) + biases[i]
        outputs.append(calculate_relu(z))  # 激活输出
    return outputs

def test_nn_forward():
    # 模拟 3个输入 -> 2个神经元
    inputs = [1.0, 2.0, -1.0]
    weights = [
        [0.5, -0.2, 1.0],  # 神经元 1
        [-1.0, 0.8, 0.0]   # 神经元 2
    ]
    biases = [0.1, -0.5]
    
    # 神经元 1 预激活: 1*0.5 + 2*(-0.2) + (-1)*1.0 + 0.1 = 0.5 - 0.4 - 1.0 + 0.1 = -0.8 -> ReLU = 0.0
    # 神经元 2 预激活: 1*(-1) + 2*(0.8) + (-1)*0 + (-0.5) = -1.0 + 1.6 + 0.0 - 0.5 = 0.1 -> ReLU = 0.1
    outputs = calculate_dense_layer_forward(inputs, weights, biases)
    assert math.isclose(outputs[0], 0.0)
    assert math.isclose(outputs[1], 0.1)
""",
        "videos": [
            {
                "bvid": "BV1bx411M7y5",
                "title": "什么是神经网络？ (深度学习大电影第一部)",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "3Blue1Brown",
                "play": "180.1万",
                "duration": "18:41",
                "recommend_reason": "该视频通过完美的三维渲染和直观讲解将隐藏层的功能拨云见日，是全球公认最好的入门动画。"
            }
        ]
    },
    "node7": {
        "quiz": [
            {
                "question": "深度学习模型在进行反向传播（Backpropagation）算法更新参数时，其核心所依赖的数学原理是？",
                "options": [
                    "拉格朗日乘子法",
                    "微积分中的链式求导法则（Chain Rule）",
                    "傅里叶变换的周期展开",
                    "矩阵的奇异值分解（SVD）"
                ],
                "answer": 1,
                "explanation": "反向传播在本质上是链式求导法则在计算图（Computational Graph）上的高效应用。其利用下一层的误差梯度乘以局部导数，反向计算出当前权重的偏导数，以进行参数纠错。"
            },
            {
                "question": "在构建前向与反向计算图时，对于一个乘法计算节点 $z = w \\cdot x$，已知当前反向传播传回的偏导数为 $\\frac{\\partial L}{\\partial z}$。那么损失函数对参数 $w$ 的梯度 $\\frac{\\partial L}{\\partial w}$ 计算公式为？",
                "options": [
                    "$\\frac{\\partial L}{\\partial z} \\cdot w$",
                    "$\\frac{\\partial L}{\\partial z} \\cdot x$",
                    "$\\frac{\\partial L}{\\partial z} \\cdot (w + x)$",
                    "1.0"
                ],
                "answer": 1,
                "explanation": "根据微积分偏导数法则，由于 $z = wx$，则 $\\frac{\\partial z}{\\partial w} = x$。因此，通过链式求导，最终对 w 的偏导为 $\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w} = \\frac{\\partial L}{\\partial z} \\cdot x$。"
            },
            {
                "question": "对于加法计算节点 $z = x + y$，其局部导数 $\\frac{\\partial z}{\\partial x}$ 的值是多少？",
                "options": [
                    "0",
                    "1.0",
                    "y 的值",
                    "由输入学习率决定"
                ],
                "answer": 1,
                "explanation": "因为加法是线性分配器。当对自变量 x 求导数时，y 视为常数：$\\frac{\\partial (x + y)}{\\partial x} = 1$。这说明在反向传播中，加法节点会无损地向后传递梯度。"
            }
        ],
        "slides": [
            {"title": "1. 反向传播与计算图", "content": "计算图将复杂的数学运算拆解为节点（操作符）和边（变量）。前向传播计算损失，反向传播则将误差梯度沿着边反向回溯。"},
            {"title": "2. 链式法则的基本精髓", "content": "多层复合函数求偏导等价于每层求导相乘。即 $\\frac{\\partial L}{\\partial x} = \\frac{\\partial L}{\\partial z} \\cdot \\frac{\\partial z}{\\partial x}$，这实现了梯度的分布式回传。"},
            {"title": "3. 经典门控节点求导法则", "content": "加法节点是梯度分配器（无损传递）；乘法节点是梯度交换器（将乘数进行交叉相乘传递）；最大值节点是选择路由器（只将梯度传递给最大值分支）。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 链式法则求导模拟与梯度检验

def run_forward_and_backward_nodes(w, x, b):
    # z = w * x + b
    # loss = z^2
    # 前向计算
    z = w * x + b
    loss = z ** 2
    
    # 反向传播 (求导值)
    # dloss_dz = 2 * z
    # dz_dw = x, dz_db = 1.0
    # 链式求导
    dloss_dz = 2 * z
    dloss_dw = dloss_dz * x
    dloss_db = dloss_dz * 1.0
    
    return loss, dloss_dw, dloss_db

def test_backprop_gradients():
    w, x, b = 2.0, 3.0, 1.0
    # z = 2*3 + 1 = 7.0
    # loss = 49.0
    # dloss_dz = 14.0
    # dloss_dw = 14.0 * 3.0 = 42.0
    # dloss_db = 14.0 * 1.0 = 14.0
    loss, dw, db = run_forward_and_backward_nodes(w, x, b)
    
    assert loss == 49.0
    assert dw == 42.0
    assert db == 14.0
""",
        "videos": [
            {
                "bvid": "BV16x411M7t9",
                "title": "反向传播算法的数学原理与其链式法则推导",
                "pic": "https://i1.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "3Blue1Brown",
                "play": "110.2万",
                "duration": "14:10",
                "recommend_reason": "该科普大作通过极其精致的动态图表演示了反向偏导流，将抽象的链式法则完全进行了可视化展现。"
            }
        ]
    },
    "node8": {
        "quiz": [
            {
                "question": "在机器学习模型最终上线部署发布前，划分测试集（Test Set）的最主要作用是？",
                "options": [
                    "让模型在测试集上反复训练以进一步减小训练误差",
                    "评估模型最终对从未见过的全新测试样本的真实泛化能力（防止虚高评估）",
                    "测试服务器的运行内存和带宽负载",
                    "这是系统自动要求的格式，并没有实际作用"
                ],
                "answer": 1,
                "explanation": "测试集充当了“高考卷”。它与模型的训练过程、调参（验证集）完全隔离，仅在最后一步使用，用于给出模型真实的泛化性能度量。"
            },
            {
                "question": "在机器学习项目开发中，如果模型在训练集上精度极高（例如 Loss 趋于 0），但在测试集上性能极差，这表明模型发生了？",
                "options": [
                    "欠拟合（Underfitting）",
                    "过拟合（Overfitting）",
                    "模型完全收敛到了全局最优",
                    "发生了服务器硬件溢出"
                ],
                "answer": 1,
                "explanation": "训练集误差小但测试集误差大是典型的过拟合特征。这说明模型结构过于复杂或迭代次数过多，以至于“死记硬背”了训练集中的噪声，却失去了处理新数据的泛化能力。"
            },
            {
                "question": "模型完成训练后，在线上工程部署应用时，通常将训练好的参数权重文件序列化为什么常见的保存格式？",
                "options": [
                    "保存为 raw text 原生中文字符文件",
                    "保存为二进制序列化文件（如 Python 的 Pickle 格式、H5、ONNX、JSON 或 PyTorch 的 .pt 文件）",
                    "直接在终端执行编译",
                    "保存为 mp4 视频文件"
                ],
                "answer": 1,
                "explanation": "工业界通常将训练完毕的矩阵权重导出为标准的持久化格式（如 PyTorch 的 `.pt`、跨平台的 `ONNX` 或二进制 `Pickle`）。加载这些参数文件即可在生产线快速构建前向推理服务。"
            }
        ],
        "slides": [
            {"title": "1. 机器学习工作流闭环", "content": "数据采集 -> 划分训练/验证/测试集 -> 模型设计与训练 -> 超参数选择 -> 泛化性能测试 -> 工业级持久化与部署。"},
            {"title": "2. 模型评估与交叉验证", "content": "绝对不要在训练集上评估模型质量！应依赖独立验证集进行调参，避免信息泄漏。在部署前使用测试集给出最终报告。"},
            {"title": "3. 轻量化与 ONNX 部署", "content": "训练好的参数可以导出为 ONNX（Open Neural Network Exchange）跨平台模型描述，从而实现从 Python 训练到 C++/手机终端快速部署的转化。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 机器学习微型线性回归器实战测试 (纯 Python 封装训练器)
import math

class MiniLinearRegressor:
    \"\"\"
    微型 1D 线性回归梯度下降训练器
    目标是拟合 y = w * x + b
    \"\"\"
    def __init__(self):
        self.w = 0.0
        self.b = 0.0

    def fit(self, x_data, y_data, lr=0.01, epochs=100):
        n = len(x_data)
        for _ in range(epochs):
            dw = 0.0
            db = 0.0
            for x, y in zip(x_data, y_data):
                y_pred = self.w * x + self.b
                # MSE 偏导数
                dw += (2.0 / n) * (y_pred - y) * x
                db += (2.0 / n) * (y_pred - y) * 1.0
            
            # 更新权重
            self.w -= lr * dw
            self.b -= lr * db

    def predict(self, x):
        return self.w * x + self.b

def test_linear_regressor_training():
    # 模拟真实标签 y = 2x + 1
    x_train = [1.0, 2.0, 3.0]
    y_train = [3.0, 5.0, 7.0]
    
    model = MiniLinearRegressor()
    model.fit(x_train, y_train, lr=0.05, epochs=200)
    
    # 验证训练后收敛的权重
    print(f"拟合后的权重: w={model.w}, b={model.b}")
    assert math.isclose(model.w, 2.0, abs_tol=0.05)
    assert math.isclose(model.b, 1.0, abs_tol=0.1)
    
    # 测试未见过的数据预测
    prediction = model.predict(4.0)  # 应接近 9.0
    assert math.isclose(prediction, 9.0, abs_tol=0.1)
""",
        "videos": [
            {
                "bvid": "BV1o84y1p7aX",
                "title": "工业级机器学习模型训练与服务部署 (BentoML/ONNX)",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "微软AI实验室",
                "play": "12.3万",
                "duration": "42:15",
                "recommend_reason": "视频系统演示了工程项目的架构管理，展示了从目录规划到单元测试并打包的全部工程流程，适合实战参考。"
            }
        ]
    }
}

def get_curated_resources_for_node(subject_cleaned: str, node_id: str):
    """
    Get curated quizzes, slides, code, and videos for the given subject and node_id.
    Returns a dict with keys: 'quiz', 'slides', 'code', 'videos' if matched, otherwise None.
    """
    node_id_clean = node_id.lower().strip()
    # Handle possible extra/reinforcement node ids mapping to their parent nodes
    if "_extra" in node_id_clean:
        node_id_clean = node_id_clean.split("_")[0]
    elif "reinforce_" in node_id_clean:
        # e.g., reinforce_node1_3 -> node1
        parts = node_id_clean.split("_")
        if len(parts) >= 2:
            node_id_clean = parts[1]

    if subject_cleaned == "python_basics":
        return PYTHON_BASICS_RESOURCES.get(node_id_clean)
    elif subject_cleaned == "machine_learning":
        return MACHINE_LEARNING_RESOURCES.get(node_id_clean)
    return None
