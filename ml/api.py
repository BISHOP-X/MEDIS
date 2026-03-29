"""
MEDIS - FastAPI Prediction Server

This server exposes the diabetes prediction model via REST API.

Endpoints:
- GET  /              - Health check
- GET  /models        - List available models
- POST /predict       - Make prediction with SHAP explainability
- GET  /metrics       - Get model performance metrics

Run with:
    uvicorn api:app --reload --port 8000

Author: MEDIS Development Team
Date: January 2026
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os

from predict import DiabetesPredictor, Config


# ============================================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================
class AssessmentInput(BaseModel):
    """
    Input schema for diabetes risk assessment.
    
    Matches the frontend Assessment form fields.
    Fields use snake_case for API consistency.
    """
    # Demographics
    age: int = Field(..., ge=1, le=120, description="Age in years")
    
    # Vitals
    bmi: float = Field(..., ge=10, le=70, description="Body Mass Index")
    blood_pressure: Optional[int] = Field(
        default=70, 
        ge=40, 
        le=200, 
        description="Diastolic blood pressure (mm Hg)"
    )
    
    # Medical Measurements (optional - can use defaults)
    glucose: Optional[int] = Field(
        default=100, 
        ge=50, 
        le=300, 
        description="Plasma glucose concentration"
    )
    insulin: Optional[int] = Field(
        default=100, 
        ge=0, 
        le=900, 
        description="2-Hour serum insulin"
    )
    skin_thickness: Optional[int] = Field(
        default=25, 
        ge=0, 
        le=100, 
        description="Triceps skin fold thickness (mm)"
    )
    
    # Medical History
    pregnancies: Optional[int] = Field(
        default=0, 
        ge=0, 
        le=20, 
        description="Number of pregnancies"
    )
    diabetes_pedigree: Optional[float] = Field(
        default=0.3, 
        ge=0, 
        le=3, 
        description="Diabetes pedigree function (family history factor)"
    )
    
    # Optional: Model selection
    model_name: Optional[str] = Field(
        default=None,
        description="Model to use for prediction. Options: logistic_regression, random_forest, support_vector_machine, xgboost"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "age": 45,
                "bmi": 28.5,
                "blood_pressure": 80,
                "glucose": 130,
                "insulin": 150,
                "skin_thickness": 30,
                "pregnancies": 2,
                "diabetes_pedigree": 0.5,
                "model_name": "random_forest"
            }
        }


class RiskCategory(BaseModel):
    """Risk category information."""
    category: str
    label: str
    color: str
    description: str
    action: str


class Prediction(BaseModel):
    """Prediction output."""
    class_: int = Field(..., alias="class")
    label: str
    probability: float
    probability_percentage: float


class FeatureContribution(BaseModel):
    """SHAP feature contribution."""
    feature: str
    shap_value: float
    impact: str
    magnitude: float
    description: str


class Recommendation(BaseModel):
    """Health recommendation."""
    title: str
    description: str
    icon: str
    priority: str


class PredictionResponse(BaseModel):
    """Complete prediction response with explainability."""
    prediction: Dict[str, Any]
    risk: Dict[str, Any]
    explainability: Dict[str, Any]
    input_summary: Dict[str, Any]
    recommendations: List[Dict[str, Any]]


class ModelInfo(BaseModel):
    """Model information."""
    name: str
    available: bool
    is_default: bool


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    models_loaded: List[str]


# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================
app = FastAPI(
    title="MEDIS Prediction API",
    description="Medical Early Diabetes Insight System - ML Prediction Service with SHAP Explainability",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global predictor cache
_predictors: Dict[str, DiabetesPredictor] = {}


def get_predictor(model_name: str = None) -> DiabetesPredictor:
    """
    Get or create a predictor instance.
    
    Caches predictors to avoid reloading models on each request.
    """
    model_name = model_name or Config.DEFAULT_MODEL
    
    if model_name not in _predictors:
        try:
            _predictors[model_name] = DiabetesPredictor(model_name)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load model '{model_name}': {str(e)}"
            )
    
    return _predictors[model_name]


# ============================================================================
# API ENDPOINTS
# ============================================================================
@app.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns API status and available models.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "models_loaded": list(_predictors.keys()) if _predictors else ["none - will load on first request"]
    }


@app.get("/models", response_model=List[ModelInfo])
async def list_models():
    """
    List all available prediction models.
    
    Returns model names, availability status, and default model.
    """
    models = []
    
    for model_name in Config.AVAILABLE_MODELS:
        model_path = os.path.join(Config.MODELS_DIR, f"{model_name}.joblib")
        models.append({
            "name": model_name,
            "available": os.path.exists(model_path),
            "is_default": model_name == Config.DEFAULT_MODEL
        })
    
    return models


@app.get("/metrics")
async def get_metrics():
    """
    Get model performance metrics.
    
    Returns accuracy, precision, recall, F1, and AUC-ROC for all models.
    """
    metrics = DiabetesPredictor.get_model_metrics()
    
    if not metrics:
        raise HTTPException(
            status_code=404,
            detail="Model metrics not found. Run training first."
        )
    
    return metrics


@app.post("/predict", response_model=PredictionResponse)
async def predict(assessment: AssessmentInput):
    """
    Make a diabetes risk prediction with SHAP explainability.
    """
    try:
        # Log exactly what was received (helps debug 422 issues)
        print(f"[PREDICT] Received: {assessment.model_dump()}")
        
        # Get predictor (loads model if not cached)
        predictor = get_predictor(assessment.model_name)
        
        # Convert Pydantic model to dict
        input_data = assessment.model_dump(exclude={'model_name'})
        
        # Make prediction
        result = predictor.predict(input_data)
        
        return result
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.post("/predict/batch")
async def predict_batch(assessments: List[AssessmentInput]):
    """
    Make predictions for multiple patients.
    
    Useful for batch processing or comparison scenarios.
    Limited to 100 patients per request.
    """
    if len(assessments) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 assessments per batch request"
        )
    
    results = []
    predictor = get_predictor()
    
    for assessment in assessments:
        input_data = assessment.model_dump(exclude={'model_name'})
        result = predictor.predict(input_data)
        results.append(result)
    
    return {
        "count": len(results),
        "results": results
    }


@app.get("/feature-info")
async def get_feature_info():
    """
    Get information about input features.
    
    Returns feature names, descriptions, and valid ranges.
    Useful for frontend form validation.
    """
    return {
        "features": [
            {
                "name": "age",
                "label": "Age",
                "description": "Age in years",
                "type": "integer",
                "min": 1,
                "max": 120,
                "required": True
            },
            {
                "name": "bmi",
                "label": "BMI",
                "description": "Body Mass Index (weight in kg / height in m²)",
                "type": "float",
                "min": 10,
                "max": 70,
                "required": True
            },
            {
                "name": "glucose",
                "label": "Glucose",
                "description": "Plasma glucose concentration (mg/dL)",
                "type": "integer",
                "min": 50,
                "max": 300,
                "required": False,
                "default": 100
            },
            {
                "name": "blood_pressure",
                "label": "Blood Pressure",
                "description": "Diastolic blood pressure (mm Hg)",
                "type": "integer",
                "min": 40,
                "max": 200,
                "required": False,
                "default": 70
            },
            {
                "name": "insulin",
                "label": "Insulin",
                "description": "2-Hour serum insulin (mu U/ml)",
                "type": "integer",
                "min": 0,
                "max": 900,
                "required": False,
                "default": 100
            },
            {
                "name": "skin_thickness",
                "label": "Skin Thickness",
                "description": "Triceps skin fold thickness (mm)",
                "type": "integer",
                "min": 0,
                "max": 100,
                "required": False,
                "default": 25
            },
            {
                "name": "pregnancies",
                "label": "Pregnancies",
                "description": "Number of pregnancies",
                "type": "integer",
                "min": 0,
                "max": 20,
                "required": False,
                "default": 0
            },
            {
                "name": "diabetes_pedigree",
                "label": "Diabetes Pedigree Function",
                "description": "Family history factor (0-2.5 typical range)",
                "type": "float",
                "min": 0,
                "max": 3,
                "required": False,
                "default": 0.3
            }
        ]
    }


# ============================================================================
# STARTUP/SHUTDOWN EVENTS
# ============================================================================
@app.on_event("startup")
async def startup_event():
    """Pre-load the default model on startup."""
    print("\n" + "=" * 50)
    print("🚀 MEDIS Prediction API Starting...")
    print("=" * 50)
    
    try:
        # Pre-load default model
        get_predictor(Config.DEFAULT_MODEL)
        print(f"✓ Default model loaded: {Config.DEFAULT_MODEL}")
    except Exception as e:
        print(f"⚠ Warning: Could not pre-load model: {e}")
    
    print("\n📍 Endpoints:")
    print("   GET  /         - Health check")
    print("   GET  /models   - List models")
    print("   GET  /metrics  - Model metrics")
    print("   POST /predict  - Make prediction")
    print("   GET  /docs     - API documentation")
    print("\n" + "=" * 50 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print("\n👋 MEDIS Prediction API shutting down...")
    _predictors.clear()


# ============================================================================
# RUN SERVER
# ============================================================================
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
