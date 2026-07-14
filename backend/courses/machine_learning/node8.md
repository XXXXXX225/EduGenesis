# Enterprise-Grade Machine Learning Pipeline: House Price Prediction and Microservice API Deployment

## 1. Introduction

Building a machine learning model is only the first step in a system's lifecycle. To deliver value, the model must be deployed as a reliable, scalable service. This chapter guides you through the process of building an enterprise-grade predictive pipeline: from data preprocessing and feature engineering to model training and microservice API deployment.

### 1.1 History and Origins
In the early days of corporate predictive analytics, models were built using tools like SAS or R, and their equations were translated manually into SQL queries or Java code for production use. This manual transition introduced bugs and slowed down updates. The rise of microservices in the 2010s, combined with tools like Scikit-Learn and FastAPI, enabled the development of standardized pipelines that deploy models directly in Python. This approach laid the groundwork for modern MLOps (Machine Learning Operations).

### 1.2 Mathematical Motivations in Preprocessing and Evaluation
Raw real-world data is rarely ready for model training. Features with vastly different scales disrupt gradient optimization, requiring standardization:

$$x_{\text{scaled}} = \frac{x - \mu}{\sigma}$$

In addition, target variables like housing prices or incomes often have right-skewed distributions. Training regression models on raw skewed data violates the homoscedasticity assumption of OLS, leading to prediction bias. We resolve this by applying a logarithmic transformation:

$$y_{\text{log}} = \ln(y + 1)$$

This maps the target to a normal distribution. After running predictions, we apply the inverse exponential mapping to return values to their original scale:

$$\hat{y} = \exp(\hat{y}_{\text{log}}) - 1$$

To measure model performance in production, we use standardized metrics like Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), and Adjusted $R^2$.

### 1.3 Real-World Relevance
An enterprise housing platform like Zillow or Redfin relies on low-latency microservices to estimate property values (e.g., Zestimate) in real time. If the valuation service has high latency, it degrades the user experience. By deploying models behind lightweight, asynchronous FastAPI microservices, platforms can handle high request volumes while serving predictions in milliseconds.

---

## 2. Mathematical Foundations & Proofs

This section presents the mathematical definitions and frameworks used in data preprocessing, feature engineering, and evaluation.

### 2.1 Outlier Rejection via the Interquartile Range (IQR) Method
Outliers distort least squares regression models because the quadratic loss function heavily penalizes large errors. We identify and remove outliers using the Interquartile Range (IQR) method.

Let $Q_1$ (25th percentile) and $Q_3$ (75th percentile) represent the boundaries of the middle 50% of the data. The Interquartile Range is:

$$\text{IQR} = Q_3 - Q_1$$

We define the lower and upper bounds for normal values as:

$$\text{Lower Bound} = Q_1 - 1.5 \times \text{IQR}$$

$$\text{Upper Bound} = Q_3 + 1.5 \times \text{IQR}$$

Any data point falling outside these bounds is classified as an outlier and removed from the training set.

---

### 2.2 Target Encoding for Categorical Features
For high-cardinality categorical variables (such as zip codes or city neighborhoods), one-hot encoding creates sparse, high-dimensional matrices that slow down training. **Target Encoding** resolves this by replacing each categorical value with the expected value of the target variable for that category.

For a category $c$:

$$\hat{S}_c = \mathbb{E}[y \mid x \in c]$$

To prevent overfitting for categories with very few samples, we apply smoothing by blending the category mean with the global target mean:

$$S_c = \lambda(n_c) \hat{S}_c + (1 - \lambda(n_c)) \mu_{\text{global}}$$

where $n_c$ is the number of samples in category $c$, and the smoothing factor $\lambda(n_c)$ is:

$$\lambda(n_c) = \frac{1}{1 + e^{-(n_c - k) / s}}$$

with hyper-parameters $k$ (minimum group size threshold) and $s$ (smoothing scale).

---

### 2.3 Mathematical Definitions of Regression Evaluation Metrics
* **Root Mean Squared Error (RMSE)**: Measures the standard deviation of residuals:
  $$\text{RMSE} = \sqrt{\frac{1}{m} \sum_{i=1}^m \left(y^{(i)} - \hat{y}^{(i)}\right)^2}$$
