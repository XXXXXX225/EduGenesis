# Regularization Theory, Bias-Variance Tradeoff, and Structural Risk Minimization

## 1. Introduction

A key challenge in machine learning is designing models that generalize well to unseen test data, rather than merely memorizing the training samples. Regularization encompasses a set of techniques designed to prevent overfitting by restricting model complexity, shifting the bias-variance tradeoff to minimize general prediction errors.

### 1.1 History and Origins
The mathematical foundations of regularization originate in numerical analysis. Andrey Tikhonov introduced Tikhonov regularization in 1963 to solve ill-posed linear inverse problems, which later became known as Ridge Regression in statistics. In 1996, Robert Tibshirani introduced the LASSO (Least Absolute Shrinkage and Selection Operator), presenting $L_1$ regularization. Lasso not only constrained parameter size but also performed feature selection by driving coefficients to zero. Zou and Hastie introduced the Elastic Net in 2005 to combine the benefits of both techniques, addressing correlated feature groups.

### 1.2 Mathematical Motivations
During training, we minimize the empirical risk (training loss). However, our true goal is minimizing structural risk—the expected loss over the complete data distribution. According to statistical learning theory, a model with too much capacity fits the random noise present in the training set, leading to high test-time generalization errors (overfitting).

Regularization implements **Structural Risk Minimization (SRM)** by adding a complexity penalty $\Omega(\mathbf{w})$ to the empirical loss function:

$$\min_{\mathbf{w}} J(\mathbf{w}) = L_{\text{data}}(\mathbf{w}) + \lambda \Omega(\mathbf{w})$$

where $\lambda > 0$ is a hyperparameter that balances the fit to training data against the parameter complexity constraint.

### 1.3 Real-World Relevance
Regularization is standard in training neural networks. Weight decay (which is mathematically equivalent to $L_2$ regularization) is a default parameter in optimizers like AdamW. In genomics and biomarker discovery, where the number of features $d$ (genes) greatly exceeds the number of samples $m$ (patients), Lasso regression identifies a sparse subset of predictive genes, reducing experimental validation costs.

---

## 2. Mathematical Foundations & Proofs

This section presents the mathematical derivations of the bias-variance decomposition and the Bayesian interpretations of regularization.

### 2.1 Bias-Variance Decomposition Derivation
We prove the formal decomposition of expected prediction error under the squared loss.

Let the true data-generating process be $y = f(\mathbf{x}) + \epsilon$, where the noise term $\epsilon$ has mean zero and variance $\sigma^2$:

$$\mathbb{E}[\epsilon] = 0, \quad \text{Var}(\epsilon) = \sigma^2$$

Let $\hat{f}(\mathbf{x}; \mathcal{D})$ be the model prediction trained on dataset $\mathcal{D}$. The expected squared error of a new observation $(\mathbf{x}_0, y_0)$ (where $y_0 = f(\mathbf{x}_0) + \epsilon$) across random training sets $\mathcal{D}$ is:

$$\mathbb{E}_{\mathcal{D}, \epsilon} \left[ \left( y_0 - \hat{f}(\mathbf{x}_0; \mathcal{D}) \right)^2 \right]$$

To simplify, let $f_0 = f(\mathbf{x}_0)$, $\hat{f}_0 = \hat{f}(\mathbf{x}_0; \mathcal{D})$, and $\bar{f}_0 = \mathbb{E}_{\mathcal{D}}[\hat{f}_0]$.
Expand the target terms:

$$\mathbb{E} \left[ (y_0 - \hat{f}_0)^2 \right] = \mathbb{E} \left[ (f_0 + \epsilon - \hat{f}_0)^2 \right] = \mathbb{E} \left[ ((f_0 - \hat{f}_0) + \epsilon)^2 \right]$$

$$\mathbb{E} \left[ (y_0 - \hat{f}_0)^2 \right] = \mathbb{E} \left[ (f_0 - \hat{f}_0)^2 \right] + 2\mathbb{E}[(f_0 - \hat{f}_0)\epsilon] + \mathbb{E}[\epsilon^2]$$

Since $\epsilon$ is independent of the dataset $\mathcal{D}$, we have:

$$\mathbb{E}[(f_0 - \hat{f}_0)\epsilon] = \mathbb{E}[f_0 - \hat{f}_0]\mathbb{E}[\epsilon] = 0$$

