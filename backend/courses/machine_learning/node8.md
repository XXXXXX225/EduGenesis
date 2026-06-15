# ML Project: Regression Pipeline

Build a complete ML pipeline from data to deployment.

## Pipeline Steps
1. Data loading and exploration
2. Preprocessing: scaling, encoding, imputation
3. Feature engineering
4. Model selection and training
5. Hyperparameter tuning
6. Evaluation and interpretation

## Using sklearn Pipeline
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', Ridge(alpha=1.0))
])
pipe.fit(X_train, y_train)
score = pipe.score(X_test, y_test)

## Best Practices
- Split data before any preprocessing
- Use cross-validation for reliable estimates
- Save your pipeline with joblib for reproducibility

**Key Takeaway**: A well-structured pipeline is more important than the latest model.