* **Mean Absolute Error (MAE)**: Measures average absolute residuals:
  $$\text{MAE} = \frac{1}{m} \sum_{i=1}^m \left|y^{(i)} - \hat{y}^{(i)}\right|$$
* **Adjusted $R^2$**: Evaluates the model's explanatory power, penalizing the addition of non-predictive features:
  $$R^2_{\text{adj}} = 1 - \left( 1 - R^2 \right) \frac{m - 1}{m - d - 1}$$
  where $m$ is the sample size, $d$ is the number of features, and $R^2$ is the standard coefficient of determination:
  $$R^2 = 1 - \frac{\sum (y^{(i)} - \hat{y}^{(i)})^2}{\sum (y^{(i)} - \bar{y})^2}$$

---

## 3. Geometrical and Computational Interpretations

The machine learning pipeline acts as a data transformation pipeline.

```
       [Raw Data Source] ---> [Outlier Rejection (IQR)] ---> [Feature Scaling (Z-Score)]
                                                                    |
                                                                    v
       [FastAPI Endpoint] <--- [Model Inference] <--- [Ridge Linear Regression Model]
```

* **Data Flow Pipeline**: Raw features enter the pipeline, where they are transformed into a normalized coordinate space. The trained model processes this transformed input, generating predictions that are then scaled back to represent actual values.
* **Microservice Topology**: The API server runs as an independent process. It loads the pre-trained model and scaling parameters into memory once at startup, allowing it to process incoming request payloads without disk or database access overhead.

---

## 4. Production Code Implementations

Below are the complete, production-ready Python implementations for both the model training pipeline and the FastAPI prediction microservice.

### 4.1 Training Pipeline (`train_pipeline.py`)

This script handles feature processing, outlier rejection, model training, evaluation, and saves the resulting model artifacts.

```python
# -*- coding: utf-8 -*-
"""
train_pipeline.py
-----------------
Trains a Ridge Regression model on housing data and saves pipeline artifacts.
"""
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# 1. Generate Synthetic housing dataset
def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    # Features: rooms, area (sqm), green_rate (0-1), age (years)
    rooms = np.random.randint(1, 6, size=num_samples)
    area = rooms * 35.0 + np.random.randn(num_samples) * 15.0 + 30.0
    green_rate = np.random.rand(num_samples) * 0.6
    age = np.random.randint(0, 50, size=num_samples)
    
    # Skewed target price (with random noise)
    price = (rooms * 50.0 + area * 3.5 - green_rate * 80.0 - age * 2.0 + 
             np.random.randn(num_samples) * 20.0 + 100.0)
    # Ensure prices are positive
    price = np.maximum(price, 10.0)
    
    # Inject synthetic outliers to test IQR
    price[0] = price[0] * 5.0
    price[1] = price[1] * 6.0
    
    df = pd.DataFrame({
        'rooms': rooms,
        'area': area,
        'green_rate': green_rate,
        'age': age,
        'price': price
    })
    return df

def train():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data()
    
    # 2. Outlier Rejection via IQR
    print("Applying IQR outlier rejection...")
    q1 = df['price'].quantile(0.25)
    q3 = df['price'].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    df_clean = df[(df['price'] >= lower_bound) & (df['price'] <= upper_bound)].copy()
    print(f"Removed {len(df) - len(df_clean)} outliers.")
    
    # Split features and target
    X = df_clean[['rooms', 'area', 'green_rate', 'age']].values
    y = df_clean['price'].values
    
    # Apply log transform to targets
    y_log = np.log1p(y)
    
    # 3. Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y_log, test_size=0.2, random_state=42)
    
    # 4. Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 5. Train Ridge Regression model
    print("Training Ridge model...")
    model = Ridge(alpha=1.0)
    model.fit(X_train_scaled, y_train)
    
    # 6. Evaluate model
    y_pred_log = model.predict(X_test_scaled)
    # Inverse log transform
    y_pred = np.expm1(y_pred_log)
    y_test_original = np.expm1(y_test)
    
    rmse = np.sqrt(mean_squared_error(y_test_original, y_pred))
    mae = mean_absolute_error(y_test_original, y_pred)
    r2 = r2_score(y_test_original, y_pred)
    
    # Adjusted R2 calculation
    m, d = X_test.shape
    adj_r2 = 1.0 - (1.0 - r2) * (m - 1) / (m - d - 1)
    
    print("\nModel Evaluation Metrics:")
    print(f"RMSE: {rmse:.4f}")
    print(f"MAE:  {mae:.4f}")
    print(f"R2:   {r2:.4f}")
    print(f"Adj R2: {adj_r2:.4f}")
    
    # 7. Save pipeline artifacts
    print("\nSaving pipeline artifacts...")
    joblib.dump(model, 'housing_ridge_model.pkl')
    joblib.dump(scaler, 'housing_scaler.pkl')
    print("Pipeline artifacts saved successfully.")

if __name__ == "__main__":
    train()
```