Also, $\mathbb{E}[\epsilon^2] = \text{Var}(\epsilon) + (\mathbb{E}[\epsilon])^2 = \sigma^2$. This simplifies the equation to:

$$\mathbb{E} \left[ (y_0 - \hat{f}_0)^2 \right] = \mathbb{E} \left[ (f_0 - \hat{f}_0)^2 \right] + \sigma^2$$

Now, we expand the first expectation term by adding and subtracting the mean prediction $\bar{f}_0$:

$$\mathbb{E} \left[ (f_0 - \hat{f}_0)^2 \right] = \mathbb{E} \left[ \left( (f_0 - \bar{f}_0) + (\bar{f}_0 - \hat{f}_0) \right)^2 \right]$$

$$\mathbb{E} \left[ (f_0 - \hat{f}_0)^2 \right] = \mathbb{E} \left[ (f_0 - \bar{f}_0)^2 \right] + 2\mathbb{E}[(f_0 - \bar{f}_0)(\bar{f}_0 - \hat{f}_0)] + \mathbb{E}[(\bar{f}_0 - \hat{f}_0)^2]$$

Since $f_0$ and $\bar{f}_0$ are deterministic constants relative to the expectation over $\mathcal{D}$:

1. First term:
   $$\mathbb{E} \left[ (f_0 - \bar{f}_0)^2 \right] = (f_0 - \bar{f}_0)^2 = \text{Bias}\left(\hat{f}_0\right)^2$$
2. Second term:
   $$2\mathbb{E}[(f_0 - \bar{f}_0)(\bar{f}_0 - \hat{f}_0)] = 2(f_0 - \bar{f}_0)\mathbb{E}[\bar{f}_0 - \hat{f}_0] = 2(f_0 - \bar{f}_0)(\bar{f}_0 - \bar{f}_0) = 0$$
3. Third term:
   $$\mathbb{E}[(\bar{f}_0 - \hat{f}_0)^2] = \text{Var}\left(\hat{f}_0\right)$$

Combining these three results yields the bias-variance decomposition:

$$\mathbb{E} \left[ (y_0 - \hat{f}(\mathbf{x}_0))^2 \right] = \text{Bias}\left[\hat{f}(\mathbf{x}_0)\right]^2 + \text{Var}\left[\hat{f}(\mathbf{x}_0)\right] + \sigma^2$$

where $\sigma^2$ represents the irreducible noise limit of the system.

---

### 2.2 L2 Regularization (Ridge) and Bayesian MAP Estimation
We prove that Ridge regression is mathematically equivalent to finding the Maximum A Posteriori (MAP) estimate under a Gaussian prior on the weights.

According to Bayes' Theorem, the posterior probability of the weights $\mathbf{w}$ given the data $\mathcal{D} = (\mathbf{X}, \mathbf{y})$ is:

$$p(\mathbf{w} \mid \mathbf{X}, \mathbf{y}) \propto p(\mathbf{y} \mid \mathbf{X}, \mathbf{w}) p(\mathbf{w})$$

Assume the data likelihood follows a Gaussian distribution as in OLS:

$$p(\mathbf{y} \mid \mathbf{X}, \mathbf{w}) = \left( \frac{1}{\sqrt{2\pi}\sigma} \right)^m \exp\left( -\frac{\|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2}{2\sigma^2} \right)$$

Now, assume a Gaussian prior on each weight parameter $w_j$ with mean zero and variance $\tau^2$:

$$p(\mathbf{w}) = \prod_{j=1}^d \frac{1}{\sqrt{2\pi}\tau} \exp\left( -\frac{w_j^2}{2\tau^2} \right) = \left( \frac{1}{\sqrt{2\pi}\tau} \right)^d \exp\left( -\frac{\|\mathbf{w}\|_2^2}{2\tau^2} \right)$$

The MAP estimate maximizes the log of the posterior probability:

$$\mathbf{w}_{\text{MAP}} = \arg\max_{\mathbf{w}} \ln p(\mathbf{w} \mid \mathbf{X}, \mathbf{y})$$

$$\ln p(\mathbf{w} \mid \mathbf{X}, \mathbf{y}) = -\frac{\|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2}{2\sigma^2} - \frac{\|\mathbf{w}\|_2^2}{2\tau^2} + C$$

where $C$ is a constant term independent of $\mathbf{w}$.
Maximizing this log posterior is equivalent to minimizing its negative:

