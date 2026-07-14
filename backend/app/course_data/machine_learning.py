# -*- coding: utf-8 -*-
# Machine Learning & Deep Learning Course Resources Database
# Enriched with high-quality quizzes, slides, code challenges, and video recommendations.

import math
import json

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
                "explanation": "向量点积公式为 $a \\cdot b = \\sum a_i b_i = |a||b|\\cos\\theta$。当两个向量模长为 1 时，点积等于它们的余弦夹角（Cosine Similarity），这在自然语言处理的 TF-IDF 向量计算和多模态表征对齐中是度量特征方向相似度（余弦相似度）最基本、最核心的方式。"
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
                "explanation": "根据矩阵乘法的规则，一个 $(m \\times n)$ 的矩阵与一个 $(n \\times p)$ 的矩阵相乘，其乘积结果的维度为 $(m \\times p)$。在此题中，$p=1$，因而得到维数为 $(m \\times 1)$ 的列向量。这在线性回归和全连接层的前向传播中，对应着 $m$ 个样本同时进行线性求和预测所得的输出。"
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
                "explanation": "特征向量的几何本质是在线性变换 $A$ 下空间方向保持不变的非零基底向量。在施加矩阵映射后，它仅被缩放了 $\\lambda$ 倍（即特征值）。这一重要性质构成了主成分分析（PCA）降维的数学基石，通过寻找最大特征值对应的特征向量来提取数据方差最大的主要方向。"
            },
            {
                "question": "在衡量向量长度与正则化惩罚时，L1 范数与 L2 范数（模长）的最本质计算差异在数学上是如何表示的？",
                "options": [
                    "L1 是元素绝对值之和，L2 是元素平方和的平方根",
                    "L1 是元素平方和的平方根，L2 是绝对值之和",
                    "L1 恒大于 L2 的十倍以上",
                    "L1 和 L2 的数学表征等价，只在偶数维度有区别"
                ],
                "answer": 0,
                "explanation": "数学上，一个 $D$ 维向量 $x$ 的 L1 范数定义为 $||x||_1 = \\sum_{i=1}^D |x_i|$；而其 L2 范数（欧氏距离）定义为 $||x||_2 = \\sqrt{\\sum_{i=1}^D x_i^2}$。在正则化中，L1 倾向于产生稀疏的特征权重，而 L2 倾向于让权重均匀地趋近于 0 但不为零。"
            }
        ],
        "slides": [
            {"title": "1. 线性代数：机器学习数据建模基石", "content": "在线性回归、主成分分析（PCA）以及神经网络计算中，所有的特征均被表示为高维空间向量；矩阵乘法则是特征线性组合的表达手段。所有的批次数据都以特征矩阵的形式馈入计算管道。"},
            {"title": "2. 向量点积与相似度计算", "content": "点积反映了两个方向夹角及模长的综合影响。余弦相似度公式：$\\cos\\theta = \\frac{a \\cdot b}{||a||_2 ||b||_2}$。通过点积消除向量模长影响得到的，广泛应用于分类判决、文本挖掘和多模态特征检索的相似度匹配。"},
            {"title": "3. 特征分解的几何直观", "content": "特征分解（Eigendecomposition）揭示了矩阵线性变换的拉伸主轴。特征向量就是这些轴线，它们在投影映射中承担了高维空间基底的转换任务。在协方差矩阵特征分解中，最大特征值对应的特征向量保留了最大的数据方差。"},
            {"title": "4. 矩阵运算与 GPU 并行计算优化", "content": "现代深度学习的效率高度依赖大矩阵乘法的并行算力优化。通过将运算表达为矩阵相乘，我们可以利用现代 GPU 的张量计算核心（Tensor Cores）进行超大规模的通用矩阵乘法（GEMM）运算，极大地缩短了前向与反向传播的耗时。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 线性代数核心算子纯 Python 实现 (验证矩阵乘法、转置与向量模长计算)
import math

def compute_dot_product(vec_a, vec_b):
    \"\"\"计算两个一维向量的点积\"\"\"
    if len(vec_a) != len(vec_b):
        raise ValueError("向量维度必须一致")
    return sum(a * b for a, b in zip(vec_a, vec_b))

def transpose_matrix(matrix):
    \"\"\"矩阵转置\"\"\"
    if not matrix or not matrix[0]:
        return []
    m, n = len(matrix), len(matrix[0])
    return [[matrix[i][j] for i in range(m)] for j in range(n)]

def multiply_matrices(matrix_a, matrix_b):
    \"\"\"
    矩阵乘法实现 A (m, n) * B (n, p) -> C (m, p)
    \"\"\"
    if not matrix_a or not matrix_b:
        return []
    m = len(matrix_a)
    n = len(matrix_a[0])
    p = len(matrix_b[0])
    
    if len(matrix_b) != n:
        raise ValueError("矩阵A的列数必须等于矩阵B的行数")
        
    c = [[0.0] * p for _ in range(m)]
    for i in range(m):
        for j in range(p):
            for k in range(n):
                c[i][j] += matrix_a[i][k] * matrix_b[k][j]
    return c

def normalize_vector(vector):
    \"\"\"对向量进行 L2 归一化，使其 L2 范数为 1.0\"\"\"
    squared_sum = sum(x ** 2 for x in vector)
    l2_norm = math.sqrt(squared_sum)
    if l2_norm == 0.0:
        return vector
    return [x / l2_norm for x in vector]

def test_linear_algebra_ops():
    # 测试点积
    v1 = [1.0, 2.0, 3.0]
    v2 = [4.0, 5.0, 6.0]
    # 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    assert math.isclose(compute_dot_product(v1, v2), 32.0)
    
    # 测试转置
    mat = [[1, 2], [3, 4], [5, 6]]  # (3, 2)
    t_mat = transpose_matrix(mat)  # (2, 3)
    assert t_mat == [[1, 3, 5], [2, 4, 6]]
    
    # 测试矩阵乘法
    a = [[1.0, 2.0], [3.0, 4.0]]  # (2, 2)
    b = [[5.0], [6.0]]             # (2, 1)
    res = multiply_matrices(a, b)  # (2, 1)
    # [1*5+2*6] = [17]
    # [3*5+4*6] = [39]
    assert len(res) == 2 and len(res[0]) == 1
    assert math.isclose(res[0][0], 17.0)
    assert math.isclose(res[1][0], 39.0)
    
    # 测试 L2 归一化
    v3 = [3.0, 4.0]
    norm_v3 = normalize_vector(v3)
    assert math.isclose(norm_v3[0], 0.6)
    assert math.isclose(norm_v3[1], 0.8)
    assert math.isclose(math.sqrt(sum(x**2 for x in norm_v3)), 1.0)
""",
        "videos": [
            {
                "bvid": "BV1ys411Y7S2",
                "title": "线性代数的本质 (3Blue1Brown 中文版配音)",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "3Blue1Brown",
                "play": "150.3万",
                "duration": "12:15",
                "recommend_reason": "这是公认的线性代数神级科普课程。通过直观的空间变换与几何直觉来阐述向量积与矩阵的本质，强烈推荐！"
            },
            {
                "bvid": "BV12X4y1A7t5",
                "title": "MIT 18.06 线性代数经典公开课 - 吉尔伯特·斯特朗",
                "pic": "https://i0.hdslb.com/bfs/archive/a15a004eb1202e88a0b0d394de8d5462cf6c63b4.jpg",
                "author": "MIT_OpenCourseWare",
                "play": "82.4万",
                "duration": "45:32",
                "recommend_reason": "Gilbert Strang 教授主讲的经典名课，其将特征分解、SVD 及其在数据分析中的数学原理抽丝剥茧，是 AI 从业者的底层内功秘籍。"
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
                    "与函数切面完全平年的正交法向量",
                    "指向全局极小值的方向"
                ],
                "answer": 1,
                "explanation": "多元函数的梯度向量 $\\nabla f(x)$ 是指各个自变量偏导数构成的向量。它指向函数增长（上升）最快的方向。因此，为了最小化损失函数，我们必须沿着梯度的**反方向**（负梯度方向 $-\\nabla f$）进行迭代参数更新，这就是梯度下降优化的本质。"
            },
            {
                "question": "在梯度下降法参数更新公式 w = w - α * dw 中，α 代表的核心超参数是？",
                "options": [
                    "正则化惩罚因子",
                    "学习率（Learning Rate），控制每次参数沿着负梯度方向更新的步长",
                    "冲量惯性系数",
                    "批次样本容量"
                ],
                "answer": 1,
                "explanation": "学习率 $\\alpha$ 决定了每次参数迭代中沿着负梯度方向移动的步长。学习率如果设置得过小，会导致模型收敛极其缓慢，甚至陷入鞍点；如果设置得过大，则参数会在最优点附近剧烈震荡甚至发散，无法正常收敛。"
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
                "explanation": "因为传统梯度下降只使用了一阶局部导数信息。在非凸曲面上，有许多局部极小值和马鞍形区域。在这些区域，函数的偏导数 $dw$ 趋于 0，导致参数更新趋于静止。使得模型极易停滞在并不理想的局部最优解中。"
            },
            {
                "question": "小批量随机梯度下降（Mini-batch SGD）与经典批量梯度下降（Batch GD）相比，最显著的核心优势是？",
                "options": [
                    "每一次更新的梯度方向都绝对平滑，无任何随机波动",
                    "计算效率更高，单次迭代计算开销与总样本数解耦，且由于引入适度随机噪声有助于跳出局部极小值和鞍点",
                    "可以保证每次迭代都计算全局准确损失",
                    "彻底消除了学习率对模型收敛的影响"
                ],
                "answer": 1,
                "explanation": "Batch GD 每次迭代需要扫描全部 $N$ 个样本，当数据集庞大时计算开销巨大。Mini-batch SGD 每次随机选取一个小批次（Batch Size, 如 64 或 128）来近似计算梯度。这不仅带来了极高的运算效率和利于 GPU 批处理，而且由批次近似带来的轻微随机扰动充当了“噪声扰动”，恰恰能够帮助权重摆脱微小的局部极小值或鞍点。"
            }
        ],
        "slides": [
            {"title": "1. 导数、偏导与梯度", "content": "一阶导数衡量单变量函数的局部变化斜率；偏导数衡量多元函数在某一独立特征维度上的局部倾斜；梯度则是各偏导数组成的向量，指示函数在当前空间增长最快的方向，记作 $\\nabla f(x) = \\left[ \\frac{\\partial f}{\\partial x_1}, \\frac{\\partial f}{\\partial x_2}, \\dots \\right]$。"},
            {"title": "2. 负梯度反向迭代更新", "content": "为使损失（Loss）逼近最小值，机器学习采用“顺着下坡走”的思想。参数更新公式为 $w_{t+1} = w_t - \\alpha \\nabla L(w_t)$。每一次更新方向均与局部梯度完全相反，促使损失不断降低。"},
            {"title": "3. 学习率控制策略", "content": "学习率 $\\alpha$ 是整个机器学习最关键的超参数之一。较小的学习率保证收敛但很慢，较大的学习率会导致震荡。工业界常用指数衰减（Exponential Decay）或者自适应优化器（如 Adam 的动量和二阶矩估计）来进行动态控制。"},
            {"title": "4. 非凸空间与局部最优阻碍", "content": "深度学习中的损失曲面通常是复杂的非凸表面。除了有无数的局部极小值点外，还存在大量鞍点。这就需要引入动量（Momentum）项，通过保留历史更新的速度（惯性）来帮助优化器滑过梯度为 0 的鞍点。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 梯度下降优化算法模拟测试 (一元凸函数与二元凸函数梯度寻优)
import math

def optimize_1d_convex_function(start_x, lr, epochs):
    \"\"\"
    模拟最小化一元函数 f(x) = (x - 3.0)^2 + 4.0
    它的真实导数 df/dx = 2 * (x - 3.0)，全局最小值在 x = 3.0 处
    \"\"\"
    x = start_x
    history = []
    for _ in range(epochs):
        df_dx = 2 * (x - 3.0)
        x = x - lr * df_dx
        history.append(x)
    return x, history

def optimize_2d_convex_function(start_x, start_y, lr, epochs):
    \"\"\"
    模拟最小化二元函数 f(x, y) = x^2 + 2 * y^2
    全局极小值在 (0.0, 0.0) 处
    偏导数：df/dx = 2 * x, df/dy = 4 * y
    \"\"\"
    x, y = start_x, start_y
    for _ in range(epochs):
        df_dx = 2.0 * x
        df_dy = 4.0 * y
        x = x - lr * df_dx
        y = y - lr * df_dy
    return x, y

def test_gradient_descent():
    # 测试一元函数梯度下降
    final_x, history = optimize_1d_convex_function(start_x=10.0, lr=0.1, epochs=60)
    print(f"1D Final x: {final_x}")
    # 经过60次迭代，应该极其逼近 3.0
    assert math.isclose(final_x, 3.0, abs_tol=1e-3)
    
    # 测试学习率过大导致的发散情况 (比如 lr = 1.1, 此时 df_dx 乘积会让新值更偏离)
    val_diverged, _ = optimize_1d_convex_function(start_x=4.0, lr=1.1, epochs=5)
    # 距离 3.0 应该越来越远
    assert abs(val_diverged - 3.0) > 1.0
    
    # 测试二元函数梯度下降
    final_x2, final_y2 = optimize_2d_convex_function(start_x=5.0, start_y=5.0, lr=0.1, epochs=100)
    print(f"2D Final coordinate: ({final_x2}, {final_y2})")
    assert math.isclose(final_x2, 0.0, abs_tol=1e-3)
    assert math.isclose(final_y2, 0.0, abs_tol=1e-3)
""",
        "videos": [
            {
                "bvid": "BV1J4411V7vM",
                "title": "梯度下降算法的数学推导与直观解析",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "同济大学公开课",
                "play": "15.6万",
                "duration": "18:32",
                "recommend_reason": "该视频使用通俗幽默的物理隐喻和多维 3D 动画解析了什么是偏导与梯度，是打牢优化算法理论的第一课。"
            },
            {
                "bvid": "BV19K4y1t7gX",
                "title": "自适应学习率优化器大对比: GD / SGD / Momentum / Adam",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "深度学习工程实战",
                "play": "9.8万",
                "duration": "25:40",
                "recommend_reason": "视频对比了各路优化算法在鞍点和复杂陡坡损失表面的行进表现，生动解说了 Momentum 和 Adam 的内在优越性。"
            }
        ]
    },
    "node3": {
        "quiz": [
            {
                "question": "在经典一元线性回归模型 y = w * x + b 中，均方误差（MSE）损失函数的核心作用是？",
                "options": [
                    "用来直接计算输入特征 x 的概率分布",
                    "计算模型预测输出 $\\hat{y}$ 与真实标签 $y$ 的平方差的均值，作为衡量预测偏差的代价标量",
                    "对参数 w 和 b 进行类型转换",
                    "这是一种降维手段"
                ],
                "answer": 1,
                "explanation": "均方误差公式为 $MSE = \\frac{1}{N}\\sum_{i=1}^N (y_i - \\hat{y}_i)^2$。它的核心目的是评估所有样本的平均预测精度。对其进行平方惩罚，一方面惩罚了更大的误差（即大误差样本会被急剧放大），另一方面保证了该误差代价函数处处连续可导，便于梯度下降求取极值。"
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
                "explanation": "最小二乘法的数学核心是通过对参数求偏导并置零，寻找一条直线使所有数据观测点到该拟合线的垂直残差的平方和达到绝对最小。这在矩阵维度低且 $X^TX$ 可逆时，可以通过解析式直接计算出最优的参数值。"
            },
            {
                "question": "在训练线性回归时，如果输入的特征 x 与真实标签 y 呈现完美的负线性相关，那么求出的斜率 w 的符号客观上必定为？",
                "options": [
                    "正号（+）",
                    "负号（-）",
                    "0",
                    "与学习率方向一致"
                ],
                "answer": 1,
                "explanation": "当特征 $x$ 与真实值 $y$ 为完美负相关时，说明随着 $x$ 增大，$y$ 会以固定的比例单调递减。在几何直观上表现为斜向下的拟合直线，因此其对应的权值（斜率参数）$w$ 必定是一个小于 0 的负值。"
            },
            {
                "question": "在线性回归的矩阵闭式解析公式 w = (X^T * X)^(-1) * X^T * y 中，若特征之间存在多重共线性（Multicollinearity），会导致什么严重的计算后果？",
                "options": [
                    "计算出的权重全变成 1.0",
                    "矩阵 X^T * X 不满秩，导致其不可逆，闭式解计算崩溃",
                    "训练过程会死循环",
                    "模型会自动变为逻辑回归分类器"
                ],
                "answer": 1,
                "explanation": "根据矩阵运算理论，闭式解析解（Normal Equation）公式中包含对 $X^T X$ 的求逆操作。如果特征之间高度相关（即多重共线性），这意味着矩阵的列向量几乎线性相关，从而导致矩阵 $X^T X$ 的行列式接近 0（不满秩）。在计算机中，这会导致求逆计算产生巨大的数值不稳定性甚至无法求逆。这也是引入 Ridge (L2) 正则化（将原本的 $X^T X$ 加上对角矩阵 $\\lambda I$ 使其必定可逆）的关键技术根源。"
            }
        ],
        "slides": [
            {"title": "1. 线性回归算法模型", "content": "线性回归旨在寻找输入变量与连续目标输出之间的线性关联。单维度特征公式表示为 $y = wx + b$，其核心是求解斜率（权重）$w$ 和截距（偏置）$b$。"},
            {"title": "2. 均方误差损失函数", "content": "MSE（Mean Squared Error）代价函数计算的是预测差值的平方平均。公式为 $L(w, b) = \\frac{1}{N}\\sum (wx_i + b - y_i)^2$。由于它是开口向上的二次凹凸曲面，拥有唯一的全局最小值，避免了局部最优解的困扰。"},
            {"title": "3. 最小二乘解析求导 (正规方程)", "content": "当特征维度不太高时，可通过对矩阵求导并令导数为 0 得到闭式解析解（Normal Equation）：$w = (X^T X)^{-1} X^T y$。这可以在一瞬间得到全局唯一的数学最优解，无需迭代循环。"},
            {"title": "4. 决定系数与回归指标评估", "content": "除了 MSE，评估回归模型优劣还会使用 MAE（平均绝对误差）以及重要的决定系数 $R^2$。$R^2$ 衡量了模型所能解释的数据方差占总方差的比例，越接近 1 表明拟合质量越高。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 最小二乘法与均方误差评估实战 (一元线性回归封闭解与 R^2 指标实现)
import math

def calculate_ols_coefficients(points):
    \"\"\"
    使用普通最小二乘法求解一元线性回归参数 w, b
    计算公式:
    w = cov(x, y) / var(x)
    b = mean(y) - w * mean(x)
    \"\"\"
    n = len(points)
    if n == 0:
        raise ValueError("输入点集不能为空")
        
    x_mean = sum(p[0] for p in points) / n
    y_mean = sum(p[1] for p in points) / n
    
    numerator = sum((p[0] - x_mean) * (p[1] - y_mean) for p in points)
    denominator = sum((p[0] - x_mean) ** 2 for p in points)
    
    if denominator == 0.0:
        raise ZeroDivisionError("样本特征的方差为0，无法求解拟合线")
        
    w = numerator / denominator
    b = y_mean - w * x_mean
    return w, b

def calculate_r_squared(points, w, b):
    \"\"\"
    计算决定系数 R^2
    R^2 = 1 - (残差平方和 / 总方差平方和)
    \"\"\"
    n = len(points)
    y_mean = sum(p[1] for p in points) / n
    
    ssr = sum((p[1] - (w * p[0] + b)) ** 2 for p in points)
    sst = sum((p[1] - y_mean) ** 2 for p in points)
    
    if sst == 0.0:
        return 1.0 if ssr == 0.0 else 0.0
    return 1.0 - (ssr / sst)

def test_ols_regression():
    # 测试用例 1: 完美线性相关数据 (y = 2.5 * x + 1.2)
    data1 = [(1.0, 3.7), (2.0, 6.2), (3.0, 8.7)]
    w1, b1 = calculate_ols_coefficients(data1)
    print(f"Model 1: w={w1}, b={b1}")
    assert math.isclose(w1, 2.5)
    assert math.isclose(b1, 1.2)
    
    # 完美相关的决定系数 R^2 应该恒等于 1.0
    r2_1 = calculate_r_squared(data1, w1, b1)
    assert math.isclose(r2_1, 1.0)
    
    # 测试用例 2: 略带噪声的数据
    data2 = [(1.0, 2.1), (2.0, 3.8), (3.0, 6.2)]
    w2, b2 = calculate_ols_coefficients(data2)
    print(f"Model 2: w={w2}, b={b2}")
    r2_2 = calculate_r_squared(data2, w2, b2)
    assert 0.90 < r2_2 < 1.0
""",
        "videos": [
            {
                "bvid": "BV1dK4y1P7v9",
                "title": "线性回归模型的原理解析与最小二乘法数学求解",
                "pic": "https://i1.hdslb.com/bfs/archive/8b8fa993d64aa9e37835537921354daee6b43103.jpg",
                "author": "微软亚洲研究院",
                "play": "10.1万",
                "duration": "24:12",
                "recommend_reason": "视频中由浅入深推导了最小二乘法中的一阶偏导方程组，揭示了参数代数解析解与矩阵代数表示的深层物理映射。"
            },
            {
                "bvid": "BV1fE411H7ph",
                "title": "吴恩达(Andrew Ng) 斯坦福机器学习公开课: 线性回归",
                "pic": "https://i0.hdslb.com/bfs/archive/a15a004eb1202e88a0b0d394de8d5462cf6c63b4.jpg",
                "author": "网易公开课",
                "play": "65.3万",
                "duration": "35:10",
                "recommend_reason": "Andrew Ng 教授的王牌课。详述了梯度下降法与 Normal Equation 解析法的核心权衡，极佳的直观讲授。"
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
                "explanation": "Sigmoid 激活函数的表达式为 $S(z) = \\frac{1}{1 + e^{-z}}$。它的几何图像为一条对称的 S 曲线，能够把无穷小到无穷大的连续实数值 $z$ 压缩并映射到开区间 $(0, 1)$。这正符合概率分布的范围，因此可以将 $S(z)$ 的数值解构为该样本属于正类的条件概率 $P(y=1|x)$。"
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
                "explanation": "二分类交叉熵损失的计算公式为 $L = -\\frac{1}{N}\\sum [y_i\\log\\hat{y}_i + (1-y_i)\\log(1-\\hat{y}_i)]$，它是通过对伯努利分布进行极大似然估计推导得出的。它相比于 MSE 的优势在于：当模型预测极其错误时（比如标签为 1，预测值几乎为 0），BCE 会施加趋向于无穷大的严厉惩罚；且在求导优化时，BCE 的导数导向极其简洁，消除了饱和区的梯度消失问题。"
            },
            {
                "question": "若已知逻辑回归计算出的激活输入 z = 0，经过 Sigmoid 激活函数处理后，预测该样本属于正类的概率值是？",
                "options": [
                    "0.0",
                    "0.5",
                    "1.0",
                    "无法确定，取决于初始偏置值"
                ],
                "answer": 1,
                "explanation": "由于 Sigmoid 公式为 $S(z) = 1 / (1 + e^{-z})$。当 $z=0$ 时，$e^0=1$，因此 $S(0) = 1 / (1+1) = 0.5$。在二分类中，如果预测阈值设为 0.5，这对应的决策边界临界点。"
            },
            {
                "question": "为什么逻辑回归（Logistic Regression）实质上是一个线性分类器，而不是非线性分类器？",
                "options": [
                    "因为它的损失函数是二项分布",
                    "因为它的决策边界由方程式 w^T * x + b = 0 决定，这个边界在特征空间中是一个超平面",
                    "因为它的权重参数不能使用梯度下降法更新",
                    "因为它无法处理多元输入特征"
                ],
                "answer": 1,
                "explanation": "逻辑回归对分类结果的判定依赖于预测概率与 0.5 的大小关系，等价于判断输入是否满足 $\\sigma(w^T x + b) \\ge 0.5$。这在数学上等价于要求 $w^T x + b \\ge 0$。因此，分隔正负样本的决策面就是线性方程 $w^T x + b = 0$ 构成的超平面。所以逻辑回归是经典的线性分类器。"
            }
        ],
        "slides": [
            {"title": "1. 逻辑回归：经典二分类法则", "content": "逻辑回归是广义线性模型。尽管名字带“回归”，但它实质是分类算法。它通过拟合一个特征的线性组合，并将其投影到概率分布空间中，最终在特征空间划定线性决策面。"},
            {"title": "2. Sigmoid 函数与其数学特征", "content": "Sigmoid 函数公式：$S(z) = \\frac{1}{1+e^{-z}}$。它具有出色的数学对称性，且在复合求导中其导数表达极简：$S'(z) = S(z)(1-S(z))$。这对抗神经网络反向传播的链式求导十分友好。"},
            {"title": "3. 交叉熵损失函数原理", "content": "若强行采用均方误差（MSE）来优化逻辑回归，损失函数关于权重的二阶偏导将不再是凸的，极易陷入局部最优；同时在预测接近 0 或 1 时会导致严重的“梯度消失”。采用二分类交叉熵（BCE）损失能够确保全局凸性。"},
            {"title": "4. 多分类扩展：Softmax 算子", "content": "当面对多分类（Multi-class）问题时，Sigmoid 函数将推广为 Softmax 函数。对于 $K$ 个分类输出，计算公式为 $P(y=k|x) = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$。它将所有类别的分数转换为概率分布，并且所有概率之和恒等于 1.0。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 逻辑回归激活机制与二分类交叉熵损失模拟
import math

def compute_sigmoid(z):
    \"\"\"计算元素 Sigmoid 映射\"\"\"
    if z >= 0.0:
        return 1.0 / (1.0 + math.exp(-z))
    else:
        exp_z = math.exp(z)
        return exp_z / (1.0 + exp_z)

def compute_binary_cross_entropy(y_true, y_pred_prob):
    \"\"\"
    计算单个样本的二分类交叉熵损失
    公式: L = - (y * log(p) + (1-y) * log(1-p))
    \"\"\"
    epsilon = 1e-15
    y_pred_prob = max(epsilon, min(1.0 - epsilon, y_pred_prob))
    return -(y_true * math.log(y_pred_prob) + (1.0 - y_true) * math.log(1.0 - y_pred_prob))

def predict_class(x_features, weights, bias, threshold=0.5):
    \"\"\"计算线性输出，施加激活，返回预测类别与条件概率\"\"\"
    if len(x_features) != len(weights):
        raise ValueError("输入维度与权重维度不匹配")
    z = sum(xi * wi for xi, wi in zip(x_features, weights)) + bias
    prob = compute_sigmoid(z)
    pred_cls = 1 if prob >= threshold else 0
    return pred_cls, prob

def test_logistic_regression():
    # 测试 sigmoid 临界点和极限值
    assert math.isclose(compute_sigmoid(0.0), 0.5)
    assert compute_sigmoid(100.0) > 0.9999
    assert compute_sigmoid(-100.0) < 0.0001
    
    # 测试单样本 BCE 损失
    loss_correct = compute_binary_cross_entropy(1.0, 0.999)
    loss_wrong = compute_binary_cross_entropy(1.0, 0.001)
    assert loss_correct < 0.01
    assert loss_wrong > 6.0
    
    # 测试预测决策边界判定
    weights = [2.0, -1.0]
    bias = -0.5
    cls, prob = predict_class([1.0, 0.5], weights, bias)
    assert cls == 1 and prob > 0.5
    
    cls, prob = predict_class([0.0, 1.0], weights, bias)
    assert cls == 0 and prob < 0.5
""",
        "videos": [
            {
                "bvid": "BV1hM4y197bA",
                "title": "从零构建机器学习：逻辑回归原理解析",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "AI研习社",
                "play": "13.4万",
                "duration": "28:15",
                "recommend_reason": "视频中演示了线性决策面被 sigmoid 函数平滑压缩映射的过程，非常通俗形象地解答了对数几率的本质。"
            },
            {
                "bvid": "BV1Wv411p7pD",
                "title": "吴恩达(Andrew Ng) 逻辑回归损失函数及其梯度计算",
                "pic": "https://i0.hdslb.com/bfs/archive/a15a004eb1202e88a0b0d394de8d5462cf6c63b4.jpg",
                "author": "网易公开课",
                "play": "42.1万",
                "duration": "22:15",
                "recommend_reason": "解析了为什么传统的平方误差（MSE）不能应用在二分类逻辑回归上，详细拆解了对数似然损失的求导精髓。"
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
                "explanation": "L1 正则化（Lasso）将参数向量的 L1 范数 $||w||_1 = \\sum_i |w_i|$ 作为惩罚附加在总损失中；而 L2 正则化（Ridge）使用权重平方和的一半 $\\frac{1}{2}||w||_2^2 = \\frac{1}{2}\\sum_i w_i^2$ 作为惩罚项。两者均通过限制权重值大小来防御过拟合。"
            },
            {
                "question": "关于 L1 正则化相比 L2 正则化，为什么更容易让特征权重产生稀疏性（Sparsity，即很多参数值直接缩减为绝对零）？",
                "options": [
                    "张量维度大小决定了稀疏度",
                    "从几何观点看，L1 惩罚项的等高线是一组带尖角的棱形折线，与损失等高线相交时，更容易落在权重坐标轴的尖角顶点上（即某些维度权重为 0）",
                    "L1 正则化使用了对数求导",
                    "因为 L1 会将训练集样本容量缩小"
                ],
                "answer": 1,
                "explanation": "在几何图像上，L1 范数 $||w||_1 = C$ 构成的约束边界是一个具有直角、棱角顶点的多面体（如二维坐标系中的菱形）。原目标损失等值线向外扩张时，极大概率最先切入菱形的“尖角”处。这些尖角正好位于坐标轴上，对应着某些权重的分量为零。因此，L1 天然具备特征选择与稀疏降噪机制。"
            },
            {
                "question": "在加入正则化项后，超参数 λ（正则化系数）的主要作用是调节什么平衡？",
                "options": [
                    "调节训练集 and 测试集数据数量的分配比例",
                    "平衡模型对训练数据的拟合能力与限制权重大小以防过拟合的关系",
                    "直接控制网络的梯度更新学习率",
                    "决定特征缩放的标准差大小"
                ],
                "answer": 1,
                "explanation": "根据正则化模型公式 $Loss_{total} = Loss_{data} + \\lambda \\cdot \\Omega(w)$。超参数 $\\lambda$ 控制对复杂模型的惩罚力度。较小的 $\\lambda$ 重视训练拟合度（可能导致过拟合）；较大的 $\\lambda$ 重视权重惩罚（强迫权重均化或归零，能防止过拟合，但若设置过大，会导致欠拟合）。"
            },
            {
                "question": "在利用 L2 正则化进行神经网络权重更新时，该技术通常被称为权重衰减（Weight Decay），这是由于？",
                "options": [
                    "每一次更新让偏置 bias 直接加 1",
                    "权重值在每次梯度更新时，都会先乘以一个小于 1.0 的系数，实现自然的指数衰减",
                    "网络会自动裁剪没有被激活的神经元",
                    "损失值在迭代中会无视梯度而减小"
                ],
                "answer": 1,
                "explanation": "将 L2 惩罚项 $\\frac{1}{2}\\lambda w^2$ 加入损失后，对 $w$ 的梯度变成了 $\\frac{\\partial Loss_{total}}{\\partial w} = \\frac{\\partial Loss_{data}}{\\partial w} + \\lambda w$。权重梯度更新公式为：$w \\leftarrow w - \\alpha (dw + \\lambda w) = (1 - \\alpha \\lambda)w - \\alpha dw$。由于 $(1 - \\alpha \\lambda) < 1.0$，意味着权重参数在自身沿着梯度修正前会被强行缩减为原来的某个比例，从而起到衰减效果。"
            }
        ],
        "slides": [
            {"title": "1. 机器学习过拟合的危害", "content": "过拟合（Overfitting）指模型在训练集上精度极高，但遇到全新测试集时表现极差。这说明模型强行记忆了训练数据中的随机扰动和噪声，缺乏良好的泛化（Generalization）能力。"},
            {"title": "2. L1 正则化与稀疏特征选择", "content": "L1 范数正则化（Lasso Regression）通过惩罚权重绝对值之和来限制解空间。在几何上，由于不可导的角点效应，它会促使很多不相干的特征权重直接缩减到绝对 0，从而实现内置的特征自动选择与精简。"},
            {"title": "3. L2 正则化与权重衰减 (Ridge)", "content": "L2 范数正则化（Ridge Regression）惩罚参数的平方和。它会使所有特征权重均匀地变得很小，减弱参数对单点样本波动的敏感性。在反向梯度更新中，这对应着“权重衰减”（Weight Decay）作用，使拟合曲面变得更平滑。"},
            {"title": "4. 正则化强度的交叉验证权衡", "content": "控制惩罚力度的超参数 $\\lambda$ 极难用解析法求解。在生产中，我们使用训练集训练参数，使用不参与训练的验证集（Validation Set），通过网格搜索（Grid Search）配合交叉验证，测算出能使验证误差最低的那个最佳的 $\\lambda$。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# L1/L2 正则化惩罚项与权重衰减计算仿真
import math

def compute_l1_loss(weights, alpha):
    \"\"\"计算 L1 惩罚值\"\"\"
    return alpha * sum(abs(w) for w in weights)

def compute_l2_loss(weights, lam):
    \"\"\"计算 L2 惩罚值\"\"\"
    return 0.5 * lam * sum(w ** 2 for w in weights)

def apply_weight_decay_step(w_val, gradient, alpha, lam):
    \"\"\"
    模拟包含 L2 正则化的权重衰减一阶梯度更新：
    w_new = (1.0 - alpha * lam) * w_old - alpha * gradient
    \"\"\"
    return (1.0 - alpha * lam) * w_val - alpha * gradient

def test_regularization_ops():
    w = [1.5, -2.0, 0.5]
    alpha_l1 = 0.1
    assert math.isclose(compute_l1_loss(w, alpha_l1), 0.4)
    
    lam_l2 = 0.2
    assert math.isclose(compute_l2_loss(w, lam_l2), 0.65)
    
    w_init = 2.0
    grad = 0.5
    learning_rate = 0.05
    reg_factor = 0.1
    # (1.0 - 0.05 * 0.1) * 2.0 - 0.05 * 0.5 = 0.995 * 2.0 - 0.025 = 1.965
    w_updated = apply_weight_decay_step(w_init, grad, learning_rate, reg_factor)
    assert math.isclose(w_updated, 1.965)
""",
        "videos": [
            {
                "bvid": "BV1oV411P7C8",
                "title": "奥卡姆剃刀原理：L1与L2正则化防止过拟合详解",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "李沐-动手学深度学习",
                "play": "35.2万",
                "duration": "30:45",
                "recommend_reason": "李沐老师亲授，通过在真实数据集上编写代码添加正则化的全过程，演示了过拟合与权重收缩的直观过程。"
            },
            {
                "bvid": "BV1T54y1q7W6",
                "title": "StatQuest 经典精讲: Lasso 与 Ridge 正则化的异同及精髓",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "StatQuest_Official",
                "play": "22.5万",
                "duration": "19:15",
                "recommend_reason": "视频从直观的损失约束环角度，清晰展示了为什么 L1 能够产生真正为 0 的系数，而 L2 仅产生极小的非零系数。"
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
                "explanation": "因为多层线性变换的连续级联在数学上依然只等价于一个单一的线性变换：$y = W_2(W_1 x + b_1) + b_2 = (W_2 W_1) x + (W_2 b_1 + b_2) = W_{new} x + b_{new}$。这意味着即使将网络堆叠至千层，如果没有非线性激活函数，其建模能力也和一个单层感知机完全等同。非线性激活函数是让神经网络逼近万能函数的基础。"
            },
            {
                "question": "对于深度学习目前最常用的 ReLU 激活函数 f(x) = max(0, x)，当输入为负数 x = -2.5 时，其函数输出为？",
                "options": [
                    "-2.5",
                    "0.0",
                    "1.0",
                    "NaN"
                ],
                "answer": 1,
                "explanation": "ReLU（Rectified Linear Unit）的数学定义是：当 $x \\le 0$ 时，输出为 0；当 $x > 0$ 时，输出为输入自身。故对于 $x = -2.5$，$\\max(0, -2.5) = 0.0$。ReLU 的这种简单性极大地缓解了反向传播中的梯度消失，并加速了运算。"
            },
            {
                "question": "假设一个单隐藏层神经网络，输入维度是 4，隐藏神经元个数是 8，输出层维度为 3。那么输入层到隐藏层权重矩阵 W1 的参数元素总数是？",
                "options": [
                    "12 个",
                    "32 个",
                    "24 个",
                    "96 个"
                ],
                "answer": 1,
                "explanation": "连接输入层（4维）与隐藏层（8个神经元）的权重矩阵 $W_1$ 的维度为 $(8 \\times 4)$ 或 $(4 \\times 8)$。因此，其所包含的独立连接参数的个数等于两层层维度的乘积：$4 \\times 8 = 32$ 个（这不包括每个隐藏层神经元对应的偏置参数）。"
            },
            {
                "question": "在全连接神经网络的前向计算中，矩阵表达形式 a = g(W * x + b) 中，偏置向量 b 的核心作用是什么？",
                "options": [
                    "彻底改变输出向量的维度",
                    "为线性空间变换提供平移能力，从而可以使拟合的超平面不必须经过原点",
                    "强制让权重参数归零",
                    "只为了在反向传播中减少计算复杂度"
                ],
                "answer": 1,
                "explanation": "在没有偏置项 $b$ 时，线性映射 $W x$ 决定了其对应的分界线（超平面）必然通过高维空间坐标原点。偏置项 $b$ 在代数和几何上提供了全局“平移”的功能，使得分割面能够随意根据数据分布移离原点，大大扩充了网络拟合各种平移模式的灵活度。"
            }
        ],
        "slides": [
            {"title": "1. 神经网络基本架构", "content": "神经网络借鉴了生物元突触结构。典型的多层前馈网络（MLP）包含输入层、隐藏层和输出层。隐藏层负责在高维抽象空间中进行特征的多级变换和解耦。"},
            {"title": "2. 激活函数与非线性表示", "content": "激活函数是人工神经元的核心元。如果没有非线性激活（ReLU, Sigmoid, Tanh），网络层级级联在代数上将退化为单线性回归。ReLU 函数具有计算快、梯度大、提供稀疏表征的优势。"},
            {"title": "3. 矩阵化前向计算公式", "content": "前向传播可以用矩阵乘法表达：$Z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$，接着 $a^{[l]} = g(Z^{[l]})$。现代高性能 GPU 硬件专门针对这种大规模并行点积乘法在物理架构上进行了极致的吞吐量优化。"},
            {"title": "4. 隐藏层维度与网络表达力", "content": "隐藏层中神经元的数量决定了网络在这一层的“特征宽度”，即网络能够拆分表征的信息维度。隐藏层神经元过少会导致特征瓶颈、欠拟合；过多则容易让网络发生过拟合。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 双层神经网络前向计算仿真模型 (纯 Python 矩阵运算与 ReLU/Sigmoid 激活)
import math

def relu_activation(x):
    \"\"\"ReLU 非线性激活函数\"\"\"
    return max(0.0, x)

def sigmoid_activation(z):
    \"\"\"Sigmoid 激活函数\"\"\"
    if z >= 0.0:
        return 1.0 / (1.0 + math.exp(-z))
    else:
        exp_z = math.exp(z)
        return exp_z / (1.0 + exp_z)

def run_forward_nn(x_inputs, weights_h, biases_h, weights_o, biases_o):
    \"\"\"
    双层前向网络模拟:
    输入层 (N) -> 隐藏层 (H) [使用 ReLU] -> 输出层 (M) [使用 Sigmoid]
    \"\"\"
    hidden_dim = len(weights_h)
    hidden_outputs = []
    for i in range(hidden_dim):
        z_i = sum(x * w for x, w in zip(x_inputs, weights_h[i])) + biases_h[i]
        hidden_outputs.append(relu_activation(z_i))
        
    output_dim = len(weights_o)
    final_outputs = []
    for j in range(output_dim):
        z_j = sum(h * w for h, w in zip(hidden_outputs, weights_o[j])) + biases_o[j]
        final_outputs.append(sigmoid_activation(z_j))
        
    return hidden_outputs, final_outputs

def test_neural_network_forward():
    inputs = [1.0, 2.0, -1.0]
    weights_hidden = [
        [0.5, -0.2, 1.0],
        [-1.0, 0.8, 0.0]
    ]
    biases_hidden = [0.1, -0.5]
    
    weights_output = [
        [0.6, -1.0]
    ]
    biases_output = [0.2]
    
    # 神经元 1 预激活: 0.5 - 0.4 - 1.0 + 0.1 = -0.8 -> ReLU = 0.0
    # 神经元 2 预激活: -1.0 + 1.6 + 0 - 0.5 = 0.1 -> ReLU = 0.1
    # 输出层预激活: 0.0 * 0.6 + 0.1 * (-1.0) + 0.2 = 0.1 -> Sigmoid = 0.524979
    h_out, o_out = run_forward_nn(inputs, weights_hidden, biases_hidden, weights_output, biases_output)
    
    assert math.isclose(h_out[0], 0.0)
    assert math.isclose(h_out[1], 0.1)
    assert math.isclose(o_out[0], 0.524979, abs_tol=1e-5)
""",
        "videos": [
            {
                "bvid": "BV1bx411M7y5",
                "title": "什么是神经网络？深度学习第一卷 (3Blue1Brown 中文版配音)",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "3Blue1Brown",
                "play": "180.1万",
                "duration": "18:41",
                "recommend_reason": "全球公认最精美、最直观的神经网络科普大作，利用三维高维映射可视化完美解密了神经元及全连接权重作用。"
            },
            {
                "bvid": "BV125411A72b",
                "title": "深度学习必修: 神经网络前向传播与反向传播图解",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "李沐-动手学深度学习",
                "play": "28.3万",
                "duration": "32:15",
                "recommend_reason": "视频中李沐老师从张量维度变换的角度，展示了多层前向计算在 GPU 底层如何进行高效的矩阵级并行动作。"
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
                "explanation": "反向传播的底层根基是微积分中的多元复合函数链式求导法则。对于前向网络中各计算节点组成的有向无环计算图，反向传播算法通过从损失端往回推算，将上一层的累计偏导（局部误差）与当前节点的局部偏导数进行级联相乘，从而高效算出损失关于网络中任何一个权重参数的精确梯度。"
            },
            {
                "question": "在构建前向与反向计算图时，对于一个乘法计算节点 z = w * x，已知当前反向传播传回的偏导数为 dL/dz。那么损失函数对参数 w 的梯度 dL/dw 计算公式为？",
                "options": [
                    "(dL/dz) * w",
                    "(dL/dz) * x",
                    "(dL/dz) * (w + x)",
                    "1.0"
                ],
                "answer": 1,
                "explanation": "由于乘法节点计算式为 $z = w \\cdot x$。对自变量 $w$ 求偏导，得到局部导数 $\\frac{\\partial z}{\\partial w} = x$。根据链式求导法则，损失对权重参数的最终偏导为 $\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w} = \\frac{\\partial L}{\\partial z} \\cdot x$。这意味着在反向更新时，乘法节点相当于一个梯度交换器，将传回的梯度乘以另一侧输入的值。"
            },
            {
                "question": "对于加法计算节点 z = x + y，其局部导数 dz/dx 的值是多少？",
                "options": [
                    "0",
                    "1.0",
                    "y 的值",
                    "由输入学习率决定"
                ],
                "answer": 1,
                "explanation": "对于加法公式 $z = x + y$，当我们对自变量 $x$ 求导时，将 $y$ 视作常数，结果恒为 $\\frac{\\partial z}{\\partial x} = 1.0$。这表明在反向传播中，加法节点扮演了“梯度分配器”的角色，将传回的梯度以 1.0 的系数原封不动地分发给所有输入支路。"
            },
            {
                "question": "在前向传播与反向传播中，对于 ReLU(x) 这一激活节点，其反向传播的偏导数传递规则是？",
                "options": [
                    "当输入为正数时，原封不动地传回上层梯度；当输入为负数时，传回梯度为 0",
                    "不论输入如何，一律乘以 0.5 后传回",
                    "正数输出 -1.0，负数输出 +1.0",
                    "ReLU 激活在反向求导时没有确定的解析形式，只能近似"
                ],
                "answer": 0,
                "explanation": "因为 ReLU 函数为 $f(x) = \\max(0, x)$。其导数为分段函数：当 $x > 0$ 时，其一阶导数恒为 1.0，故反向传播时偏导数 $\\frac{\\partial L}{\\partial x} = \\frac{\\partial L}{\\partial y} \\cdot 1 = \\frac{\\partial L}{\\partial y}$；当 $x < 0$ 时，导数恒为 0.0，故偏导直接被截断置零 $\\frac{\\partial L}{\\partial x} = 0$。"
            }
        ],
        "slides": [
            {"title": "1. 反向传播与计算图", "content": "计算图（Computational Graph）将神经网络的复杂代数嵌套拆解为算子节点（如加、乘、指数）和连线边（变量）。前向传播负责沿着图形算出预测值与损失；反向传播则专门在误差终点启动，逆向计算偏导流。"},
            {"title": "2. 链式法则的基本精髓", "content": "复合函数求偏导等价于各局部导数连乘。例如 $y = f(u), u = g(x)$，则 $\\frac{\\partial y}{\\partial x} = \\frac{\\partial y}{\\partial u} \\cdot \\frac{\\partial u}{\\partial x}$。在神经网络中，每个激活与权重层都是一个复合函数节点，误差通过链式法则级联返回。"},
            {"title": "3. 经典门控节点求导法则", "content": "加法节点是‘梯度分流器’（将上层梯度按 1:1 分发给下层所有分支）；乘法节点是‘梯度交叉交换器’（将梯度乘以相反分支的输入再流回）；最大值节点（如 ReLU 或 Max-Pooling）是‘梯度选择路由器’（仅将梯度流向在前向传播中最大的那个分支，其余支路梯度置 0）。"},
            {"title": "4. 梯度消失与梯度爆炸现象", "content": "如果神经网络极深，当反向传播链条较长时，连乘的局部导数中若包含大量小于 1.0 的项，梯度会呈指数级缩小至趋于 0，导致网络低层参数无法更新，即“梯度消失”问题。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 局部计算图前向与反向节点推演仿真 (模拟 z = w * x + b， loss = z^2)
import math

class MultiplyNode:
    \"\"\"乘法计算节点\"\"\"
    def __init__(self):
        self.w = None
        self.x = None

    def forward(self, w, x):
        self.w = w
        self.x = x
        return w * x

    def backward(self, dout):
        dw = dout * self.x
        dx = dout * self.w
        return dw, dx

class AddNode:
    \"\"\"加法计算节点\"\"\"
    def __init__(self):
        pass

    def forward(self, val_a, val_b):
        return val_a + val_b

    def backward(self, dout):
        da = dout * 1.0
        db = dout * 1.0
        return da, db

def run_graph_forward_and_backward(w_val, x_val, b_val):
    \"\"\"
    计算图管线模拟:
    z = w * x
    out = z + b
    loss = out ^ 2
    \"\"\"
    mul_node = MultiplyNode()
    add_node = AddNode()
    
    z = mul_node.forward(w_val, x_val)
    out = add_node.forward(z, b_val)
    loss = out ** 2
    
    dloss_dout = 2.0 * out
    dloss_dz, dloss_db = add_node.backward(dloss_dout)
    dloss_dw, dloss_dx = mul_node.backward(dloss_dz)
    
    return loss, {
        "dloss_dw": dloss_dw,
        "dloss_dx": dloss_dx,
        "dloss_db": dloss_db
    }

def test_backprop_computation_graph():
    w, x, b = 2.0, 3.0, 1.0
    # z = 6.0 -> out = 7.0 -> loss = 49.0
    # dloss_dout = 14.0 -> dloss_dz=14.0, dloss_db=14.0 -> dw=42.0, dx=28.0
    loss, grads = run_graph_forward_and_backward(w, x, b)
    
    assert loss == 49.0
    assert math.isclose(grads["dloss_dw"], 42.0)
    assert math.isclose(grads["dloss_dx"], 28.0)
    assert math.isclose(grads["dloss_db"], 14.0)
""",
        "videos": [
            {
                "bvid": "BV16x411M7t9",
                "title": "反向传播算法的数学原理与其链式法则推导",
                "pic": "https://i1.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "3Blue1Brown",
                "play": "110.2万",
                "duration": "14:10",
                "recommend_reason": "该科普视频利用极其精美的动态颜色流动图示了反向偏导在神经网络计算图的流过逻辑，完美揭示了链式法则。"
            },
            {
                "bvid": "BV1W3411r7Ju",
                "title": "Andrej Karpathy 经典精讲: 详解反向传播与微积分求导本质",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "Andrej_Karpathy",
                "play": "18.6万",
                "duration": "1:15:30",
                "recommend_reason": "特斯拉前 AI 负责人 Karpathy 手把手带你手写计算图求导，是深度神经网络反向传播细节讲解的黄金教科书。"
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
                "explanation": "测试集是绝对不参与模型训练和参数优化（调参）过程的。它的主要目的充当最终客观考卷，在模型所有开发环节结束后，给出一次性的公正成绩评估。以真实测试模型对前所未见的外部样本的实际泛化性能，规避因训练集或验证集特征泄漏产生的过高估计。"
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
                "explanation": "在训练数据集上误差微小而在独立测试集上误差剧烈扩大，是典型的模型过拟合表现。这意味着模型虽然完全匹配了训练集的每一个点，但却同时将样本集中的随机噪声与特例死记硬背了下来，没有掌握普遍普适的规律，故完全失去了对新进样本进行预测的泛化能力。"
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
                "explanation": "深度学习工业界通常将训练好的张量参数矩阵及计算结构导出为二进制序列化通用规范。常见的包括 Pickle 文件、PyTorch 自带的 `.pt` 格式、HDF5、以及极其利于跨平台高性能部署的 ONNX (Open Neural Network Exchange) 开放框架文件。部署时服务端通过反序列化即可一瞬间将复杂的权重装载入内存提供毫秒级前向推理。"
            },
            {
                "question": "当发现模型无论在训练集还是测试集上准确率都极低，说明模型遭遇了“欠拟合（Underfitting）”，以下哪项是最有针对性的改进策略？",
                "options": [
                    "减少神经网络隐藏层神经元的个数",
                    "增加更多的特征，或者增加神经网络的层数与宽度以提升模型的表征容量",
                    "强行增加 L1 正则化系数 lambda 从而极力缩小权重",
                    "随机抛弃 90% 以上的训练样本"
                ],
                "answer": 1,
                "explanation": "欠拟合指模型的函数表示能力弱，甚至无法拟合训练集的基本数据规律。解决方法有：提升模型的复杂度（增加层数、神经元数等）、挖掘和拼接更深维度的特征、减少限制权重的正则化系数等。从而给模型提供足够的自由度（Capacity）来学习数据中隐藏的趋势。"
            }
        ],
        "slides": [
            {"title": "1. 机器学习工程闭环流", "content": "典型工业工作流包括：数据清洗与特征缩放 -> 训练/验证/测试集严格分割 -> 搭建网络并反向传播调参 -> 正则化防过拟合验证 -> 批量参数序列化归档 -> 生产部署和预测漂移监控。"},
            {"title": "2. 数据集划分与信息泄漏防范", "content": "必须防止测试集或未来信息“泄漏”至训练阶段。原则是：测试集只做最后阶段的成绩打分，中途模型修正、参数选择应当依赖交叉验证在“验证集”上完成。"},
            {"title": "3. 模型的持久化与ONNX中转", "content": "为了解耦 Python 训练环境与多平台生产 serving 环境，工业上会利用 ONNX 进行模型格式统一。这使得在 PyTorch 训练出的模型能够快速导出并在 C++/iOS/安卓端无缝运行。"},
            {"title": "4. 敏捷部署与一键微服务化", "content": "现今模型 serving 主流是将推理引擎封装为轻量级 RESTful API 服务，使用诸如 FastAPI 等技术，或者 BentoML 等专业微服务框架。配合 Docker 容器打包，算法模型可以在生产服务器快速滚动上线、监控并发吞吐与内存负载。"}
        ],
        "code": """# -*- coding: utf-8 -*-
# 微型线性回归器闭环训练、预测与 JSON 权重序列化持久化部署
import math
import json

class MiniTrainableRegressor:
    \"\"\"
    微型一维线性回归器，支持小批量梯度下降训练，并具有内置的 JSON 序列化导出机制
    拟合方程：y = w * x + b
    \"\"\"
    def __init__(self):
        self.w = 0.0
        self.b = 0.0

    def fit(self, x_data, y_data, lr=0.01, epochs=100, batch_size=2):
        n = len(x_data)
        if n == 0:
            return
            
        for _ in range(epochs):
            for i in range(0, n, batch_size):
                batch_x = x_data[i:i+batch_size]
                batch_y = y_data[i:i+batch_size]
                m = len(batch_x)
                if m == 0:
                    continue
                    
                dw = 0.0
                db = 0.0
                for x, y in zip(batch_x, batch_y):
                    pred = self.w * x + self.b
                    # dMSE/dw = 2 * (y_pred - y) * x
                    dw += (2.0 / m) * (pred - y) * x
                    db += (2.0 / m) * (pred - y) * 1.0
                
                self.w -= lr * dw
                self.b -= lr * db

    def predict(self, x):
        return self.w * x + self.b

    def serialize_weights(self):
        \"\"\"将模型权重序列化为 JSON 字符串\"\"\"
        weights_dict = {
            "model_type": "MiniLinearRegressor",
            "weights": {
                "w": self.w,
                "b": self.b
            }
        }
        return json.dumps(weights_dict, indent=2)

    def deserialize_weights(self, json_str):
        \"\"\"从 JSON 字符串中加载已保存权重，恢复推理服务\"\"\"
        data = json.loads(json_str)
        if data.get("model_type") != "MiniLinearRegressor":
            raise ValueError("非本模型支持的序列化文件")
        self.w = data["weights"]["w"]
        self.b = data["weights"]["b"]

def test_ml_workflow_persistence():
    x_train = [1.0, 2.0, 3.0, 4.0, 5.0]
    y_train = [1.0, 4.0, 7.0, 10.0, 13.0]
    
    regressor = MiniTrainableRegressor()
    regressor.fit(x_train, y_train, lr=0.03, epochs=300, batch_size=2)
    
    print(f"Trained weight: w={regressor.w}, b={regressor.b}")
    assert math.isclose(regressor.w, 3.0, abs_tol=0.1)
    assert math.isclose(regressor.b, -2.0, abs_tol=0.2)
    
    exported_json = regressor.serialize_weights()
    
    deployed_serving_model = MiniTrainableRegressor()
    deployed_serving_model.deserialize_weights(exported_json)
    
    assert deployed_serving_model.w == regressor.w
    assert deployed_serving_model.b == regressor.b
    
    y_pred = deployed_serving_model.predict(10.0)
    assert math.isclose(y_pred, 28.0, abs_tol=0.5)
""",
        "videos": [
            {
                "bvid": "BV1o84y1p7aX",
                "title": "工业级机器学习模型训练与服务部署 (BentoML/ONNX)",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "微软AI实验室",
                "play": "12.3万",
                "duration": "42:15",
                "recommend_reason": "视频从工程实践维度出发，完整阐述了数据管道搭建、模型打包、基于 Docker 微服务发布及高并发 Serving 运维的核心要领。"
            },
            {
                "bvid": "BV1fU4y1A7xN",
                "title": "StatQuest: 机器学习流水线核心概念精讲",
                "pic": "https://i0.hdslb.com/bfs/archive/bfd5e1fe2aef1377eb86efc6095d2151c6df2153.jpg",
                "author": "StatQuest_Official",
                "play": "14.5万",
                "duration": "16:20",
                "recommend_reason": "用幽默的方式讲解了训练、验证、测试集防特征泄露的“数据壁垒”原则，是每个算法工程师必牢记的开发准则。"
            }
        ]
    }
}

def get_curated_resources_for_node(subject_cleaned: str, node_id: str):
    """
    Get curated quizzes, slides, code, and videos for the given subject and node_id.
    """
    node_id_clean = node_id.lower().strip()
    if "_extra" in node_id_clean:
        node_id_clean = node_id_clean.split("_")[0]
    elif "reinforce_" in node_id_clean:
        parts = node_id_clean.split("_")
        if len(parts) >= 2:
            node_id_clean = parts[1]

    if subject_cleaned == "machine_learning":
        return MACHINE_LEARNING_RESOURCES.get(node_id_clean)
    return None
