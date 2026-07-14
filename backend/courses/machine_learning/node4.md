# Logistic Regression Classification and Probabilistic Inference

## 1. Introduction

Despite its name, Logistic Regression is the baseline probabilistic classifier for binary classification problems. It bridges linear regression with classification by passing a linear combination of features through a non-linear mapping, generating outputs that represent probability distributions.

### 1.1 History and Origins
The logistic curve was first introduced by Pierre François Verhulst in the 1830s and 1840s to model population growth under resource constraints. The application of the logistic function to statistical modeling began in the mid-20th century. David Cox proposed the logistic regression model in 1958 as a robust alternative to probit regression, offering simpler mathematical properties and a direct connection to information theory.

### 1.2 Mathematical Motivations
In binary classification, the target variable $y$ belongs to the set $\{0, 1\}$. Fitting a standard linear regression model directly to binary targets (a approach known as the Linear Probability Model) is problematic because its predictions $\mathbf{w}^T \mathbf{x}$ are unbounded, falling outside the range $[0, 1]$.

To resolve this, we model the probability that a sample belongs to the positive class ($y = 1$) as a function of the log-odds (logit):

$$\ln\left( \frac{p}{1-p} \right) = \mathbf{w}^T \mathbf{x}$$

where $p = P(y=1 \mid \mathbf{x})$. Solving for $p$ yields the Sigmoid activation function:

$$p = \sigma(\mathbf{w}^T \mathbf{x}) = \frac{1}{1 + \exp(-\mathbf{w}^T \mathbf{x})}$$

This maps any real value $z = \mathbf{w}^T \mathbf{x} \in (-\infty, \infty)$ to a probability $p \in (0, 1)$.

### 1.3 Real-World Relevance
Logistic regression is the primary model in industries requiring transparent classification models. In banking, it predicts credit default probability based on credit history and income. In digital advertising, click-through rate (CTR) prediction models use it to estimate the likelihood of a user clicking an ad. In clinical trials, it helps determine risk factors associated with patient diagnoses.

---

## 2. Mathematical Foundations & Proofs

This section presents the mathematical derivations of logistic regression, focusing on the Sigmoid function, the likelihood function, gradient calculations, and convexity.

### 2.1 The Sigmoid Function and its Derivative
The logistic Sigmoid function is defined as:

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

#### Proof of the Derivative Form
We prove that the derivative of the Sigmoid function satisfies the relation:

$$\sigma'(z) = \sigma(z)(1 - \sigma(z))$$

Using the quotient rule:

$$\sigma'(z) = \frac{d}{dz} \left( (1 + e^{-z})^{-1} \right) = -1(1 + e^{-z})^{-2} \cdot (-e^{-z}) = \frac{e^{-z}}{(1 + e^{-z})^2}$$

Rewrite this expression:

$$\sigma'(z) = \left( \frac{1}{1 + e^{-z}} \right) \cdot \left( \frac{e^{-z}}{1 + e^{-z}} \right)$$

Note that:

$$\frac{e^{-z}}{1 + e^{-z}} = \frac{(1 + e^{-z}) - 1}{1 + e^{-z}} = 1 - \frac{1}{1 + e^{-z}} = 1 - \sigma(z)$$

Substituting this back gives:

$$\sigma'(z) = \sigma(z)(1 - \sigma(z))$$

This proves the relationship, simplifying the gradient calculations in optimization.

---

### 2.2 Likelihood Function and Binary Cross-Entropy Loss
Given a dataset $\{(\mathbf{x}^{(i)}, y^{(i)})\}_{i=1}^m$, we assume each target $y^{(i)} \in \{0, 1\}$ is a Bernoulli random variable:

$$P(y^{(i)} = 1 \mid \mathbf{x}^{(i)}; \mathbf{w}) = h_{\mathbf{w}}(\mathbf{x}^{(i)}) = \sigma(\mathbf{w}^T \mathbf{x}^{(i)})$$

$$P(y^{(i)} = 0 \mid \mathbf{x}^{(i)}; \mathbf{w}) = 1 - h_{\mathbf{w}}(\mathbf{x}^{(i)})$$

We can combine these into a single probability mass function:

$$p(y^{(i)} \mid \mathbf{x}^{(i)}; \mathbf{w}) = \left[ h_{\mathbf{w}}(\mathbf{x}^{(i)}) \right]^{y^{(i)}} \left[ 1 - h_{\mathbf{w}}(\mathbf{x}^{(i)}) \right]^{1-y^{(i)}}$$

