# MEDIS Training Datasets

Place your diabetes datasets here for model training.

## 📦 Required Datasets

### 1. Pima Indians Diabetes Database
- **Source:** UCI Machine Learning Repository
- **URL:** https://www.kaggle.com/uciml/pima-indians-diabetes-database
- **File:** `pima_diabetes.csv`
- **Features:** 8 features (Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age)
- **Samples:** 768

### 2. Kaggle Diabetes Health Indicators
- **Source:** Kaggle
- **URL:** https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset
- **File:** `diabetes_health_indicators.csv`
- **Features:** 21+ features including lifestyle factors
- **Samples:** 250,000+

## 📋 Dataset Preparation

1. Download both datasets from the links above
2. Place CSV files in this directory
3. Run preprocessing scripts from `../backend/train_models.py`

## 🔧 Feature Mapping

Map dataset features to MEDIS assessment form:

| **MEDIS Form Field** | **Pima Feature** | **Kaggle Feature** |
|----------------------|------------------|--------------------|
| Age | Age | Age |
| Gender | - | Sex |
| BMI | BMI | BMI |
| Blood Pressure | BloodPressure | HighBP |
| Family History | DiabetesPedigreeFunction | - |
| Pregnancies | Pregnancies | - |
| Physical Activity | - | PhysActivity |
| Diet Quality | - | Fruits/Veggies |

## ⚠️ Privacy Note

Do not commit actual datasets to version control if they contain sensitive information. Add `*.csv` to `.gitignore`.
