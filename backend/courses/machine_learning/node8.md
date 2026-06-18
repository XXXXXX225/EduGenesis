# 经典回归实战项目：房价预测与 API 部署

本章将通过一个完整的工程实战案例——房价预测，整合机器学习的数据预处理、特征工程、模型训练、效果验证以及最后的 API 部署，实现一个工程级的数据预测管道。

## 1. 数据预处理与特征工程
在建立模型前，必须对原始数据进行清洗和标准化，以保证算法的稳定性。
* **缺失值处理**：对于非空字段使用中位数或均值进行填充，或直接丢弃残缺严重的样本。
* **特征缩放（Feature Scaling）**：
  若特征间数值跨度过大（如“房间数 1~5”和“占地面积 100~5000”），会导致损失函数的梯度等高线呈现狭长的椭圆形，使梯度下降极其缓慢并产生震荡。
  * **标准化（Standardization）**：常用方法是将特征归一化为均值为 0，方差为 1 的分布：
    $$x_{\text{scaled}} = \frac{x - \mu}{\sigma}$$

## 2. 模型训练与 Scikit-Learn 代码实现
我们使用 Python 生态最核心的机器学习库 `scikit-learn` 来训练并持久化保存我们的 Ridge 线性回归模型。

```python
# -*- coding: utf-8 -*-
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score

# 1. 模拟房价数据集（特征：房间数、面积、绿化率、楼龄）
np.random.seed(42)
X = np.random.rand(200, 4) * [5, 200, 0.5, 30]  # 特征缩放尺度不同
# 真实公式带噪声：price = 50 * rooms + 3 * area - 100 * green + 15 * noise
y = X[:, 0] * 50 + X[:, 1] * 3 - X[:, 2] * 100 + np.random.randn(200) * 10

# 2. 划分数据集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. 特征缩放（记录 scaler 的参数以在预测时复用）
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. 训练带 L2 正则化的 Ridge 回归模型
model = Ridge(alpha=1.0)
model.fit(X_train_scaled, y_train)

# 5. 模型验证评估
y_pred = model.predict(X_test_scaled)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"验证集均方误差 MSE: {mse:.4f}")
print(f"判定系数 R2 Score: {r2:.4f}")

# 6. 持久化保存模型与缩放参数
joblib.dump(model, "housing_ridge_model.pkl")
joblib.dump(scaler, "housing_scaler.pkl")
```

## 3. FastAPI 线上服务部署
为了将训练好的模型提供给外部系统消费，我们可以使用极其轻量、高性能的 `FastAPI` 构建一个 RESTful API 预测微服务：

```python
# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="EduGenesis Housing Price Predictor")

# 启动时安全加载模型与转换器
try:
    model = joblib.load("housing_ridge_model.pkl")
    scaler = joblib.load("housing_scaler.pkl")
except Exception as e:
    raise RuntimeError(f"模型加载失败: {e}")

class HouseFeatures(BaseModel):
    rooms: float
    area: float
    green_rate: float
    age: float

@app.post("/predict")
def predict_price(features: HouseFeatures):
    try:
        # 1. 组装输入数据格式
        input_data = np.array([[
            features.rooms,
            features.area,
            features.green_rate,
            features.age
        ]])
        
        # 2. 必须应用训练时相同的标准化缩放
        input_scaled = scaler.transform(input_data)
        
        # 3. 运行模型前向推理
        prediction = model.predict(input_scaled)[0]
        
        # 4. 返回 JSON 结果
        return {
            "status": "success",
            "predicted_price_k": round(float(prediction), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推理执行出错: {e}")
```
运行此微服务后，外部系统即可通过发送一个 POST 请求至 `/predict` 端点，实时、高并发地获取房价预测服务。
