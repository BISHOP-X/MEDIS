# MEDIS Machine Learning Pipeline

This directory contains the machine learning models and training pipeline for the Medical Early Diabetes Insight System (MEDIS).

## 📊 Dataset

We use the **Pima Indians Diabetes Dataset**, a well-known benchmark dataset for diabetes prediction:

| Feature | Description |
|---------|-------------|
| Pregnancies | Number of times pregnant |
| Glucose | Plasma glucose concentration (2hr oral glucose tolerance test) |
| BloodPressure | Diastolic blood pressure (mm Hg) |
| SkinThickness | Triceps skin fold thickness (mm) |
| Insulin | 2-Hour serum insulin (mu U/ml) |
| BMI | Body mass index (weight in kg/(height in m)^2) |
| DiabetesPedigreeFunction | Diabetes pedigree function (genetic factor) |
| Age | Age in years |
| Outcome | Class variable (0 = No diabetes, 1 = Diabetes) |

## 🤖 Models Trained

| Model | Description | Use Case |
|-------|-------------|----------|
| **Logistic Regression** | Linear classifier, highly interpretable | Baseline model, feature importance analysis |
| **Random Forest** | Ensemble of decision trees | Robust predictions, handles non-linear relationships |
| **Support Vector Machine (SVM)** | Kernel-based classifier | Complex decision boundaries |
| **XGBoost** | Gradient boosting algorithm | State-of-the-art accuracy |

## 📁 Directory Structure

```
ml/
├── train_models.py        # Main training script
├── predict.py             # Prediction module with SHAP explainability
├── api.py                 # FastAPI server for REST API
├── requirements.txt       # Python dependencies
├── model_metrics.json     # Evaluation metrics for all models
├── README.md              # This file
├── notebooks/             # Jupyter notebooks for analysis
│   └── MEDIS_Model_Training_Analysis.ipynb
└── saved_models/          # Trained model files
    ├── logistic_regression.joblib
    ├── random_forest.joblib
    ├── support_vector_machine.joblib
    ├── xgboost.joblib
    └── scaler.joblib      # Feature scaler
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ml
pip install -r requirements.txt
```

### 2. Train Models

```bash
python train_models.py
```

### 3. Run API Server

```bash
# From the ml/ directory
uvicorn api:app --reload --port 8000

# API will be available at:
# - http://localhost:8000/docs (Swagger UI)
# - http://localhost:8000/predict (POST endpoint)
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/models` | List available models |
| GET | `/metrics` | Model performance metrics |
| POST | `/predict` | Make prediction with SHAP explainability |
| GET | `/feature-info` | Get feature descriptions and ranges |
| GET | `/docs` | Interactive API documentation |

### Example Prediction Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "bmi": 28.5,
    "glucose": 130,
    "blood_pressure": 80,
    "insulin": 150,
    "skin_thickness": 30,
    "pregnancies": 2,
    "diabetes_pedigree": 0.5
  }'
```

### Example Response

```json
{
  "prediction": {
    "class": 1,
    "label": "Diabetic",
    "probability": 0.735,
    "probability_percentage": 73.5
  },
  "risk": {
    "category": "high",
    "label": "High Risk",
    "color": "#ef4444",
    "description": "Multiple risk factors suggest elevated diabetes risk.",
    "action": "We strongly recommend consulting a healthcare professional."
  },
  "explainability": {
    "shap": {
      "values": [0.02, 0.15, -0.03, 0.08, 0.12, -0.05, 0.04, 0.09],
      "feature_names": ["Pregnancies", "Glucose", "BloodPressure", ...],
      "contributions": [
        {"feature": "Glucose", "shap_value": 0.15, "impact": "increases", ...},
        ...
      ]
    },
    "top_factors": [...]
  },
  "recommendations": [
    {"title": "Monitor Blood Sugar", "description": "...", "icon": "🩸", "priority": "high"},
    ...
  ]
}
```

## 📈 Model Performance

Based on our training run:

| Model | Accuracy | AUC-ROC | Precision | Recall | F1 Score |
|-------|----------|---------|-----------|--------|----------|
| Logistic Regression | 64.7% | 81.3% | 60.0% | 23.1% | 33.3% |
| **Random Forest** | **79.4%** | **85.4%** | 71.4% | 76.9% | 74.1% |
| SVM | 79.4% | 82.4% | 71.4% | 76.9% | 74.1% |
| XGBoost | 79.4% | 84.6% | 71.4% | 76.9% | 74.1% |

**Best Model**: Random Forest with AUC-ROC of 85.4%

## 🔑 Key Feature Importances (Random Forest)

1. **Glucose** (26.9%) - Most important predictor
2. **Age** (19.0%) - Second most important
3. **BMI** (16.0%) - Body mass index
4. **BloodPressure** (9.5%)
5. **SkinThickness** (9.0%)
6. **DiabetesPedigreeFunction** (7.4%)
7. **Pregnancies** (6.6%)
8. **Insulin** (5.6%)

## 🔬 Technical Details

### Preprocessing Pipeline
1. **Missing Value Handling**: Zeros in Glucose, BloodPressure, SkinThickness, Insulin, BMI are replaced with median values
2. **Feature Scaling**: StandardScaler (zero mean, unit variance)
3. **Train/Test Split**: 80/20 with stratification

### Hyperparameter Tuning
- Method: GridSearchCV with 5-fold cross-validation
- Scoring: ROC-AUC (Area Under the Curve)
- Best parameters saved in `model_metrics.json`

## 📦 Using Trained Models

```python
import joblib
import numpy as np

# Load model and scaler
model = joblib.load('saved_models/random_forest.joblib')
scaler = joblib.load('saved_models/scaler.joblib')

# Example patient data
patient_data = np.array([[
    2,      # Pregnancies
    130,    # Glucose
    80,     # BloodPressure
    25,     # SkinThickness
    120,    # Insulin
    28.5,   # BMI
    0.35,   # DiabetesPedigreeFunction
    45      # Age
]])

# Scale and predict
scaled_data = scaler.transform(patient_data)
prediction = model.predict(scaled_data)
probability = model.predict_proba(scaled_data)[0][1]

print(f"Prediction: {'Diabetic' if prediction[0] == 1 else 'Not Diabetic'}")
print(f"Risk Probability: {probability * 100:.1f}%")
```

## 📚 References

- Dataset: [UCI Machine Learning Repository - Pima Indians Diabetes](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database)
- Scikit-learn: [https://scikit-learn.org/](https://scikit-learn.org/)
- XGBoost: [https://xgboost.readthedocs.io/](https://xgboost.readthedocs.io/)

---

**MEDIS** - Medical Early Diabetes Insight System  
*Final Year Project - Computer Science Department*
