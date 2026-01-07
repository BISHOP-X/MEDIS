# MEDIS Backend API

FastAPI-based backend for the Medical Early Diabetes Insight System.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train Models (First Time Setup)

```bash
python train_models.py
```

This will:
- Load diabetes datasets
- Train 4 ML models (Logistic Regression, Random Forest, SVM, XGBoost)
- Save models to `../models/` directory
- Select champion model based on recall score

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Test the API

Visit: `http://localhost:8000/docs` for interactive API documentation.

## 📡 Endpoints

### `GET /`
Health check endpoint.

### `GET /health`
Detailed health status with loaded models.

### `POST /predict`
Main prediction endpoint. Accepts user assessment data and returns diabetes risk prediction.

**Request Body:**
```json
{
  "age": 45,
  "gender": "Female",
  "height": 165,
  "weight": 70,
  "blood_pressure": "Normal",
  "family_history": "Parent or Sibling",
  "diet_quality": 6,
  "physical_activity": 5,
  "pregnancies": 2
}
```

**Response:**
```json
{
  "risk_score": 42.5,
  "risk_level": "Moderate",
  "model_used": "xgboost",
  "shap_values": {
    "Age": 15.2,
    "BMI": 28.4,
    "Family History": 20.1
  },
  "recommendations": [
    "Increase physical activity to at least 150 minutes per week",
    "Monitor blood pressure regularly"
  ]
}
```

### `GET /models`
List all available trained models.

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
API_HOST=0.0.0.0
API_PORT=8000
FRONTEND_URL=http://localhost:5173
```

## 📊 Model Training

The training script uses:
- **Scikit-learn** for Logistic Regression, Random Forest, SVM
- **XGBoost** for gradient boosting
- **SHAP** for explainability
- **Stratified split** to maintain class distribution

Models are evaluated on:
- Accuracy
- Precision
- **Recall** (prioritized - avoiding false negatives)
- F1 Score

## 🧪 Testing

```bash
# Test with curl
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "gender": "Female",
    "height": 165,
    "weight": 75,
    "blood_pressure": "Elevated",
    "family_history": "Parent or Sibling",
    "diet_quality": 5,
    "physical_activity": 4,
    "pregnancies": 2
  }'
```

## 📝 Notes

- Replace sample data in `train_models.py` with actual Pima/Kaggle datasets
- Implement proper SHAP calculation in `calculate_shap_values()`
- Add database integration for storing predictions
- Implement user authentication middleware
