from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
from typing import List, Dict, Optional
import os

app = FastAPI(
    title="MEDIS API",
    description="Medical Early Diabetes Insight System - ML Backend",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input validation schema
class AssessmentInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age in years")
    gender: str = Field(..., description="Gender (Male/Female)")
    height: float = Field(..., ge=100, le=250, description="Height in cm")
    weight: float = Field(..., ge=30, le=300, description="Weight in kg")
    blood_pressure: str = Field(..., description="Blood pressure category")
    family_history: str = Field(..., description="Family history of diabetes")
    diet_quality: int = Field(..., ge=1, le=10, description="Diet quality score")
    physical_activity: int = Field(..., ge=1, le=10, description="Physical activity level")
    pregnancies: Optional[int] = Field(None, ge=0, le=20, description="Number of pregnancies (optional)")

class PredictionResponse(BaseModel):
    risk_score: float = Field(..., description="Diabetes risk probability (0-100)")
    risk_level: str = Field(..., description="Risk category: Low, Moderate, or High")
    model_used: str = Field(..., description="ML model used for prediction")
    shap_values: Dict[str, float] = Field(..., description="Feature importance from SHAP")
    recommendations: List[str] = Field(..., description="Personalized health recommendations")

# Global variable to store loaded models
models = {}

def load_models():
    """Load all trained ML models from the models directory"""
    global models
    model_names = ["logistic_regression", "random_forest", "svm", "xgboost"]
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    
    for name in model_names:
        model_path = os.path.join(models_dir, f"{name}.joblib")
        if os.path.exists(model_path):
            models[name] = joblib.load(model_path)
            print(f"✓ Loaded {name} model")
        else:
            print(f"✗ Model not found: {model_path}")

@app.on_event("startup")
async def startup_event():
    """Initialize models on server startup"""
    print("🚀 Starting MEDIS Backend API...")
    load_models()
    if not models:
        print("⚠️  WARNING: No ML models loaded! Train models first.")

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "MEDIS API is running",
        "version": "1.0.0",
        "models_loaded": list(models.keys())
    }

@app.get("/health")
def health_check():
    """Detailed health check with model status"""
    return {
        "status": "healthy",
        "models_available": len(models) > 0,
        "loaded_models": list(models.keys())
    }

def preprocess_input(data: AssessmentInput) -> np.ndarray:
    """
    Transform user input into model-ready feature vector
    Maps assessment form data to ML model expected features
    """
    # Calculate BMI
    height_m = data.height / 100
    bmi = data.weight / (height_m ** 2)
    
    # Encode categorical variables
    gender_encoded = 1 if data.gender.lower() == "female" else 0
    
    # Blood pressure encoding
    bp_map = {"Normal": 0, "Elevated": 1, "High": 2}
    bp_encoded = bp_map.get(data.blood_pressure, 0)
    
    # Family history encoding
    fh_map = {"None": 0, "Grandparent": 1, "Parent or Sibling": 2}
    fh_encoded = fh_map.get(data.family_history, 0)
    
    # Feature vector (adjust based on your trained model's feature set)
    features = np.array([
        data.age,
        gender_encoded,
        bmi,
        bp_encoded,
        fh_encoded,
        data.diet_quality,
        data.physical_activity,
        data.pregnancies if data.pregnancies else 0
    ]).reshape(1, -1)
    
    return features

def calculate_shap_values(model, features: np.ndarray) -> Dict[str, float]:
    """
    Calculate SHAP values for explainability
    TODO: Implement actual SHAP calculation with shap library
    """
    # Placeholder - replace with actual SHAP implementation
    feature_names = ["Age", "Gender", "BMI", "Blood Pressure", 
                     "Family History", "Diet Quality", "Physical Activity", "Pregnancies"]
    
    # Mock SHAP values (replace with real calculation)
    mock_values = {
        name: float(np.random.uniform(0, 30)) 
        for name in feature_names
    }
    return mock_values

def generate_recommendations(risk_score: float, input_data: AssessmentInput) -> List[str]:
    """Generate personalized recommendations based on risk factors"""
    recommendations = []
    
    bmi = input_data.weight / ((input_data.height / 100) ** 2)
    
    if bmi >= 25:
        recommendations.append("Consider weight management strategies to reach a healthy BMI")
    
    if input_data.physical_activity < 5:
        recommendations.append("Increase physical activity to at least 150 minutes per week")
    
    if input_data.diet_quality < 5:
        recommendations.append("Improve diet quality by eating more vegetables, fruits, and whole grains")
    
    if input_data.blood_pressure in ["Elevated", "High"]:
        recommendations.append("Monitor blood pressure regularly and consult a doctor")
    
    if input_data.family_history != "None":
        recommendations.append("Schedule regular diabetes screenings due to family history")
    
    if risk_score >= 60:
        recommendations.append("⚠️ HIGH RISK: Consult a healthcare provider immediately for blood glucose testing")
    
    return recommendations

@app.post("/predict", response_model=PredictionResponse)
async def predict_diabetes_risk(data: AssessmentInput):
    """
    Main prediction endpoint
    Accepts user assessment data and returns diabetes risk prediction
    """
    if not models:
        raise HTTPException(status_code=503, detail="ML models not loaded. Please train models first.")
    
    try:
        # Use champion model (default to XGBoost if available, else first available)
        model_name = "xgboost" if "xgboost" in models else list(models.keys())[0]
        model = models[model_name]
        
        # Preprocess input
        features = preprocess_input(data)
        
        # Make prediction
        prediction_proba = model.predict_proba(features)[0][1]  # Probability of class 1 (diabetes)
        risk_score = float(prediction_proba * 100)
        
        # Determine risk level
        if risk_score < 30:
            risk_level = "Low"
        elif risk_score < 60:
            risk_level = "Moderate"
        else:
            risk_level = "High"
        
        # Calculate SHAP values
        shap_values = calculate_shap_values(model, features)
        
        # Generate recommendations
        recommendations = generate_recommendations(risk_score, data)
        
        return PredictionResponse(
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
            model_used=model_name,
            shap_values=shap_values,
            recommendations=recommendations
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/models")
def list_models():
    """List all available ML models"""
    return {
        "available_models": list(models.keys()),
        "total": len(models)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
