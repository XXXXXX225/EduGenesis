# 经典线性回归模型与最小二乘估计

线性回归是最基础、最直观的回归算法，用于预测连续性的数值目标。

## 1. 模型假定与线性方程
我们假设目标变量 $y$ 与特征向量 $\mathbf{x}$ 之间存在线性关系：
$$\hat{y} = w_1 x_1 + w_2 x_2 + \dots + w_d x_d + b = \mathbf{w}^T\mathbf{x} + b$$
我们的目标是学习到一组最优的权重 $\mathbf{w}$ 和截距 $b$。

## 2. 均方误差损失函数 (Mean Squared Error)
为了度量预测值与真实值之间的差距，采用均方误差作为代价函数：
$$L(\mathbf{w}, b) = \frac{1}{2m} \sum_{i=1}^m \left( \hat{y}^{(i)} - y^{(i)} \right)^2$$

## 3. 参数求解：最小二乘法 (Ordinary Least Squares)
可以通过对矩阵直接求导，得到解析解（闭式解）：
$$\mathbf{w}^* = (\mathbf{X}^T\mathbf{X})^{-1}\mathbf{X}^Ty$$
在实际工程中，如果矩阵 $\mathbf{X}^T\mathbf{X}$ 不可逆（如特征多于样本），会导致奇异矩阵错误。为此需要引入正则化（L2 正则）来保证矩阵的可逆性。
