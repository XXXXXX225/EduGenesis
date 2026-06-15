# Linear Regression

Linear regression is the simplest yet most interpretable ML model.

## Model
- y_pred = w0 + w1*x1 + w2*x2 + ... + wn*xn
- Vector form: y_pred = X * w

## Loss Function
- MSE: L = (1/n) * sum((y_pred - y_true)^2)
- RMSE = sqrt(MSE)
- MAE: mean absolute error

## Solution Methods
- Normal equation: w = (X^T*X)^(-1)*X^T*y
- Gradient descent: iterative optimization
- sklearn: LinearRegression()

## Evaluation Metrics
- R-squared: proportion of variance explained
- Adjusted R-squared for multiple features
- Residual plots for diagnostics

**Key Takeaway**: Always check residual plots for patterns before trusting your model.
