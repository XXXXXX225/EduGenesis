# -*- coding: utf-8 -*-
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
                "explanation": "系统终端依靠 PATH 环境变量去寻找可执行程序。若不把 python.exe 所在的文件夹加入 PATH，终端就会提示‘命令未找到’。环境变量可以用集合表示为 $Path = \\{D_{bin1}, D_{bin2}, ..., D_{binN}\\}$，终端会顺序在这些目录中匹配同名可执行文件。"
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
                "explanation": "默认的官方 PyPI 源服务器在国外，国内网络直接连接可能会很慢甚至连接超时。国内高校与企业提供了同步的镜像源（如清华源、阿里源），切换国内镜像源可大幅提升下载速度。可以使用命令配置：\n`pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`"
            },
            {
                "question": "在 VS Code 中开发 Python，哪一个核心扩展插件是官方推荐且必须安装 of VS Code 编辑器极速上手？",
                "options": [
                    "Docker 插件",
                    "Chinese (Simplified) 汉化插件",
                    "Python (by Microsoft) 官方插件",
                    "Auto Rename Tag 插件"
                ],
                "answer": 2,
                "explanation": "由微软官方发布的 Python 插件提供了核心的代码自动补全（Pylance）、Linting 语法检测、代码格式化（Black/Ruff）以及断点调试（Debugger）支持，是开发必配插件。"
            },
            {
                "question": "Python 解释器在第一次运行某个脚本（如 main.py）时，通常会在目录下生成一个 __pycache__ 文件夹，其内部包含 .pyc 文件。这些文件的主要作用是什么？",
                "options": [
                    "它们是加密后的源码，防止代码被反编译窃取",
                    "它们是编译后的字节码（Bytecode）缓存，下次运行时可直接加载以缩短启动和解析时间",
                    "它们是临时备份文件，防止程序运行崩溃时数据丢失",
                    "它们是针对多核 CPU 优化的本地机器码缓存"
                ],
                "answer": 1,
                "explanation": "Python 是一种解释型语言，但其执行过程是先编译为字节码，再由虚拟机（VM）解释执行。`.pyc` 文件缓存了字节码，免去了重复词法与语法分析的时间，其加速效果可表示为：$T_{total} = T_{load\\_bytecode} + T_{exec}$ 相比原先的 $T_{total} = T_{parse} + T_{compile} + T_{exec}$ 减少了 $T_{parse} + T_{compile}$ 时间。"
            }
        ],
        "slides": [
            {
                "title": "1. 解释器与 IDE 配置大纲",
                "content": "- **解释器与 IDE 区别**: 解释器负责将 Python 代码编译为字节码并执行；IDE 负责编写、组织与调试代码。\n- **运行机理**: Python 解释器（如 CPython）首先将 `.py` 源码编译为平台无关的字节码（Bytecode），并存储在 `__pycache__/*.pyc` 中。\n- **版本管理**: 推荐使用 `Miniconda` 或 `pyenv` 隔离不同项目所需的 Python 版本，防止全局环境污染。"
            },
            {
                "title": "2. 环境变量 (PATH) 的本质",
                "content": "- **检索原理**: 当在终端输入 `python` 时，系统会在环境变量 `PATH` 所列的目录中按顺序查找可执行文件。\n- **诊断方法**: \n  - Windows: 运行 `where python` 检查解析路径。\n  - macOS/Linux: 运行 `which python`。\n- **优先级**: 排在 `PATH` 前面的路径具有更高优先级，能覆盖排在后面的同名命令。"
            },
            {
                "title": "3. 编写第一个 Hello World 脚本",
                "content": "- **编写与执行**: 新建 'app.py'，写入 `print('Hello EduGenesis')`，在终端中输入 `python app.py` 即可激活运行。\n- **工作区配置**: 建议在 `.vscode/settings.json` 中配置格式化与检查规则，随项目版本库一同托管。"
            },
            {
                "title": "4. Pip 依赖管理与国内镜像源加速",
                "content": "- **依赖管理**: Python 的第三方生态通过 PyPI 进行分发，使用 `pip` 进行安装。\n- **超时瓶颈**: 默认源在国外，国内访问易超时。可以通过指定国内镜像源解决。\n- **配置命令**: \n  - 临时加速: `pip install <package> -i https://pypi.tuna.tsinghua.edu.cn/simple`\n  - 永久配置: `pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple`"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# Python 环境检测脚本

import sys
import os
import json

def check_environment_compatibility(min_major=3, min_minor=8):
    '''
    检测当前 Python 环境的兼容性。
    验证主版本与次版本是否满足最低要求，并返回系统配置信息。
    '''
    curr_major = sys.version_info.major
    curr_minor = sys.version_info.minor
    
    # 丰富断言逻辑：检查大版本必须等于指定版本或更新
    assert curr_major == min_major, f"主版本不匹配，需要 Python {min_major}"
    assert curr_minor >= min_minor, f"次版本过低，需要 Python {min_major}.{min_minor} 或更高版本"
    
    # 验证内置 json 库和 os 库的可用性
    test_data = {"status": "active", "path_sep": os.sep}
    serialized = json.dumps(test_data)
    deserialized = json.loads(serialized)
    
    assert deserialized["status"] == "active"
    assert deserialized["path_sep"] in ["\\", "/"]
    
    return {
        "version": f"{curr_major}.{curr_minor}",
        "os": os.name,
        "path_separator": os.sep
    }

def test_environment_check_pass():
    # 模拟运行环境自检
    config = check_environment_compatibility(3, 8)
    assert "version" in config
    assert config["path_separator"] in ["\\", "/"]
    print("环境自检测试成功通过！")

def test_environment_check_failure():
    # 验证不满足版本要求时能够正确触发 AssertionError
    try:
        check_environment_compatibility(4, 0)
    except AssertionError as e:
        assert "主版本不匹配" in str(e)
        print("环境不兼容性异常捕获成功！")
""",
        "videos": [
            {
                "bvid": "BV1Ee9EBnEfo",
                "title": "Python 环境配置与 VS Code 编辑器极速上手",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "黑马程序员",
                "play": "51.1万",
                "duration": "18:45",
                "recommend_reason": "该视频非常清晰地演示了 Windows/macOS 系统下安装 Python 解释器以及配置 VS Code 开发套件 of VS Code 编辑器极速上手，适合零基础学习。"
            },
            {
                "bvid": "BV1N54y1t71m",
                "title": "VS Code 配置 Python 开发环境超详细教程",
                "pic": "https://i0.hdslb.com/bfs/archive/4b6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "小高老师",
                "play": "28.3万",
                "duration": "24:12",
                "recommend_reason": "视频专注于 VS Code 插件配置，如 Pylance、Formatters 调试流程，适合希望深入定制开发环境的学习者。"
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
                "explanation": "在 Python 中，赋值 `b = a` 只是创建了对同一个列表对象的另一个引用（标签）。由于列表是可变数据类型（Mutable），通过 `a` 修改对象时，指向相同地址的 `b` 读出的数据也会一并更新。可以用恒等关系表示为 $id(a) == id(b)$。"
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
                "explanation": "Python 官方推荐 PEP 8 规范：普通变量和函数名使用小写字母和下划线（snake_case）；类名使用大驼峰命名（PascalCase，如 `StudentManager`）；常量使用全大写字母（UPPER_CASE）。"
            },
            {
                "question": "为什么在 Python 中执行 0.1 + 0.2 == 0.3 会返回 False？",
                "options": [
                    "Python 解释器在进行浮点数计算时存在软件设计缺陷",
                    "浮点数在计算机底层是以二进制科学记数法（IEEE 754 标准）存储的，十进制小数 0.1 和 0.2 在转换为二进制时是无限循环小数，由于截断误差导致运算结果略微大于 0.3",
                    "在 Python 中，== 运算符无法用于浮点数的比对",
                    "0.1 和 0.2 被自动转换为整型进行计算了"
                ],
                "answer": 1,
                "explanation": "计算机底层的浮点数计算采用 IEEE 754 双精度浮点格式。$0.1_{10}$ 转换为二进制是 $0.0001100110011..._2$，存储时会产生截断。数学计算中：$0.1 + 0.2 = 0.30000000000000004 \\neq 0.3$。因此在比对浮点数时，应当使用精度范围判断，如 `math.isclose(a, b)`。"
            }
        ],
        "slides": [
            {
                "title": "1. 变量与动态绑定",
                "content": "- **动态类型**: Python 变量不需要显式声明类型。变量是对象的引用（标签），同一个变量名在运行中可以随时重新绑定 to 其他类型的数据对象上。\n- **标识验证**: 使用 `id(x)` 可以获取变量指向的对象在内存中的唯一地址，而 `x is y` 等价于 `id(x) == id(y)`。"
            },
            {
                "title": "2. 数值类型 int 与 float",
                "content": "- **整型精度**: Python 内置高精度 `int`，支持超长整数，能表示任意大小的数值。\n- **双精度浮点数**: `float` 使用 64 位双精度浮点数（IEEE 754）存储，可表示绝大多数科学计算值。\n- **精度陷阱**: 浮点数精确比对禁止直接使用 `==`，必须采用容差设计，如 `abs(a - b) < 1e-9` 或 `math.isclose(a, b)`。"
            },
            {
                "title": "3. 字符类型与不可变性",
                "content": "- **不可变性**: 字符串 `str` 是不可变类型（Immutable），在内存中一经创建就无法就地修改。\n- **驻留机制**: 内容相同的短字符串可能会被 Python 的驻留机制合并，指向同一内存地址。\n- **拼接性能**: 循环内使用 `+` 拼接字符串会引发 $\\mathcal{O}(N^2)$ 的开销，应当转用 `''.join()` 实现 $\\mathcal{O}(N)$ 级拼接。"
            },
            {
                "title": "4. 变量命名 PEP 8 最佳实践",
                "content": "- **小写蛇形 (snake_case)**: 适用于普通变量和函数名，例如 `user_age`, `calc_total()`。\n- **大驼峰 (PascalCase)**: 适用于类名定义，例如 `StudentManager`。\n- **全大写加下划线**: 适用于常量，例如 `MAX_RETRY_COUNT`。"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# 变量类型与引用测试

import math

def safe_float_compare(val1, val2, rel_tol=1e-9):
    '''
    安全地比较两个浮点数是否相等。
    利用绝对/相对容差计算：|val1 - val2| <= max(rel_tol * max(|val1|, |val2|), abs_tol)
    '''
    return math.isclose(val1, val2, rel_tol=rel_tol)

def check_string_interning(str1, str2):
    '''
    验证两个内容相同的字符串是否指向相同的内存地址（即是否发生驻留）
    '''
    same_value = (str1 == str2)
    same_id = (str1 is str2)
    return same_value, same_id

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

def test_float_comparison():
    # 验证典型浮点计算误差
    sum_val = 0.1 + 0.2
    assert sum_val != 0.3
    assert safe_float_compare(sum_val, 0.3) is True
    print("浮点误差及安全比对测试通过！")
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
            },
            {
                "bvid": "BV1o84y1p7aX",
                "title": "一期视频彻底搞懂 Python 引用与可变不可变类型",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "程序员老徐",
                "play": "10.4万",
                "duration": "22:15",
                "recommend_reason": "视频配有大量对象内存模型示意图，能够透彻解释 Python 传引用与浅拷贝的底层细节，非常推荐。"
            }
        ]
    },
    "node3": {
        "quiz": [
            {
                "question": "在 Python 中进行条件判断时，以下哪个对象在求值时会被判定为布尔假值（Falsy）？",
                "options": [
                    "数字 0.0",
                    "包含单个空格的字符串 ' '",
                    "含有数字的列表 [0]",
                    "字符串 'False'"
                ],
                "answer": 0,
                "explanation": "Python 的 Falsy 假值包括：None、False、数值零（0、0.0、0j），以及空序列与空容器（如空字符串 ''、空列表 []、空元组 ()、空字典 {}、空集合 set()）。其余对象如含有空格的字符串、含有 0 的列表等都是 True。"
            },
            {
                "question": "关于 Python 中的多分支结构 if-elif-else，下列说法正确的是？",
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
                "question": "假设已知变量 a = True, b = False。下列布尔逻辑表达式中，求值结果为 True 的是？",
                "options": [
                    "not a",
                    "a and b",
                    "a or b",
                    "not (a or not b)"
                ],
                "answer": 2,
                "explanation": "`a or b` 会在其中任何一个变量为 True 时返回 True。由于 a 为 True，所以 `a or b` 是 True。"
            },
            {
                "question": "对于表达式 a < b < c，Python 解释器在底层的实际计算逻辑是？",
                "options": [
                    "先计算 a < b 得到布尔值，再拿布尔值与 c 进行大小比对",
                    "它等价于 (a < b) and (b < c)，且 b 在求值时只会被计算一次",
                    "这在 Python 中属于语法错误，不能连续使用小于号",
                    "它等价于 a < c，中间的 b 会被忽略"
                ],
                "answer": 1,
                "explanation": "Python 支持链式比较（Chained Comparisons）。`a < b < c` 在底层被翻译为 `a < b and b < c`。若 `a < b` 为 False，则整个表达式直接短路，后面的 `b < c` 不会被计算。可以用逻辑与符号表示为：$a < b \\land b < c$。"
            }
        ],
        "slides": [
            {
                "title": "1. 条件判断逻辑控制",
                "content": "- **分支结构**: 控制流的核心在于 `if-elif-else` 分支。代码块利用缩进（Indentation，推荐 4 个空格）划分层次，取代了花括号。\n- **缩进规范**: 缩进级别的混乱会引发 `IndentationError`。必须保持统一的空格数。"
            },
            {
                "title": "2. 布尔真假值测试",
                "content": "- **Falsy 隐式值**: Python 采用非常灵活的真假值判定。数字 0、空列表 `[]`、空字典 `{}` 等均在条件判断中被评估为假（Falsy），简化了空值防护。\n- **常用 Falsy 对象**: `None`, `False`, `0`, `0.0`, `''`, `[]`, `{}`, `()`, `set()`。"
            },
            {
                "title": "3. 逻辑运算符与短路评估",
                "content": "- **布尔运算**: 包含 `and`, `or`, `not`。\n- **短路求值 (Short-circuit)**: \n  - `A and B`: 若 A 为 Falsy，B 不执行。\n  - `A or B`: 若 A 为 Truthy，B 不执行。\n- **妙用安全网**: 例如 `if lst is not None and len(lst) > 0:` 可防御 `lst` 为空导致的越界错误。"
            },
            {
                "title": "4. 链式比较与条件表达式",
                "content": "- **链式比较**: 类似于数学表达，`5 < x <= 10` 等价于 `(5 < x) and (x <= 10)`。\n- **三元表达式**: 语法为 `value_if_true if condition else value_if_false`，应仅用于简单的单行赋值。"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# 条件控制流逻辑测试

def evaluate_score_level(score):
    '''
    根据分数返回级别评估。
    '''
    if score >= 90:
        return "Excellent"
    elif score >= 60:
        return "Pass"
    else:
        return "Fail"

def safe_element_access(data_list, index, fallback="DEFAULT"):
    '''
    使用短路求值安全地访问列表元素，防范越界。
    '''
    if data_list is not None and 0 <= index < len(data_list):
        return data_list[index]
    return fallback

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

def test_safe_access_logic():
    lst = [10, 20, 30]
    assert safe_element_access(lst, 1) == 20
    assert safe_element_access(lst, 5) == "DEFAULT"
    assert safe_element_access(None, 0) == "DEFAULT"
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
            },
            {
                "bvid": "BV1B7411P79g",
                "title": "Python 逻辑运算符与短路求值进阶",
                "pic": "https://i0.hdslb.com/bfs/archive/1c6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "黑马程序员",
                "play": "8.5万",
                "duration": "16:20",
                "recommend_reason": "视频中对逻辑运算符的优先级、短路求值机制进行了详细剖析，帮助理解优雅的代码书写规则。"
            }
        ]
    },
    "node4": {
        "quiz": [
            {
                "question": "在 Python 循环中，关键字 break 和 continue 的本质区别是？",
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
                "question": "关于 Python 循环语句（for 或 while）后面附带的 else 子句，下列说法正确的是？",
                "options": [
                    "else 子句每次循环迭代都会被执行一次",
                    "else 子句只有在循环体因为执行了 break 语句被强行打断时，才会被触发执行",
                    "else 子句在循环体正常迭代完毕（条件变为 False 退出）时被执行。若循环是被 break 强行打断的，则 else 不会被执行"
                ],
                "answer": 2,
                "explanation": "Python 的 loop-else 结构中，`else` 代表“非 break 退出”。即如果循环完整地执行完（比如 for 正常遍历完列表，while 条件自然变为 False），`else` 就会执行；如果被 `break` 提前截断，`else` 则被跳过。"
            },
            {
                "question": "使用 range(1, 5) 进行 for 循环，循环体一共会被执行多少次？",
                "options": [
                    "3 次",
                    "4 次",
                    "5 次",
                    "根据系统环境动态决定次数"
                ],
                "answer": 1,
                "explanation": "`range(start, stop)` 具有“左闭右开”（含头不含尾）的特征。`range(1, 5)` 生成的序列为 `[1, 2, 3, 4]`，因此循环体共执行 4 次。"
            },
            {
                "question": "在嵌套循环中，若内层循环中执行了 break 语句，程序将会跳转到哪里执行？",
                "options": [
                    "直接跳出最外层的循环体，结束所有迭代",
                    "仅跳出当前所在的内层循环，回到外层循环继续下一轮迭代",
                    "跳出当前的函数体，直接返回 None",
                    "导致程序崩溃并抛出 StopIteration 异常"
                ],
                "answer": 1,
                "explanation": "`break` 语句仅对包含它的最近的一层循环起作用。在嵌套循环中，内层循环里的 `break` 会打断当前的内层循环体，执行流会回到外层循环的迭代处，继续执行外层循环的后续代码。"
            }
        ],
        "slides": [
            {
                "title": "1. For 与 While 循环控制",
                "content": "- **循环结构**: Python 提供了两种循环结构：`while` 用于基于条件的重复，`for` 用于迭代任何序列/容器中的元素。\n- **惰性求值**: `range(start, stop, step)` 返回一个惰性的 range 对象，其空间复杂度为 $\\mathcal{O}(1)$，不占用多余内存。"
            },
            {
                "title": "2. 循环打破与跳过",
                "content": "- **Break (中断)**: 立即彻底终结当前循环，跳出最近一层的循环体。\n- **Continue (跳过)**: 放弃当前轮次循环体中 continue 后面的语句，跳往循环头部开始下一次判定。\n- **跳出多层**: 可以通过定义 Flag 标志位或将循环封装在函数中用 `return` 跳出。"
            },
            {
                "title": "3. 独特的 Loop-Else 语法",
                "content": "- **语法对齐**: `else` 块与 `for` 或 `while` 同级对齐。\n- **触发机制**: 如果循环没有被内层 `break` 语句强行提前截断，而是一路正常跑完，则在退出循环后**自动执行 else 块**。\n- **实战优势**: 适合线性搜索场景下没有找到匹配项时的统一兜底处理。"
            },
            {
                "title": "4. range 参数特征与步长",
                "content": "- **左闭右开**: `range(1, 10, 3)` 产生的项可列为等差数列：$a_n = 1 + 3(n-1) < 10$，即 `[1, 4, 7]`。\n- **负步长**: `range(5, 0, -1)` 会产生递减序列 `[5, 4, 3, 2, 1]`。"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# 循环结构控制测试

def calculate_sum_of_odds(n):
    '''
    计算 1 到 n 之间所有奇数的和。
    '''
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            continue  # 跳过偶数
        total += i
    return total

def find_target_in_loop(lst, target):
    '''
    模拟 loop-else 查找。
    '''
    for item in lst:
        if item == target:
            return True
    else:
        # 如果循环遍历完都没被 return，执行 else
        return False

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
            },
            {
                "bvid": "BV18t411u7T7",
                "title": "搞懂 Python 循环 Else 语句",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "廖雪峰",
                "play": "15.4万",
                "duration": "12:10",
                "recommend_reason": "该视频专注于 loop-else 语法，通过经典的线性查找算法实例，剖析了此语法背后的工程逻辑。"
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
                "explanation": "字典使用哈希表实现，键必须可哈希（不可变类型，如 int、float、str、tuple）。列表是可变的（Mutable），元组是不可变的（Immutable），集合是无序且不重复的。"
            },
            {
                "question": "已知一个列表 x = [1, 2, 3]。下列哪项操作会删除列表的最后一个元素并将其返回？",
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
                "question": "假设两个集合 A = {1, 2, 3}, B = {3, 4, 5}。它们的交集（Intersection）运算 A & B 结果为？",
                "options": [
                    "{1, 2, 3, 4, 5}",
                    "{1, 2}",
                    "{3}",
                    "{4, 5}"
                ],
                "answer": 2,
                "explanation": "交集运算符 `&` 返回两个集合中共同包含的元素集合。由于 A 和 B 唯一的共同元素是 3，交集结果为 `{3}`。交集操作可以表示为：$A \\cap B = \\{x \\mid x \\in A \\land x \\in B\\}$。"
            },
            {
                "question": "已知一个列表 lst = [10, 20, 30, 40, 50]。执行切片操作 lst[-3:-1] 后，得到的子列表会是？",
                "options": [
                    "[30, 40, 50]",
                    "[30, 40]",
                    "[40, 50]",
                    "[20, 30, 40]"
                ],
                "answer": 1,
                "explanation": "切片语法是 `[start:stop]`（左闭右开）。`-3` 对应 `30`，`-1` 对应 `50` 且不包含，因此 `lst[-3:-1]` 返回 `[30, 40]`。"
            }
        ],
        "slides": [
            {
                "title": "1. 内置容器结构分类",
                "content": "- **数据结构分类**: \n  - `list`: 有序、可变列表。\n  - `tuple`: 有序、不可变元组。\n  - `dict`: 无序键值对（Key-Value），键必须唯一且可哈希。\n  - `set`: 无序唯一集合，不支持重复元素。"
            },
            {
                "title": "2. 可变与不可变的边界",
                "content": "- **可变对象**: 列表、字典、集合，支持原地修改，不可哈希（无法作为 dict 键或 set 元素）。\n- **不可变对象**: 整数、浮点数、字符串、元组，不能就地修改，可哈希（可以用作 dict 键）。\n- **嵌套安全**: 元组如果包含列表（如 `(1, [2])`），则变为不可哈希。"
            },
            {
                "title": "3. 列表切片与推导式",
                "content": "- **切片公式**: `lst[start:stop:step]`。步长支持负数，例如 `lst[::-1]` 会优雅地将列表反转。\n- **推导式 (Comprehension)**: \n  - 基础形式: `[x**2 for x in lst if x > 0]`\n  - 效率优势: 解释器底层优化，相比 `for + append` 执行效率更高。"
            },
            {
                "title": "4. 集合与字典的底层哈希",
                "content": "- **字典复杂度**: 底层通过哈希表存储，常规查找的时间复杂度为极低的 $\\mathcal{O}(1)$。\n- **集合数学运算**: \n  - 交集: `A & B`\n  - 并集: `A | B`\n  - 差集: `A - B`\n  - 对称差集: `A ^ B`"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# 核心数据结构用法测试

import copy

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

def test_copy_behaviors():
    # 演示浅拷贝与深拷贝
    original = [[1, 2], [3, 4]]
    shallow = copy.copy(original)
    deep = copy.deepcopy(original)
    
    original[0][0] = 99
    
    # 验证浅拷贝内部子列表改变联动
    assert shallow[0][0] == 99
    # 验证深拷贝内部子列表完全隔离
    assert deep[0][0] == 1
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
            },
            {
                "bvid": "BV1d54y1t71m",
                "title": "Python 列表推导式与切片技巧进阶",
                "pic": "https://i0.hdslb.com/bfs/archive/4b6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "极客学院",
                "play": "11.2万",
                "duration": "18:40",
                "recommend_reason": "讲解了各种步长切片、多重循环列表推导式以及嵌套数据处理技巧，适合提升代码的 Pythonic 质感。"
            }
        ]
    },
    "node6": {
        "quiz": [
            {
                "question": "在 Python 函数定义中，参数前带有单个星号 *args 和 double 星号 **kwargs 分别代表什么？",
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
                "explanation": "因为 Python 函数的默认值对象在**定义时仅创建并初始化一次**。如果使用可变对象（如空列表 `[]`），在后续多次调用中如果改变了它，它会持续累加。因此应推荐使用 `None` 作为占位符。防御式编写范式为：\n`if x is None: x = []`"
            },
            {
                "question": "在嵌套函数中，如果要在内部函数中修改外部函数的局部变量的值，应当使用哪个关键字声明该变量？",
                "options": [
                    "global",
                    "nonlocal",
                    "outer",
                    "static"
                ],
                "answer": 1,
                "explanation": "`global` 关键字用于修改文件级别的全局变量；而在嵌套函数中，要修改外部封闭函数（Enclosing Scope）的局部变量，必须使用 `nonlocal` 关键字声明。"
            }
        ],
        "slides": [
            {
                "title": "1. 函数声明与参数解构",
                "content": "- **定义函数**: 使用 `def` 关键字定义函数。\n- **参数传递**: \n  - 位置与关键字参数。\n  - `*args`: 接收不定长位置参数，打包为元组（Tuple）。\n  - `**kwargs`: 接收不定长关键字参数，打包为字典（Dict）。\n- **解包调用**: 可以通过 `func(*lst, **dct)` 逆向进行拆包传递。"
            },
            {
                "title": "2. 作用域 LEGB 法则",
                "content": "- **查找顺序**: Python 变量解析顺序遵循 LEGB 原则。\n  - **L (Local)**: 局部作用域（函数内部）。\n  - **E (Enclosing)**: 闭包外层作用域。\n  - **G (Global)**: 全局模块作用域。\n  - **B (Built-in)**: 内置作用域（如 `len`, `range`）。\n- **关键字修改**: 使用 `global` 声明修改全局变量，使用 `nonlocal` 声明修改闭包外层变量。"
            },
            {
                "title": "3. 默认参数可变对象陷阱",
                "content": "- **陷阱原理**: 默认参数对象在定义（编译）时仅被创建和初始化一次。\n- **问题体现**: 若使用可变类型（如 `def f(x=[])`），多轮未传参调用会共享并累加该列表。\n- **最佳实践**: 推荐使用 `None` 充当哨兵，在内部进行空值检测并初始化：`if x is None: x = []`。"
            },
            {
                "title": "4. 高阶函数与 Lambda 匿名函数",
                "content": "- **匿名函数**: `lambda x: x*x` 定义简单单行函数，其返回值即为求值结果。\n- **高阶函数**: 接收函数为参数（如 `map`, `filter`, `sorted`）或返回一个函数的函数。\n- **使用界限**: 匿名函数仅在单行映射或排序 key 中使用，复杂逻辑应定义普通 `def` 函数以利于维护与单元测试。"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
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

def make_multiplier_accumulator(initial_value=0):
    '''
    构建累加乘数器闭包，演示 nonlocal 修改 Enclosing 变量。
    '''
    current_value = initial_value
    
    def accumulator(multiplier, addend=0):
        nonlocal current_value
        current_value = current_value * multiplier + addend
        return current_value
        
    return accumulator

def test_global_scope():
    modify_global_counter(400)
    assert GLOBAL_COUNTER == 400

def test_mutable_default_workaround():
    a = append_to_element(1)
    b = append_to_element(2)
    # 验证 a 与 b 是彼此独立的全新列表，而不是共享同一个 [] 缓存
    assert a == [1]
    assert b == [2]

def test_closure_accumulator():
    acc = make_multiplier_accumulator(5)
    assert acc(2, 3) == 13   # 5 * 2 + 3 = 13
    assert acc(1, 5) == 18   # 13 * 1 + 5 = 18
""",
        "videos": [
            {
                "bvid": "BV1o84y1p7yV",
                "title": "深入理解 Python 中的函数参数传递与 LEGB 作用域",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "程序员老徐",
                "play": "10.4万",
                "duration": "22:15",
                "recommend_reason": "视频中结合汇编底层和 Python 的 `__defaults__` 原理深度剖析了可变参数默认值陷阱，是中高级进阶必看。"
            },
            {
                "bvid": "BV1xZ4y1u7t8",
                "title": "Python 闭包与装饰器深入浅出",
                "pic": "https://i0.hdslb.com/bfs/archive/4b6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "千锋教育",
                "play": "30.1万",
                "duration": "45:10",
                "recommend_reason": "以由浅入深的代码案例讲解了嵌套作用域 nonlocal 的机制以及闭包对内存变量的捕获与维持，极其契合进阶实践。"
            }
        ]
    },
    "node7": {
        "quiz": [
            {
                "question": "使用 with open('data.txt', 'r') as f 文件打开方式，最核心的安全保障和优势在于？",
                "options": [
                    "它能对文件内容自动进行大模型合规校验与过滤",
                    "它是一个上下文管理器（Context Manager），不管在读写中是否发生报错或中断，都会在退出 with 块时自动关闭文件并释放内存句柄",
                    "它能自动检测网络异常并上传文件备份",
                    "它比普通的 open() 快 10 倍以上"
                ],
                "answer": 1,
                "explanation": "`with` 语句通过实现上下文管理协议（`__enter__` 和 `__exit__`），确保在执行完毕或抛出任何异常退出时，系统底层能 100% 自动执行 `close()` 释放文件句柄，防范内存与文件描述符泄露。"
            },
            {
                "question": "在 Python 异常处理结构 try...except...else...finally 中，关于 finally 代码块描述正确的是？",
                "options": [
                    "只有在没有捕获到任何异常时，finally 块才会被执行",
                    "只有在 except 捕获到异常时，finally 块才会被执行",
                    "不管程序是否发生异常，也不管是在 try 还是 except 内部中途执行了 return 语句，finally 块都必定会被最终执行一次",
                    "它的功能完全可以通过 else 代替，是一种归属于多余的语法结构"
                ],
                "answer": 2,
                "explanation": "`finally` 的执行级别最高。不论在 `try` 执行期间是否发生错误、报错是否被捕获、或者是否执行了 `return`、`break` 语句跳出，`finally` 里的清理代码块都必定会最终执行。"
            },
            {
                "question": "在 except 子句中，捕获具体的异常类型（如 except ZeroDivisionError:）比直接使用裸的 except: 有什么好处？",
                "options": [
                    "没有什么区别，只是打字量不同",
                    "裸的 except 会自动拦截键盘的中断信号（Ctrl+C）以及系统级正常退出，使得程序极难通过常规手段终止，并隐藏未知的逻辑 Bug",
                    "捕获具体的异常会使得程序运行变慢",
                    "这是一种语法限制，Python 3 不再支持裸的 except:"
                ],
                "answer": 1,
                "explanation": "直接使用裸的 `except:` 会隐式地捕获包括 `SystemExit`、`KeyboardInterrupt` 在内的所有异常，导致用户在终端敲 Ctrl+C 无法退出进程。按照健壮性编码，应当只捕获预期的异常，将未知的错误抛给上层。或者至少使用 `except Exception as e:`。"
            },
            {
                "question": "若要在程序中主动抛出特定异常，例如在参数检查发现非法内容时，应当使用哪个关键字？",
                "options": [
                    "throw",
                    "raise",
                    "assert",
                    "except"
                ],
                "answer": 1,
                "explanation": "在 Python 中，抛出异常使用的是 `raise` 关键字（如 `raise ValueError('invalid argument')`）。而 `throw` 是其他语言的关键字；`assert` 用于开发调试期的逻辑断言（表达式为假则抛出 AssertionError）。"
            }
        ],
        "slides": [
            {
                "title": "1. 文件句柄与 Context Manager",
                "content": "- **资源限制**: 操作系统分配的文件描述符数量有限。每次 `open` 后若未执行 `close`，可能引发句柄泄露。\n- **With 语法**: 利用 `with open(...) as f:` 自动管理文件开启和关闭生命周期。\n- **编码规格**: 读写文本时应显式传递编码格式，例如 `encoding='utf-8'`，避免引发平台差异的 `UnicodeDecodeError`。"
            },
            {
                "title": "2. 异常处理 Try-Except 结构",
                "content": "- **拦截机制**: `try-except` 能够捕获运行时异常，避免程序崩溃。\n- **精确捕获**: 应当总是捕获具体的错误类型（如 `ZeroDivisionError`, `ValueError`），不要写裸的 `except:`，这会屏蔽 `KeyboardInterrupt` 等系统退出信号。\n- **多分支捕获**: 可以配置多个 `except` 块来应对不同的错误源。"
            },
            {
                "title": "3. Else 与 Finally 的执行规则",
                "content": "- **Else 分支**: 在 `try` 块无任何异常抛出、执行完毕时才会触发运行。通常用于放置不需要异常拦截的成功流逻辑. \n- **Finally 分支**: 无论是否发生异常、无论是否发生 `return` 或 `break`，`finally` 块都必定会最终强制执行。常用于关闭物理连接、事务解锁等。"
            },
            {
                "title": "4. 自定义异常设计",
                "content": "- **主动抛出**: 使用 `raise` 主动抛出异常对象，阻断当前执行流，便于上层捕获处理。\n- **异常继承**: 用户自定义异常应继承自标准 `Exception` 类，而非 `BaseException`。例如：\n```python\nclass MyBusinessError(Exception): pass\n```"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# 文件读写与异常安全测试

import os

class InvalidDataError(Exception):
    '''自定义业务数据异常：当解析的文件内容包含非法数据格式时抛出'''
    pass

def parse_sensor_data_file(file_path):
    '''
    安全读取温度传感数据文件，并计算其平均温度。
    - 忽略以 '#' 开头的注释行
    - 处理 FileNotFoundError, 确保句柄安全释放
    - 提取失败或数据值为空则抛出 InvalidDataError
    '''
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"未找到指定的传感器文件: {file_path}")
        
    total_temp = 0.0
    count = 0
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                clean_line = line.strip()
                # 过滤注释与空行
                if not clean_line or clean_line.startswith("#"):
                    continue
                try:
                    # 尝试解析温度值
                    temp = float(clean_line)
                    total_temp += temp
                    count += 1
                except ValueError as ve:
                    # 脏数据防御性抛出自定义业务异常
                    raise InvalidDataError(f"数据格式损坏，无法解析为数值: {clean_line}") from ve
    except Exception as outer_e:
        raise outer_e
        
    if count == 0:
        raise InvalidDataError("文件中不包含任何有效的数值记录")
        
    return total_temp / count

def test_file_io_flow():
    test_file = "test_sensor_ok.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("# Sensor calibration log\n22.5\n\n24.5\n# End\n25.0\n")
        
    try:
        avg = parse_sensor_data_file(test_file)
        assert abs(avg - 24.0) < 1e-5
    finally:
        # 善后清理
        if os.path.exists(test_file):
            os.remove(test_file)

def test_sensor_data_errors():
    bad_file = "test_sensor_bad.txt"
    with open(bad_file, "w", encoding="utf-8") as f:
        f.write("22.5\nNOT_A_NUMBER\n")
        
    try:
        # 验证遇到无法解析内容时正确抛出 InvalidDataError
        import pytest
        with pytest.raises(InvalidDataError) as exc_info:
            parse_sensor_data_file(bad_file)
        assert "数据格式损坏" in str(exc_info.value)
    finally:
        if os.path.exists(bad_file):
            os.remove(bad_file)
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
            },
            {
                "bvid": "BV1B7411P79g",
                "title": "Python 进阶：全面搞懂异常与上下文管理",
                "pic": "https://i0.hdslb.com/bfs/archive/1c6e4e5904aa9e37835537921354daee6b43103.jpg",
                "author": "微软学术推广",
                "play": "14.2万",
                "duration": "25:30",
                "recommend_reason": "视频结构清晰，对 try-except-else-finally 每一条分支在函数 return 时的具体劫持效果做了清晰的代码还原，进阶极力推荐。"
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
                    "使用 from models.utils import format_results 等语句进行层级导入，并在目录中放置 __init__.py 以标记包目录",
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
                "explanation": "单元测试是保证软件质量的黄金标准。通过针对各类入参编写 PyTest 测试用例，我们能够在后续重构或修改时自动捕捉隐蔽的回归（Regression）缺陷。"
            },
            {
                "question": "在很多 Python 文件中经常会看到有如下语句：if __name__ == '__main__':。这行代码的真实用处是？",
                "options": [
                    "它是一个装饰器，用于提升当前文件的执行优先级",
                    "这是系统自动加上去的，没有任何实际意义",
                    "它使得该文件既可以作为脚本被直接运行（此时该代码块内的代码会执行），又可以在被其他文件 import 引入时，防止该代码块被自动触发执行",
                    "为了告诉解释器此文件是 main.py 的拷贝"
                ],
                "answer": 2,
                "explanation": "当 Python 脚本被直接运行时，内置变量 `__name__` 会被赋值为 `__main__`，从而触发 if 块内的调试或演示程序；如果该文件是被其他文件 `import` 引入的，`__name__` 会被设为文件名，if 块便不会执行，避免了重复调用的混乱。"
            },
            {
                "question": "在 Pytest 测试框架中，若想要在多个不同的测试函数之间共享初始化数据或重置环境（例如创建数据库连接或测试文件），最优雅的机制是？",
                "options": [
                    "将数据定义在全局变量中，在每个测试函数的第一行手动调用 init",
                    "使用 Pytest 的 @pytest.fixture 装饰器定义夹具函数，并在测试函数参数列表中声明引入",
                    "将所有测试合并为一个极其巨大的单体测试函数",
                    "在 tests 目录之外创建辅助的 shell 脚本，每次测试前手动用 shell 运行重置"
                ],
                "answer": 1,
                "explanation": "Pytest 的 `Fixture` 夹具机制是其核心精髓。通过 `@pytest.fixture` 可以声明前置（Setup）和后置清理（Teardown）逻辑，并根据 scope 参数（如 function、module、session）灵活设定生命周期范围。"
            }
        ],
        "slides": [
            {
                "title": "1. 模块化与工程架构",
                "content": "- **高内聚低耦合**: 模块化能让大型系统拆分为独立的功能单元。每个 `.py` 文件都是一个独立的命名空间（Module）。\n- **包物理结构**: Python 使用模块和包来进行代码隔离与重用。在文件夹下创建 `__init__.py` 即可定义包目录。\n- **循环依赖**: 设计包时应保持单向依赖，双向 import 会引发 `ImportError` 异常。"
            },
            {
                "title": "2. PyTest 自动化单元测试",
                "content": "- **行业标准**: PyTest 框架已成为行业测试事实规范。\n- **命名约束**: 测试脚本文件名与测试函数名均必须以 `test_` 开头。\n- **断言逻辑**: 使用原生的 `assert` 表达式，结合边缘条件对逻辑边界进行拦截。"
            },
            {
                "title": "3. 入口控制 __name__ 原理",
                "content": "- **脚本与模块**: 一个 Python 文件既能作为脚本直接运行，又能作为模块被导入。\n- **变量行为**: \n  - 直接执行时: `__name__` 值为 `'__main__'`。\n  - 模块导入时: `__name__` 值为文件名。\n- **作用**: 用于编写独立的调试、Demo 或自测逻辑而不污染导入环境。"
            },
            {
                "title": "4. 模块查找搜索优先级",
                "content": "- **sys.path**: 存放了解析 import 的所有搜索路径。\n- **检索顺序**: 当前脚本运行目录 -> 内置标准库目录 -> 第三方 `site-packages`。\n- **临时引用**: 可以通过 `sys.path.append()` 动态修改，但建议配置 `PYTHONPATH` 以保持工程纯净。"
            }
        ],
        "code": r"""# -*- coding: utf-8 -*-
# 综合项目管理系统实战测试

class StudentManager:
    '''
    综合项目管理类：模拟学生账户添加及平均分计算
    '''
    def __init__(self):
        self.students = {}  # name -> score

    def add_student(self, name, score):
        if not isinstance(name, str) or len(name.strip()) == 0:
            raise ValueError("学生姓名不合法")
        if not isinstance(score, (int, float)) or score < 0 or score > 100:
            raise ValueError("分数必须在 0 - 100 之间")
        self.students[name.strip()] = score

    def remove_student(self, name):
        name_clean = name.strip()
        if name_clean not in self.students:
            raise KeyError(f"未找到该学生: {name}")
        return self.students.pop(name_clean)

    def get_average_score(self):
        if not self.students:
            return 0.0
        return sum(self.students.values()) / len(self.students)

def test_student_manager_success():
    manager = StudentManager()
    manager.add_student("Alice", 95)
    manager.add_student("Bob", 85)
    manager.add_student(" Charlie ", 90)
    
    assert manager.get_average_score() == 90.0

def test_student_manager_invalid_input():
    manager = StudentManager()
    
    import pytest
    with pytest.raises(ValueError):
        manager.add_student("", 80)  # 空名字报错
        
    with pytest.raises(ValueError):
        manager.add_student("Dave", 120)  # 异常分数报错

def test_student_manager_empty_average():
    manager = StudentManager()
    assert manager.get_average_score() == 0.0
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
            },
            {
                "bvid": "BV1o84y1p7aX",
                "title": "Pytest 单元测试从入门到企业级实战",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "黑马程序员",
                "play": "12.3万",
                "duration": "42:15",
                "recommend_reason": "视频系统演示了工程项目的架构管理，展示了从目录规划到单元测试并打包的全部工程流程，适合实战参考。"
            }
        ]
    }
}