Assuming independent samples, the likelihood of the parameters is:

$$L(\mathbf{w}) = \prod_{i=1}^m \left[ h_{\mathbf{w}}(\mathbf{x}^{(i)}) \right]^{y^{(i)}} \left[ 1 - h_{\mathbf{w}}(\mathbf{x}^{(i)}) \right]^{1-y^{(i)}}$$

To maximize this, we take the natural logarithm to get the log-likelihood:

$$\ell(\mathbf{w}) = \sum_{i=1}^m \left( y^{(i)} \ln h_{\mathbf{w}}(\mathbf{x}^{(i)}) + (1 - y^{(i)}) \ln(1 - h_{\mathbf{w}}(\mathbf{x}^{(i)})) \right)$$

In optimization, we minimize the negative log-likelihood normalized by the number of samples, defining the **Binary Cross-Entropy (BCE) Loss**:

$$J(\mathbf{w}) = -\frac{1}{m} \sum_{i=1}^m \left[ y^{(i)} \ln h_{\mathbf{w}}(\mathbf{x}^{(i)}) + (1 - y^{(i)}) \ln(1 - h_{\mathbf{w}}(\mathbf{x}^{(i)})) \right]$$

---

### 2.3 Gradient Derivation of Binary Cross-Entropy Loss
To minimize $J(\mathbf{w})$, we calculate the partial derivative with respect to each weight $w_j$. Let $z_i = \mathbf{w}^T \mathbf{x}^{(i)}$ and $a_i = h_{\mathbf{w}}(\mathbf{x}^{(i)}) = \sigma(z_i)$.
Using the chain rule:

$$\frac{\partial J}{\partial w_j} = \frac{\partial J}{\partial a_i} \cdot \frac{\partial a_i}{\partial z_i} \cdot \frac{\partial z_i}{\partial w_j}$$

Let's compute each component for a single sample $i$:

1. Derivative of the loss with respect to the activation $a_i$:
   $$\frac{\partial \text{Loss}_i}{\partial a_i} = -\left( \frac{y^{(i)}}{a_i} - \frac{1-y^{(i)}}{1-a_i} \right) = \frac{a_i - y^{(i)}}{a_i(1-a_i)}$$
2. Derivative of the activation $a_i$ with respect to the linear output $z_i$:
   $$\frac{\partial a_i}{\partial z_i} = a_i(1 - a_i)$$
3. Derivative of $z_i$ with respect to $w_j$:
   $$\frac{\partial z_i}{\partial w_j} = x_j^{(i)}$$

Multiplying these terms:

$$\frac{\partial \text{Loss}_i}{\partial w_j} = \frac{a_i - y^{(i)}}{a_i(1-a_i)} \cdot a_i(1 - a_i) \cdot x_j^{(i)} = \left( a_i - y^{(i)} \right) x_j^{(i)}$$

Averaging over all $m$ samples:

$$\frac{\partial J}{\partial w_j} = \frac{1}{m} \sum_{i=1}^m \left( h_{\mathbf{w}}(\mathbf{x}^{(i)}) - y^{(i)} \right) x_j^{(i)}$$

Expressing this in matrix notation:

$$\nabla_{\mathbf{w}} J(\mathbf{w}) = \frac{1}{m} \mathbf{X}^T \left( \sigma(\mathbf{X}\mathbf{w}) - \mathbf{y} \right)$$

This shares the same structural representation as the gradient of linear regression, despite the non-linear Sigmoid mapping.

---

### 2.4 Convexity Proof via the Hessian Matrix
We prove that the binary cross-entropy loss function is convex, meaning it has a unique global minimum and no local minima.

We take the second derivative of the loss with respect to the weights.
From the gradient vector:

$$\nabla_{\mathbf{w}} J(\mathbf{w}) = \frac{1}{m} \mathbf{X}^T (\mathbf{a} - \mathbf{y})$$

where $\mathbf{a} = \sigma(\mathbf{X}\mathbf{w}) \in \mathbb{R}^m$. The Hessian matrix $\mathbf{H}$ is the Jacobian of this gradient vector:

$$\mathbf{H} = \frac{\partial}{\partial \mathbf{w}} \left( \frac{1}{m} \mathbf{X}^T (\mathbf{a} - \mathbf{y}) \right) = \frac{1}{m} \mathbf{X}^T \frac{\partial \mathbf{a}}{\partial \mathbf{w}}$$

