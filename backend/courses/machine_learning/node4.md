# 逻辑回归分类法与二分类交叉熵损失

逻辑回归（Logistic Regression）名字虽带“回归”，但它实际上是一个分类算法，专门解决二分类问题。

## 1. Sigmoid 激活函数
线性回归预测的输出是 $-\infty$ 到 $+\infty$。为了将其映射为概率值（即 $[0, 1]$ 之间），我们引入 Sigmoid 激活函数：
$$\sigma(z) = \frac{1}{1 + e^{-z}}$$
若输入为 $z = \mathbf{w}^T\mathbf{x} + b$，则预测类别为 1 的概率为 $\hat{y} = \sigma(z)$。

## 2. 交叉熵损失函数 (Cross Entropy Loss)
逻辑回归不使用均方误差，因为其非凸性容易导致优化算法陷入差的局部解。二分类的交叉熵损失函数定义为：
$$L(\mathbf{w}, b) = -\frac{1}{m} \sum_{i=1}^m \left[ y^{(i)} \log(\hat{y}^{(i)}) + (1 - y^{(i)}) \log(1 - \hat{y}^{(i)}) \right]$$

## 3. 分类判定边界
通常当 $\hat{y} \ge 0.5$ 时判断为类别 1；当 $\hat{y} < 0.5$ 时判断为类别 0。
可以通过调节阈值（如设置为 0.7）来过滤假阳性（提高 Precision）。