$$\mathbf{w}_{\text{MAP}} = \arg\min_{\mathbf{w}} \left( \frac{\|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2}{2\sigma^2} + \frac{\|\mathbf{w}\|_2^2}{2\tau^2} \right)$$

Multiplying the expression by the constant factor $2\sigma^2$:

$$\mathbf{w}_{\text{MAP}} = \arg\min_{\mathbf{w}} \left( \|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2 + \frac{\sigma^2}{\tau^2} \|\mathbf{w}\|_2^2 \right)$$

Let $\lambda = \frac{\sigma^2}{\tau^2}$. The optimization problem becomes:

$$\min_{\mathbf{w}} \|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2 + \lambda \|\mathbf{w}\|_2^2$$

This matches the formulation of Ridge Regression, proving the equivalence.

---

### 2.3 L1 Regularization (Lasso) and Laplacian Prior
Lasso regression penalizes the sum of absolute weight values:

$$\min_{\mathbf{w}} \|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2 + \lambda \|\mathbf{w}\|_1$$

By repeating the MAP derivation with a Laplacian prior $p(\mathbf{w}) = \left(\frac{1}{2b}\right)^d \exp\left(-\frac{\|\mathbf{w}\|_1}{b}\right)$, we find that Lasso is equivalent to MAP estimation with $\lambda = \frac{2\sigma^2}{b}$.

#### Sparsity Proof Explanation
The absolute value penalty $|\mathbf{w}|$ is non-differentiable at $0$. Geometrically, the constraint region $\|\mathbf{w}\|_1 \leq t$ forms a diamond-shaped polytope with sharp corners along the coordinate axes. The contours of the quadratic data loss function expand outwards until they intersect this constraint region. In high dimensions, this intersection is highly likely to occur at a corner of the polytope, setting the corresponding parameter coordinate precisely to zero. This leads to a sparse parameter representation.

---

## 3. Geometrical and Computational Interpretations

The difference in sparsity between L1 and L2 regularization is explained by the geometry of their constraint boundaries.

```
       L1 Constraint (Lasso: Diamond)          L2 Constraint (Ridge: Circle)
                  w2                                      w2
                  ^                                       ^
                 / \     * Loss Contours                 .---.     * Loss Contours
                /   \  / \                             /     \   / \
               /     *    |                           |   *   | |   |
              /     / \  /                             \ / \ /   \ /
             +-----+-----+--> w1                        +---+-----> w1
              \   /                                      \ /
               \ /                                        '
```

* **L2 Circle Constraint**: The circular boundary of the $L_2$ norm constraint contains no corners. The loss contours intersect the circle at points where all coordinates are small but generally non-zero.
* **L1 Diamond Constraint**: The diamond-shaped boundary of the $L_1$ norm constraint has corners situated directly on the coordinate axes. The quadratic loss contours are likely to hit these corners first, forcing some weights $w_j$ to be exactly zero.

---

## 4. Algorithmic Implementation from Scratch

The following Python class implements Ridge Regression (using the closed-form equation) and Lasso Regression (using the Coordinate Descent optimization algorithm).

