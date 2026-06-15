# Logistic Regression and Classification

Logistic regression bridges linear models to classification.

## Sigmoid Function
- sigma(z) = 1 / (1 + exp(-z))
- Maps any real number to (0, 1)
- Interpreted as probability

## Model
- P(y=1|x) = sigma(w*x + b)
- Decision boundary: sigma(z) = 0.5, i.e. z = 0

## Cross-Entropy Loss
- L = -[y*log(p) + (1-y)*log(1-p)]
- Penalizes confident wrong predictions heavily

## Multi-Class
- Softmax: P(class_i) = exp(z_i) / sum(exp(z_j))
- One-vs-Rest strategy

## Metrics
- Accuracy, Precision, Recall, F1-score
- Confusion matrix
- ROC curve and AUC

**Key Takeaway**: Accuracy alone is misleading for imbalanced datasets; use F1 or AUC.