Using the chain rule, for each element $a_i$:

$$\frac{\partial a_i}{\partial \mathbf{w}} = a_i(1 - a_i) \mathbf{x}^{(i)T}$$

Thus:

$$\frac{\partial \mathbf{a}}{\partial \mathbf{w}} = \mathbf{S} \mathbf{X}$$

where $\mathbf{S} \in \mathbb{R}^{m \times m}$ is a diagonal matrix containing the values $a_i(1-a_i)$:

$$\mathbf{S} = \text{diag}\left( a_1(1-a_1), \dots, a_m(1-a_m) \right)$$

Substituting this back gives the Hessian matrix:

$$\mathbf{H} = \frac{1}{m} \mathbf{X}^T \mathbf{S} \mathbf{X}$$

#### Positive Semi-Definiteness
To show that $\mathbf{H}$ is positive semi-definite, we compute the quadratic form for any non-zero vector $\mathbf{v} \in \mathbb{R}^{d+1}$:

$$\mathbf{v}^T \mathbf{H} \mathbf{v} = \frac{1}{m} \mathbf{v}^T \mathbf{X}^T \mathbf{S} \mathbf{X} \mathbf{v} = \frac{1}{m} (\mathbf{X}\mathbf{v})^T \mathbf{S} (\mathbf{X}\mathbf{v})$$

Let $\mathbf{u} = \mathbf{X}\mathbf{v} \in \mathbb{R}^m$. Then:

$$\mathbf{v}^T \mathbf{H} \mathbf{v} = \frac{1}{m} \mathbf{u}^T \mathbf{S} \mathbf{u} = \frac{1}{m} \sum_{i=1}^m u_i^2 a_i(1-a_i)$$

Since $a_i = \sigma(z_i) \in (0, 1)$, we have $a_i(1-a_i) > 0$. Combined with $u_i^2 \geq 0$, it follows that:

$$\mathbf{v}^T \mathbf{H} \mathbf{v} \geq 0 \quad \forall \mathbf{v} \in \mathbb{R}^{d+1}$$

This proves that the Hessian is positive semi-definite everywhere, confirming the convexity of the loss function.

---

## 3. Geometrical and Computational Interpretations

The geometric division of the input space by logistic regression is defined by a hyperplane.

```
                   Decision Boundary of Logistic Regression
                   x2
                    ^          +  (y = 1)
                    |     +
                    |        +     / (Decision Boundary: w^T x = 0)
                    |  +          /
                    |            /      -  (y = 0)
                    |           /     -
                    |          /    -
                    +----------/-------------------> x1
```

* **The Decision Boundary**: The classification decision is made by comparing $P(y=1 \mid \mathbf{x}) \geq 0.5$, which is equivalent to $\mathbf{w}^T \mathbf{x} \geq 0$. The equation $\mathbf{w}^T \mathbf{x} = 0$ defines a flat **hyperplane** separating the input space.
* **Probability Mapping**: For any sample point $\mathbf{x}$, the distance to the decision boundary is proportional to $\mathbf{w}^T \mathbf{x}$. Points far from the boundary have high absolute values of $\mathbf{w}^T \mathbf{x}$, mapping to probabilities close to $0.0$ or $1.0$. Points near the boundary map to probabilities close to $0.5$.

---

## 4. Algorithmic Implementation from Scratch

The following Python class implements Logistic Regression with mini-batch gradient descent and classification evaluation metrics.

