# --- Challenge Templates Mapping ---
PYTHON_CHALLENGES = {
    "node1": {
        "title": "Python 环境部署: Hello World",
        "description": "请编写一个函数 `hello_world()`，使其返回字符串 `'Hello, EduGenesis!'`。这是一个验证编译器的环境测试。",
        "initial_code": "def hello_world():\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_hello_world():
    assert hello_world() == 'Hello, EduGenesis!', "Expected hello_world() to return 'Hello, EduGenesis!'"
if __name__ == '__main__':
    test_hello_world()
"""
    },
    "node2": {
        "title": "变量与数据类型: 计算圆的面积",
        "description": "请完善函数 `circle_area(radius)`。根据公式 area = 3.14 * radius * radius 计算并返回圆的面积。如果半径小于 0，请返回 0。",
        "initial_code": "def circle_area(radius):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_circle_area():
    assert circle_area(5) == 78.5, "Expected circle_area(5) to return 78.5"
    assert circle_area(0) == 0, "Expected circle_area(0) to return 0"
    assert circle_area(-2.5) == 0, "Expected circle_area(-2.5) to return 0"
if __name__ == '__main__':
    test_circle_area()
"""
    },
    "node3": {
        "title": "控制流条件判断: 奇偶数检查",
        "description": "请完善函数 `check_even(num)`。判断 `num` 是否为偶数，如果是偶数则返回 True，否则返回 False。",
        "initial_code": "def check_even(num):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_check_even():
    assert check_even(4) is True, "check_even(4) did not return True"
    assert check_even(7) is False, "check_even(7) did not return False"
    assert check_even(0) is True, "check_even(0) did not return True"
if __name__ == '__main__':
    test_check_even()
"""
    },
    "node4": {
        "title": "循环控制结构: 斐波那契数列",
        "description": "请完善函数 `fibonacci(n)`。计算并返回斐波那契数列第 n 项的值（从0开始，即 fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, ...）。假设 n >= 0。",
        "initial_code": "def fibonacci(n):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_fibonacci():
    assert fibonacci(0) == 0
    assert fibonacci(1) == 1
    assert fibonacci(5) == 5
    assert fibonacci(8) == 21
if __name__ == '__main__':
    test_fibonacci()
"""
    },
    "node5": {
        "title": "内置核心数据结构: 过滤字典",
        "description": "请完善函数 `filter_scores(scores, threshold)`。其中 `scores` 是一个学生姓名到分数的字典，返回一个新字典，仅包含分数大于等于 `threshold` 的学生。",
        "initial_code": "def filter_scores(scores, threshold):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_filter_scores():
    sc = {'Alice': 85, 'Bob': 60, 'Charlie': 90}
    assert filter_scores(sc, 80) == {'Alice': 85, 'Charlie': 90}
    assert filter_scores(sc, 95) == {}
if __name__ == '__main__':
    test_filter_scores()
"""
    },
    "node6": {
        "title": "函数与封装抽象: 阶乘计算",
        "description": "请完善函数 `factorial(n)`。计算并返回正整数 n 的阶乘。规定 0 的阶乘为 1。",
        "initial_code": "def factorial(n):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_factorial():
    assert factorial(0) == 1
    assert factorial(1) == 1
    assert factorial(5) == 120
if __name__ == '__main__':
    test_factorial()
"""
    },
    "node7": {
        "title": "文件读写与异常处理: 安全整数转换",
        "description": "请完善函数 `safe_int(val)`。尝试将 `val` 转换为整数并返回，如果发生 ValueError 或 TypeError 异常，则返回 None。",
        "initial_code": "def safe_int(val):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_safe_int():
    assert safe_int('123') == 123
    assert safe_int('abc') is None
    assert safe_int(None) is None
if __name__ == '__main__':
    test_safe_int()
"""
    },
    "node8": {
        "title": "综合项目实战应用: 计算平均值",
        "description": "请完善函数 `calculate_average(numbers)`。计算传入列表 `numbers` 中所有数字的平均值。如果列表为空，请返回 0.0。",
        "initial_code": "def calculate_average(numbers):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_calculate_average():
    assert calculate_average([1, 2, 3, 4, 5]) == 3.0
    assert calculate_average([]) == 0.0
if __name__ == '__main__':
    test_calculate_average()
"""
    }
}

