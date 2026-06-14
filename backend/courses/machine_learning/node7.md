# 反向传播算法、链式求导与计算图参数迭代

反向传播（Backpropagation, BP）是神经网络能够自动从数据中学习规律的底层逻辑。它利用高等数学中的微积分链式求导法则，高效计算损失函数关于每个参数的偏导数。

## 1. 计算图与前向计算
前向计算可以将复杂的嵌套方程拆解为计算图中的各个节点节点：
例如 $z = w \cdot x + b$, $a = \sigma(z)$, $L = \frac{1}{2}(a - y)^2$。

## 2. 链式法则 (Chain Rule)
根据链式法则，如果我们要计算损失 $L$ 关于权重 $w$ 的偏导数：
$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial z} \cdot \frac{\partial z}{\partial w}$$
其中：
* $\frac{\partial L}{\partial a} = a - y$
* $\frac{\partial a}{\partial z} = \sigma'(z) = a(1 - a)$ （以 Sigmoid 为例）
* $\frac{\partial z}{\partial w} = x$
相乘即得到 $\frac{\partial L}{\partial w} = (a - y)a(1 - a)x$。

## 3. 参数更新
将计算得到的偏导数代入梯度更新方程：
$$w_{new} = w_{old} - \eta \frac{\partial L}{\partial w}$$
这样神经网络便完成了一步的自我修正。在编写 BP 时，为防止因连续相乘导致梯度趋近于 0，通常会使用 ReLU 激活函数来缓解**梯度消失（Gradient Vanishing）**。
