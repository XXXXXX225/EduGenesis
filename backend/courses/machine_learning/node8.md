# 经典回归预测模型实战部署与工程校验

本章节要求我们实现一个真实的房价预测回归模型。包含完整的数据读取、洗牌、网络前向/反向传播迭代训练，以及最终的自动化 Pytest 工程测试。

## 1. 回归模型训练流水线
使用纯 Python 实现一维回归预测（非 Numpy 依赖，以适应极端沙盒）：
* 初始化权重与偏置。
* 训练循环迭代：计算前向预测 -> 计算均方误差损失 -> 偏导数反向计算 -> 梯度下降更新权重。

## 2. 自动化单元测试校验 (Pytest)
在工程部署前，必须通过测试验证模型是否能够正常收敛（即随着训练迭代，损失函数值单调递减）：
```python
import pytest

def run_train_epoch(x_data, y_true, w, b, lr):
    loss = 0
    dw = 0
    db = 0
    m = len(x_data)
    for i in range(m):
        y_pred = w * x_data[i] + b
        loss += 0.5 * (y_pred - y_true[i])**2
        dw += (y_pred - y_true[i]) * x_data[i]
        db += (y_pred - y_true[i])
    w -= lr * (dw / m)
    b -= lr * (db / m)
    return w, b, loss / m

def test_model_convergence():
    x = [1, 2, 3, 4]
    y = [2, 4, 6, 8] # y = 2x
    w, b = 0.0, 0.0
    lr = 0.05
    
    # 训练 10 轮并测试损失值是否在减少
    prev_loss = float('inf')
    for _ in range(10):
        w, b, loss = run_train_epoch(x, y, w, b, lr)
        assert loss < prev_loss
        prev_loss = loss
```

## 3. 防御性监控要求
运行期监控应该检查最终的测试指标是否符合特定的精度阈值，并输出规范的训练损失变化曲线，方便学术监控智能体进行质量审计。