```python
# -*- coding: utf-8 -*-
import numpy as np

class RegularizedRegressionScratch:
    """
    Implements Ridge (L2) and Lasso (L1 via Coordinate Descent) regression models from scratch.
    """
    def __init__(self):
        self.w = None
        
    def fit_ridge(self, X: np.ndarray, y: np.ndarray, alpha: float = 1.0):
        """
        Fits a Ridge Regression model using the closed-form equation.
        w = (X^T X + alpha * I)^(-1) X^T y
        """
        X = np.array(X, dtype=np.float64)
        y = np.array(y, dtype=np.float64).reshape(-1, 1)
        m, d = X.shape
        X_b = np.hstack([np.ones((m, 1)), X])
        
        # Identity matrix for regularization (excluding the intercept)
        I = np.eye(d + 1)
        I[0, 0] = 0.0
        
        self.w = np.linalg.inv(X_b.T @ X_b + alpha * I) @ X_b.T @ y

    def fit_lasso(self, X: np.ndarray, y: np.ndarray, alpha: float = 1.0, max_iter: int = 1000, tol: float = 1e-6):
        """
        Fits a Lasso Regression model using the Coordinate Descent algorithm.
        """
        X = np.array(X, dtype=np.float64)
        y = np.array(y, dtype=np.float64).reshape(-1, 1)
        m, d = X.shape
        
        # Center target and scale features manually to handle coordinate descent without bias complications
        X_mean = np.mean(X, axis=0)
        X_std = np.std(X, axis=0)
        X_std[X_std == 0.0] = 1.0
        X_scaled = (X - X_mean) / X_std
        
        y_mean = np.mean(y)
        y_centered = y - y_mean
        
        # Initialize coefficients to zero
        theta = np.zeros((d, 1))
        
        for iteration in range(max_iter):
            theta_old = theta.copy()
            
            for j in range(d):
                # Calculate prediction excluding feature j
                X_minus_j = np.delete(X_scaled, j, axis=1)
                theta_minus_j = np.delete(theta, j, axis=0)
                r_j = y_centered - (X_minus_j @ theta_minus_j)
                
                # Compute the correlation value rho_j
                rho_j = np.dot(X_scaled[:, j], r_j.flatten())
                
                # Apply soft thresholding:
                if rho_j < -alpha / 2.0:
                    theta[j] = (rho_j + alpha / 2.0) / np.sum(X_scaled[:, j] ** 2)
                elif rho_j > alpha / 2.0:
                    theta[j] = (rho_j - alpha / 2.0) / np.sum(X_scaled[:, j] ** 2)
                else:
                    theta[j] = 0.0
                    
            # Check for convergence
            if np.linalg.norm(theta - theta_old) < tol:
                break
                
        # Transform coefficients back to unscaled space
        w_rest = theta.reshape(-1) / X_std
        w_0 = y_mean - np.dot(X_mean, w_rest)
        self.w = np.hstack([[w_0], w_rest]).reshape(-1, 1)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predicts outputs for given input features.
        """
        X = np.array(X, dtype=np.float64)
        m = X.shape[0]
        X_b = np.hstack([np.ones((m, 1)), X])
        return X_b @ self.w

# Validation execution
if __name__ == "__main__":
    np.random.seed(42)
    # Generate data: 10 features, but only 2 are useful
    X = np.random.randn(100, 10)
    y = 3.0 * X[:, 0] - 2.0 * X[:, 1] + np.random.randn(100) * 0.5
    
    model_ridge = RegularizedRegressionScratch()
    model_ridge.fit_ridge(X, y, alpha=5.0)
    print("Ridge Parameters (intercept + 10 features):\n", model_ridge.w.flatten())
    
    model_lasso = RegularizedRegressionScratch()
    model_lasso.fit_lasso(X, y, alpha=10.0, max_iter=2000)
    print("\nLasso Parameters (note coefficients close or equal to 0.0):\n", model_lasso.w.flatten())
```

---

## 5. Engineering Challenges & Optimization Techniques

Using regularization effectively requires addressing several engineering details.

### 5.1 The Crucial Role of Feature Scaling
Regularization penalties apply uniform constraints directly to parameter values. If features have different scales, their corresponding parameter values will also differ in scale.
* **Problem**: The penalty term $\sum w_j^2$ will disproportionately affect features with small numerical values (which require larger weights to make an impact).
* **Solution**: Features must be scaled (standardized to mean 0, variance 1) before training to ensure the regularization constraint is applied equally.

### 5.2 Model Selection and Cross-Validation
Choosing the regularization parameter $\lambda$ is a model selection task:
* **Grid Search**: Evaluating a range of values (e.g., $[10^{-4}, 10^{-3}, \dots, 10^2]$) using $k$-fold cross-validation.
* **Elastic Net Choice**: Elastic Net combines both penalties:
  $$\Omega(\mathbf{w}) = \rho \|\mathbf{w}\|_1 + \frac{1-\rho}{2} \|\mathbf{w}\|_2^2$$
  The parameter $\rho$ controls the balance between $L_1$-induced sparsity and $L_2$-induced smoothing.

---

## 6. Conclusion & Summary

Regularization controls model overfitting by penalizing parameters in the loss function. Bias-variance decomposition proves that we can trade a small increase in bias for a larger reduction in model variance to improve generalization. From a Bayesian perspective, Ridge and Lasso correspond to MAP estimation under Gaussian and Laplacian priors, respectively. Implementing these algorithms requires scaling input features to ensure constraints are applied uniformly across all dimensions.