ML_CHALLENGES = {
    "node1": {
        "title": "线性代数算力证明: 向量点积",
        "description": "请完善函数 `dot_product(v1, v2)`。计算两个同维列表（向量） `v1` 和 `v2` 的点积并返回。",
        "initial_code": "def dot_product(v1, v2):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_dot_product():
    assert dot_product([1, 2, 3], [4, 5, 6]) == 32
    assert dot_product([0, 1], [1, 0]) == 0
if __name__ == '__main__':
    test_dot_product()
"""
    },
    "node2": {
        "title": "微积分与梯度下降: 权重一步更新",
        "description": "请完善函数 `gradient_step(w, dw, lr)`。根据一维权重更新公式 w_new = w - lr * dw 计算并返回更新后的权重值。其中 lr 为学习率，dw 为梯度。",
        "initial_code": "def gradient_step(w, dw, lr):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_gradient_step():
    assert abs(gradient_step(1.0, 0.1, 0.1) - 0.99) < 1e-6
    assert abs(gradient_step(0.5, -0.2, 0.01) - 0.502) < 1e-6
if __name__ == '__main__':
    test_gradient_step()
"""
    },
    "node3": {
        "title": "经典线性回归算法: 计算均方误差",
        "description": "请完善函数 `mean_squared_error(y_true, y_pred)`。计算真实值列表 `y_true` 和预测值列表 `y_pred` 之间的均方误差 (MSE) 并返回。计算公式为: MSE = sum((y_true[i] - y_pred[i])^2) / N。",
        "initial_code": "def mean_squared_error(y_true, y_pred):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_mean_squared_error():
    assert abs(mean_squared_error([1, 2, 3], [1, 2, 3]) - 0.0) < 1e-6
    assert abs(mean_squared_error([1, 2], [2, 4]) - 2.5) < 1e-6
if __name__ == '__main__':
    test_mean_squared_error()
"""
    },
    "node4": {
        "title": "逻辑回归与分类法则: Sigmoid 激活函数",
        "description": "请完善函数 `sigmoid(z)`。实现 Sigmoid 激活函数：f(z) = 1 / (1 + e^-z) 并返回。可以导入 math 模块并使用 math.exp。",
        "initial_code": "def sigmoid(z):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_sigmoid():
    import math
    assert abs(sigmoid(0) - 0.5) < 1e-6
    assert sigmoid(10) > 0.99
    assert sigmoid(-10) < 0.01
if __name__ == '__main__':
    test_sigmoid()
"""
    },
    "node5": {
        "title": "正则化防御过拟合: L2 正则化惩罚项",
        "description": "请完善函数 `l2_regularization(weights, alpha)`。计算所有权重平方和乘以正则化系数 alpha 的二分之一，即惩罚项 = 0.5 * alpha * sum(w^2)。返回该代价值。",
        "initial_code": "def l2_regularization(weights, alpha):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_l2_regularization():
    assert abs(l2_regularization([1, 2, -1], 0.1) - 0.3) < 1e-6
    assert abs(l2_regularization([], 0.1) - 0.0) < 1e-6
if __name__ == '__main__':
    test_l2_regularization()
"""
    },
    "node6": {
        "title": "前馈深度神经网络: 单层感知机",
        "description": "请完善函数 `perceptron(inputs, weights, bias)`。计算单层感知机的输出：如果 inputs 与 weights 的点积加上 bias 大于 0，返回 1，否则返回 0。",
        "initial_code": "def perceptron(inputs, weights, bias):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_perceptron():
    assert perceptron([1, 0], [1, 1], -0.5) == 1
    assert perceptron([0, 1], [-1, -1], 0.5) == 0
if __name__ == '__main__':
    test_perceptron()
"""
    },
    "node7": {
        "title": "反向传播求导推演: ReLU 导数计算",
        "description": "请完善函数 `relu_derivative(x)`。计算 ReLU 激活函数在输入 `x` 处的导数。当 x > 0 时，导数为 1.0；否则导数为 0.0。",
        "initial_code": "def relu_derivative(x):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_relu_derivative():
    assert relu_derivative(5.0) == 1.0
    assert relu_derivative(-1.0) == 0.0
    assert relu_derivative(0.0) == 0.0
if __name__ == '__main__':
    test_relu_derivative()
"""
    },
    "node8": {
        "title": "经典回归场景实战部署: 房价预测部署",
        "description": "请完善函数 `predict_price(sqft, p_per_sqft, base_price)`。简单计算预测房价：price = sqft * p_per_sqft + base_price。如果计算出的价格低于 base_price，则返回 base_price。",
        "initial_code": "def predict_price(sqft, p_per_sqft, base_price):\n    # 在下方编写你的代码逻辑\n    pass\n",
        "test_suite": """
def test_predict_price():
    assert predict_price(100, 15, 500) == 2000
    assert predict_price(-10, 10, 500) == 500
if __name__ == '__main__':
    test_predict_price()
"""
    }
}
