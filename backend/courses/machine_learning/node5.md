# Regularization: Preventing Overfitting

Regularization controls model complexity to improve generalization.

## Overfitting vs Underfitting
- Overfitting: low train error, high test error
- Underfitting: high error on both
- Bias-variance tradeoff

## L1 Regularization (Lasso)
- Adds |w| penalty: L = MSE + lambda*sum(|w_i|)
- Produces sparse solutions (feature selection)

## L2 Regularization (Ridge)
- Adds w^2 penalty: L = MSE + lambda*sum(w_i^2)
- Shrinks weights toward zero evenly

## Elastic Net
- Combines L1 + L2: L = MSE + lambda1*|w| + lambda2*w^2

## Cross-Validation
- k-fold: split data into k parts, train on k-1, test on 1
- Grid search for hyperparameter tuning

**Key Takeaway**: Always use cross-validation to tune regularization strength.
