# MEDIS Trained Models

This directory stores the trained ML models (.joblib files).

## 📦 Model Files

After running `backend/train_models.py`, this directory will contain:

- `logistic_regression.joblib` - Baseline classification model
- `random_forest.joblib` - Ensemble decision tree model
- `svm.joblib` - Support Vector Machine classifier
- `xgboost.joblib` - Gradient boosting model (usually the champion)
- `scaler.joblib` - Feature normalization transformer

## 🏆 Champion Model

The backend automatically selects the model with the highest **recall** score to minimize false negatives (missing actual diabetes cases).

## 📊 Model Performance Targets

For school project acceptance:

| Metric | Minimum Target |
|--------|----------------|
| Accuracy | > 70% |
| Precision | > 65% |
| **Recall** | **> 75%** ⚠️ |
| F1 Score | > 70% |

## 🔄 Retraining

To retrain models with new data:

```bash
cd ../backend
python train_models.py
```

Models will be automatically replaced in this directory.

## ⚠️ Git Warning

Model files are large (5-50 MB). Consider adding `*.joblib` to `.gitignore` and storing models separately.
