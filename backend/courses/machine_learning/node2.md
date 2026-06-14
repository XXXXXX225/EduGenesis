# Calculus and Gradient Descent

Optimization via gradients is the engine of neural network training.

## Derivatives
- df/dx: instantaneous rate of change
- Partial derivatives for multivariate functions
- Gradient: vector of all partial derivatives

## Gradient Descent
- Update rule: w = w - lr * dL/dw
- Learning rate (lr): controls step size
- Batch vs Stochastic vs Mini-batch

## Chain Rule
- dL/dw = dL/dy * dy/dw
- Backpropagation applies chain rule through layers

## Common Pitfalls
- Vanishing gradients (sigmoid saturation)
- Exploding gradients
- Local minima vs saddle points

**Key Takeaway**: Gradient descent is remarkably effective when the learning rate is properly tuned.
