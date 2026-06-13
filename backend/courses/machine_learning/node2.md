# 微积分理论、偏导数与梯度下降优化算法

微积分是衡量“变化”的数学。在机器学习中，我们利用偏导数和梯度来引导模型参数朝着最优化的方向演进。

## 1. 偏导数 (Partial Derivative) 与梯度 (Gradient)
* **导数**：表示函数在单变量下的变化率。
* **偏导数**：高维函数在某一个变量轴向上的变化速率。
* **梯度**：由所有自变量偏导数构成的向量。它指向函数**增长最快**的方向。
  $$\nabla f(\mathbf{x}) = \left[ \frac{\partial f}{\partial x_1}, \frac{\partial f}{\partial x_2}, \dots, \frac{\partial f}{\partial x_n} \right]^T$$

## 2. 梯度下降 (Gradient Descent)
为了最小化损失函数（Loss Function），我们需要沿着梯度的**相反方向**更新模型参数：
$$\mathbf{\theta}_{new} = \mathbf{\theta}_{old} - \eta \nabla L(\mathbf{\theta})$$
其中 $\eta$（Eta）表示学习率（Learning Rate），控制参数更新的步长。

## 3. 学习率的影响与调试
* **学习率过大**：会导致参数在谷底两边剧烈震荡甚至发散，无法收敛。
* **学习率过小**：会导致模型收敛速度极慢，且容易陷入局部的极小值点（鞍点）。
* **防御性编码**：在编写梯度下降训练循环时，如果 Loss 突然变为 `NaN`（Not a Number），通常说明梯度爆炸或学习率过大，需要限制梯度阈值。