---

### 4.2 FastAPI Production microservice (`app.py`)

This script serves the model predictions via a RESTful API.

```python
# -*- coding: utf-8 -*-
"""
app.py
------
FastAPI microservice for real-time house price predictions.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(
    title="Housing Price Prediction Microservice",
    description="Serves predictions using a pre-trained Ridge Regression model.",
    version="1.0.0"
)

# Load pipeline artifacts at startup
try:
    model = joblib.load('housing_ridge_model.pkl')
    scaler = joblib.load('housing_scaler.pkl')
    print("Model artifacts loaded successfully.")
except Exception as e:
    raise RuntimeError(f"Failed to load model artifacts: {e}")


class HouseFeatures(BaseModel):
    rooms: int = Field(..., ge=1, le=10, description="Number of rooms")
    area: float = Field(..., ge=10.0, le=1000.0, description="Area in square meters")
    green_rate: float = Field(..., ge=0.0, le=1.0, description="Green rate of the area (0 to 1)")
    age: int = Field(..., ge=0, le=150, description="Age of the house in years")


class PredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Predicted house price in thousands of dollars")
    status: str = Field(default="success")


@app.post("/predict", response_model=PredictionResponse)
async def predict(features: HouseFeatures):
    """
    Predicts house prices based on input features.
    """
    try:
        # Convert inputs to NumPy array
        raw_features = np.array([[
            features.rooms,
            features.area,
            features.green_rate,
            features.age
        ]])
        
        # Apply scaling
        scaled_features = scaler.transform(raw_features)
        
        # Predict price (in log space)
        pred_log = model.predict(scaled_features)[0]
        
        # Convert prediction back to original scale
        pred_price = np.expm1(pred_log)
        
        # Ensure predicted price is positive
        final_price = max(float(pred_price), 0.0)
        
        return PredictionResponse(predicted_price=round(final_price, 2))
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference execution error: {e}"
        )


@app.get("/health")
def health_check():
    """
    Simple endpoint to monitor API health.
    """
    return {"status": "healthy"}
```

To run this FastAPI service, execute the following shell command:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 2
```

---

## 5. Engineering Challenges & Optimization Techniques

Deploying models to production environments introduces several engineering challenges.

### 5.1 Concurrency and Asynchronous Processing
* **FastAPI Workers**: FastAPI uses the ASGI standard, enabling it to run asynchronously. When serving model predictions, CPU-bound operations (like matrix multiplication) block the event loop. To resolve this, run uvicorn with multiple worker processes (e.g., `--workers 2-4`), allowing the server to utilize multiple CPU cores.
* **Request Batching**: For high-volume APIs, processing single predictions sequentially is inefficient. Implementing a request batcher that groups individual prediction requests into a single matrix multiplication improves GPU/CPU throughput.

### 5.2 Model Drift and Monitoring
* **Concept Drift**: Over time, real-world data distributions change (e.g., house price inflation), causing model accuracy to degrade.
* **Mitigation**: Log model inputs and outputs in production, and run periodic checks (e.g., Kolmogorov-Smirnov test) to compare production data distributions with training data baselines. When significant drift is detected, trigger the training pipeline to retrain the model.

---

## 6. Conclusion & Summary

Deploying predictive models requires building structured, automated pipelines. Preprocessing steps like outlier rejection and feature scaling ensure the training data is stable. Logarithmic transformations on target variables reduce skewness, while adjusted $R^2$ metrics provide robust evaluations. Deploying the final model behind an asynchronous FastAPI microservice enables reliable, low-latency predictions in production.