```python
# -*- coding: utf-8 -*-
import numpy as np

class LogisticRegressionScratch:
    """
    Logistic Regression binary classifier implemented from scratch using NumPy.
    """
    def __init__(self):
        self.w = None
        
    @staticmethod
    def _sigmoid(z: np.ndarray) -> np.ndarray:
        """
        Computes the Sigmoid function. Clipped to prevent numerical overflow.
        """
        z = np.clip(z, -500, 500)
        return 1.0 / (1.0 + np.exp(-z))
        
    def fit(self, X: np.ndarray, y: np.ndarray, lr: float = 0.05, epochs: int = 1000, batch_size: int = 32):
        """
        Trains the classifier using mini-batch gradient descent.
        """
        X = np.array(X, dtype=np.float64)
        y = np.array(y, dtype=np.float64).reshape(-1, 1)
        m, d = X.shape
        X_b = np.hstack([np.ones((m, 1)), X])
        
        # Xavier-style initialization
        self.w = np.random.randn(d + 1, 1) * np.sqrt(2.0 / (d + 1))
        
        for epoch in range(epochs):
            indices = np.random.permutation(m)
            X_shuffled = X_b[indices]
            y_shuffled = y[indices]
            
            for i in range(0, m, batch_size):
                xb = X_shuffled[i:i+batch_size]
                yb = y_shuffled[i:i+batch_size]
                
                # Forward pass: compute probabilities
                z = xb @ self.w
                a = self._sigmoid(z)
                
                # Compute gradient: (1/batch_size) * X^T * (a - y)
                gradient = (1.0 / len(xb)) * xb.T @ (a - yb)
                
                # Update weights
                self.w -= lr * gradient

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Predicts positive class probabilities.
        """
        X = np.array(X, dtype=np.float64)
        m = X.shape[0]
        X_b = np.hstack([np.ones((m, 1)), X])
        return self._sigmoid(X_b @ self.w)

    def predict(self, X: np.ndarray, threshold: float = 0.5) -> np.ndarray:
        """
        Predicts binary class labels.
        """
        probabilities = self.predict_proba(X)
        return (probabilities >= threshold).astype(np.int32)

    def compute_metrics(self, X: np.ndarray, y: np.ndarray, threshold: float = 0.5) -> dict:
        """
        Computes binary classification metrics from scratch.
        """
        y = np.array(y, dtype=np.int32).reshape(-1, 1)
        predictions = self.predict(X, threshold)
        
        tp = np.sum((predictions == 1) & (y == 1))
        fp = np.sum((predictions == 1) & (y == 0))
        fn = np.sum((predictions == 0) & (y == 1))
        tn = np.sum((predictions == 0) & (y == 0))
        
        accuracy = (tp + tn) / len(y)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        
        return {
            "Accuracy": accuracy,
            "Precision": precision,
            "Recall": recall,
            "F1-Score": f1
        }

# Validation execution
if __name__ == "__main__":
    np.random.seed(42)
    # Generate synthetic linearly separable classification dataset
    X = np.random.randn(200, 2)
    # y is 1 if 2*x1 - 3*x2 + noise > 0
    y = ((2 * X[:, 0] - 3 * X[:, 1] + np.random.randn(200) * 0.5) > 0).astype(np.int32)
    
    model = LogisticRegressionScratch()
    model.fit(X, y, lr=0.1, epochs=1000, batch_size=16)
    
    print("Logistic Regression Parameters:\n", model.w.flatten())
    metrics = model.compute_metrics(X, y)
    print("\nEvaluation Metrics:")
    for k, v in metrics.items():
        print(f"{k}: {v:.4f}")
```

---

## 5. Engineering Challenges & Optimization Techniques

Deploying and scaling logistic regression models involves several practical engineering details.

### 5.1 Numerical Stability of the Cross-Entropy Loss
In computing BCE loss:

$$J(\mathbf{w}) = -y \ln(a) - (1-y)\ln(1-a)$$

If the model predicts $a = 0$ for a true label $y = 1$, the term $\ln(a)$ evaluates to $\ln(0)$, which causes a numerical program error ($-\infty$). 
* **Mitigation**: We compute the loss using the linear output $z$ directly, utilizing the Log-Sum-Exp identity:
  $$\ln(a) = \ln\left( \frac{1}{1 + e^{-z}} \right) = -\ln(1 + e^{-z})$$
  $$\ln(1-a) = \ln\left( \frac{e^{-z}}{1 + e^{-z}} \right) = -z - \ln(1 + e^{-z})$$
  Substituting this simplifies the implementation and prevents float overflow errors.

### 5.2 Multiclass Extension: Softmax Regression
To classify across $K > 2$ classes, the hypothesis maps inputs to a probability vector using the **Softmax function**:

$$P(y = k \mid \mathbf{x}) = \frac{\exp(\mathbf{w}_k^T \mathbf{x})}{\sum_{j=1}^K \exp(\mathbf{w}_j^T \mathbf{x})}$$

The corresponding loss is the categorical cross-entropy loss, representing a generalized formulation of the binary model.

---

## 6. Conclusion & Summary

Logistic regression is a linear model that outputs probabilities using the Sigmoid mapping. The BCE loss function derived from maximum likelihood estimation is convex, guaranteeing convergence via gradient descent. Computing these parameters requires addressing numerical stability limits through clipped activation values and log-space computations. For multi-class environments, the model generalizes to Softmax regression, forming the structural output layers of modern neural network architectures.
