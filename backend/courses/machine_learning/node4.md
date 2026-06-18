# 逻辑回归分类法与决策边界

尽管名为“回归”，逻辑回归（Logistic Regression）实质上是一个经典的二分类（Binary Classification）线性模型。它通过概率函数将线性预测值映射在区间 $[0, 1]$ 内。

## 1. Sigmoid 激活函数与概率转换
在线性回归的基础上，为了将其输出转化为概率分布，需要引入非线性映射函数。
* **Sigmoid 函数**（对数几率函数）：定义为
  $$\sigma(z) = \frac{1}{1 + e^{-z}}$$
  * **数学特性**：当 $z \to \infty$ 时，$\sigma(z) \to 1$；当 $z \to -\infty$ 时，$\sigma(z) \to 0$。且当 $z=0$ 时，$\sigma(z) = 0.5$。它的导数具有极简的形式：$\sigma'(z) = \sigma(z)(1 - \sigma(z))$。
* **假设函数**：
  将线性回归的假设函数 $z = \theta^T x$ 代入 Sigmoid：
  $$h_\theta(x) = \sigma(\theta^T x) = \frac{1}{1 + e^{-\theta^T x}}$$
  此时，$h_\theta(x)$ 代表了在输入为 $x$ 时，样本被判定为正类（$y=1$）的条件概率：$P(y=1|x; \theta)$。

## 2. 决策边界与物理意义
* **判定阈值**：通常设定 0.5 作为判定分界线。
  * 当 $h_\theta(x) \geq 0.5$ 时，预测 $\hat{y} = 1$，这等价于线性回归输出 $\theta^T x \geq 0$。
  * 当 $h_\theta(x) < 0.5$ 时，预测 $\hat{y} = 0$，这等价于 $\theta^T x < 0$。
* **决策边界（Decision Boundary）**：
  方程 $\theta^T x = 0$ 在几何空间中定义了一个分割平面（或超平面），它将不同类别的样本物理上划分为两个区间。

## 3. 交叉熵损失函数（Cross-Entropy Loss）
由于引入了 Sigmoid，如果仍使用均方误差（MSE）作为损失函数，会导致优化函数 $J(\theta)$ 成为非凸函数（Non-convex），梯度下降极易陷入局部最优点。
* **交叉熵损失**（极大似然估计推导）：
  单个样本的损失项定义为：
  $$\text{Loss}(h_\theta(x), y) = -y \log(h_\theta(x)) - (1-y) \log(1 - h_\theta(x))$$
* **整体损失函数**：
  $$J(\theta) = -\frac{1}{m} \sum_{i=1}^m \left[ y^{(i)} \log(h_\theta(x^{(i)})) + (1 - y^{(i)}) \log(1 - h_\theta(x^{(i)})) \right]$$
  * **优势**：当真实标签 $y=1$ 而预测值 $h_\theta(x) \to 0$ 时，损失会趋于无穷大，对错误预测给以巨大的惩罚。该函数关于参数 $\theta$ 是凸函数，确保梯度下降能收敛到全局最优。
