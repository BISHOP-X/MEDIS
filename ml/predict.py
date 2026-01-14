"""
MEDIS - Diabetes Prediction Module with SHAP Explainability

This module provides:
1. Model loading and prediction
2. SHAP value calculation for explainability
3. Risk categorization (Low/Moderate/High)

Usage:
    from predict import DiabetesPredictor
    
    predictor = DiabetesPredictor()
    result = predictor.predict({
        "age": 45,
        "bmi": 28.5,
        "glucose": 130,
        ...
    })

Author: MEDIS Development Team
Date: January 2026
"""

import os
import json
from typing import Dict, List, Optional, Any
import numpy as np
import pandas as pd
import joblib

# SHAP for explainability
import shap


# ============================================================================
# CONFIGURATION
# ============================================================================
class Config:
    """Configuration for the prediction module."""
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
    METRICS_PATH = os.path.join(BASE_DIR, "model_metrics.json")
    
    # Feature configuration (must match training)
    FEATURE_COLUMNS = [
        'Pregnancies',
        'Glucose',
        'BloodPressure',
        'SkinThickness',
        'Insulin',
        'BMI',
        'DiabetesPedigreeFunction',
        'Age'
    ]
    
    # Mapping from API input names to model feature names
    INPUT_TO_FEATURE_MAP = {
        'pregnancies': 'Pregnancies',
        'glucose': 'Glucose',
        'blood_pressure': 'BloodPressure',
        'skin_thickness': 'SkinThickness',
        'insulin': 'Insulin',
        'bmi': 'BMI',
        'diabetes_pedigree': 'DiabetesPedigreeFunction',
        'age': 'Age'
    }
    
    # Risk thresholds
    RISK_THRESHOLDS = {
        'low': 0.30,      # < 30% = Low risk
        'moderate': 0.60,  # 30-60% = Moderate risk
        # > 60% = High risk
    }
    
    # Available models
    AVAILABLE_MODELS = [
        'logistic_regression',
        'random_forest',
        'support_vector_machine',
        'xgboost'
    ]
    
    DEFAULT_MODEL = 'random_forest'  # Best performing model


# ============================================================================
# PREDICTOR CLASS
# ============================================================================
class DiabetesPredictor:
    """
    Diabetes prediction with SHAP explainability.
    
    This class loads trained models and provides predictions
    along with SHAP values for interpretability.
    """
    
    def __init__(self, model_name: str = None):
        """
        Initialize the predictor.
        
        Args:
            model_name: Name of the model to use. If None, uses the best model.
        """
        self.model_name = model_name or Config.DEFAULT_MODEL
        self.model = None
        self.scaler = None
        self.explainer = None
        self.background_data = None
        
        self._load_model()
        self._load_scaler()
        self._initialize_explainer()
    
    def _load_model(self) -> None:
        """Load the trained model from disk."""
        model_path = os.path.join(Config.MODELS_DIR, f"{self.model_name}.joblib")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        self.model = joblib.load(model_path)
        print(f"✓ Loaded model: {self.model_name}")
    
    def _load_scaler(self) -> None:
        """Load the feature scaler from disk."""
        scaler_path = os.path.join(Config.MODELS_DIR, "scaler.joblib")
        
        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler not found: {scaler_path}")
        
        self.scaler = joblib.load(scaler_path)
        print(f"✓ Loaded feature scaler")
    
    def _initialize_explainer(self) -> None:
        """
        Initialize SHAP explainer based on model type.
        
        Different models require different SHAP explainers:
        - Tree-based (RF, XGBoost): TreeExplainer (fastest)
        - Linear models (LR): LinearExplainer
        - Others: KernelExplainer (slowest but universal)
        """
        # Create synthetic background data for SHAP
        # Using typical values for the Pima dataset
        self.background_data = np.array([
            [3, 120, 70, 25, 100, 30, 0.4, 35]  # Typical patient values
        ])
        self.background_data_scaled = self.scaler.transform(self.background_data)
        
        # Choose appropriate explainer based on model type
        model_type = self.model_name.lower()
        
        if 'random_forest' in model_type or 'xgboost' in model_type:
            # TreeExplainer is fast and exact for tree-based models
            self.explainer = shap.TreeExplainer(self.model)
            self.explainer_type = 'tree'
            print(f"✓ Initialized TreeExplainer for {self.model_name}")
            
        elif 'logistic' in model_type:
            # LinearExplainer for logistic regression
            self.explainer = shap.LinearExplainer(
                self.model, 
                self.background_data_scaled
            )
            self.explainer_type = 'linear'
            print(f"✓ Initialized LinearExplainer for {self.model_name}")
            
        else:
            # KernelExplainer as fallback (works for any model)
            self.explainer = shap.KernelExplainer(
                self.model.predict_proba,
                self.background_data_scaled
            )
            self.explainer_type = 'kernel'
            print(f"✓ Initialized KernelExplainer for {self.model_name}")
    
    def _map_input_to_features(self, input_data: Dict) -> pd.DataFrame:
        """
        Map API input to model feature DataFrame.
        
        Args:
            input_data: Dictionary with input values
            
        Returns:
            DataFrame with features in correct order (preserves feature names)
        """
        features = []
        
        for feature_name in Config.FEATURE_COLUMNS:
            # Find the corresponding input key
            input_key = None
            for key, mapped_name in Config.INPUT_TO_FEATURE_MAP.items():
                if mapped_name == feature_name:
                    input_key = key
                    break
            
            # Get value from input or use default
            if input_key and input_key in input_data:
                value = input_data[input_key]
            elif feature_name.lower() in input_data:
                value = input_data[feature_name.lower()]
            elif feature_name in input_data:
                value = input_data[feature_name]
            else:
                # Default values for missing inputs
                defaults = {
                    'Pregnancies': 0,
                    'Glucose': 100,
                    'BloodPressure': 70,
                    'SkinThickness': 25,
                    'Insulin': 100,
                    'BMI': 25,
                    'DiabetesPedigreeFunction': 0.3,
                    'Age': 30
                }
                value = defaults.get(feature_name, 0)
            
            features.append(float(value))
        
        # Return as DataFrame to preserve feature names
        return pd.DataFrame([features], columns=Config.FEATURE_COLUMNS)
        
        return np.array([features])
    
    def _calculate_risk_category(self, probability: float) -> Dict:
        """
        Categorize risk based on probability.
        
        Args:
            probability: Diabetes probability (0-1)
            
        Returns:
            Dictionary with category info
        """
        if probability < Config.RISK_THRESHOLDS['low']:
            return {
                'category': 'low',
                'label': 'Low Risk',
                'color': '#22c55e',  # Green
                'description': 'Your risk factors indicate a low probability of diabetes.',
                'action': 'Maintain your healthy lifestyle and continue regular check-ups.'
            }
        elif probability < Config.RISK_THRESHOLDS['moderate']:
            return {
                'category': 'moderate',
                'label': 'Moderate Risk',
                'color': '#f59e0b',  # Amber
                'description': 'You have some risk factors that warrant attention.',
                'action': 'Consider lifestyle modifications and consult a healthcare provider.'
            }
        else:
            return {
                'category': 'high',
                'label': 'High Risk',
                'color': '#ef4444',  # Red
                'description': 'Multiple risk factors suggest elevated diabetes risk.',
                'action': 'We strongly recommend consulting a healthcare professional for screening.'
            }
    
    def _calculate_shap_values(self, features_scaled: np.ndarray) -> Dict:
        """
        Calculate SHAP values for explainability.
        
        Args:
            features_scaled: Scaled feature array
            
        Returns:
            Dictionary with SHAP values and feature contributions
        """
        try:
            # Convert to DataFrame with feature names to avoid sklearn warning
            features_df = pd.DataFrame(features_scaled, columns=Config.FEATURE_COLUMNS)
            
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(features_df)
            
            # Handle different output formats
            if isinstance(shap_values, list):
                # For classifiers that output [class_0, class_1]
                shap_values = shap_values[1]  # Get values for positive class
            
            # Convert to numpy array if needed
            if hasattr(shap_values, 'values'):
                shap_values = shap_values.values
            
            # Flatten if needed
            if isinstance(shap_values, np.ndarray):
                if len(shap_values.shape) > 1 and shap_values.shape[0] == 1:
                    shap_values = shap_values[0]
            
            # Ensure we have a flat array
            shap_values = np.array(shap_values).flatten()
            
            # Create feature contributions list
            contributions = []
            for i, feature_name in enumerate(Config.FEATURE_COLUMNS):
                shap_val = float(shap_values[i])
                contributions.append({
                    'feature': feature_name,
                    'shap_value': shap_val,
                    'impact': 'increases' if shap_val > 0 else 'decreases',
                    'magnitude': abs(shap_val)
                })
            
            # Sort by magnitude (most important first)
            contributions.sort(key=lambda x: x['magnitude'], reverse=True)
            
            # Add human-readable descriptions
            for contrib in contributions:
                feature = contrib['feature']
                impact = contrib['impact']
                
                descriptions = {
                    'Glucose': f"Blood glucose level {impact} your risk",
                    'BMI': f"Body Mass Index {impact} your risk",
                    'Age': f"Your age {impact} your risk",
                    'BloodPressure': f"Blood pressure {impact} your risk",
                    'Pregnancies': f"Pregnancy history {impact} your risk",
                    'DiabetesPedigreeFunction': f"Family history {impact} your risk",
                    'SkinThickness': f"Skin thickness measurement {impact} your risk",
                    'Insulin': f"Insulin level {impact} your risk"
                }
                contrib['description'] = descriptions.get(feature, f"{feature} {impact} your risk")
            
            return {
                'values': [float(v) for v in shap_values],
                'feature_names': Config.FEATURE_COLUMNS,
                'contributions': contributions,
                'base_value': float(self.explainer.expected_value[1]) if hasattr(self.explainer, 'expected_value') and isinstance(self.explainer.expected_value, (list, np.ndarray)) else 0.0
            }
            
        except Exception as e:
            print(f"Warning: SHAP calculation failed: {e}")
            # Return empty SHAP values if calculation fails
            return {
                'values': [0.0] * len(Config.FEATURE_COLUMNS),
                'feature_names': Config.FEATURE_COLUMNS,
                'contributions': [],
                'base_value': 0.0,
                'error': str(e)
            }
    
    def predict(self, input_data: Dict) -> Dict:
        """
        Make a prediction with full explainability.
        
        Args:
            input_data: Dictionary with patient data
            
        Returns:
            Dictionary with prediction, risk category, and SHAP values
        """
        # Map input to features (returns DataFrame)
        features_df = self._map_input_to_features(input_data)
        
        # Scale features (returns DataFrame with feature names)
        features_scaled = pd.DataFrame(
            self.scaler.transform(features_df),
            columns=Config.FEATURE_COLUMNS
        )
        
        # Make prediction
        prediction = self.model.predict(features_scaled)[0]
        probability = self.model.predict_proba(features_scaled)[0][1]
        
        # Calculate risk category
        risk = self._calculate_risk_category(probability)
        
        # Calculate SHAP values
        shap_data = self._calculate_shap_values(features_scaled)
        
        # Build response
        result = {
            'prediction': {
                'class': int(prediction),
                'label': 'Diabetic' if prediction == 1 else 'Not Diabetic',
                'probability': float(probability),
                'probability_percentage': round(probability * 100, 1)
            },
            'risk': risk,
            'explainability': {
                'shap': shap_data,
                'top_factors': shap_data['contributions'][:5] if shap_data['contributions'] else []
            },
            'input_summary': {
                'features': features_df.iloc[0].to_dict(),
                'model_used': self.model_name
            },
            'recommendations': self._generate_recommendations(
                probability, 
                shap_data['contributions'],
                input_data
            )
        }
        
        return result
    
    def _generate_recommendations(
        self, 
        probability: float, 
        contributions: List[Dict],
        input_data: Dict
    ) -> List[Dict]:
        """
        Generate personalized recommendations based on risk factors.
        
        Args:
            probability: Risk probability
            contributions: SHAP contributions
            input_data: Original input data
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # Get top risk-increasing factors
        risk_factors = [c for c in contributions if c['shap_value'] > 0][:3]
        
        for factor in risk_factors:
            feature = factor['feature']
            
            rec_map = {
                'Glucose': {
                    'title': 'Monitor Blood Sugar',
                    'description': 'Your glucose level is a significant factor. Consider regular monitoring and dietary adjustments to manage blood sugar.',
                    'icon': '🩸',
                    'priority': 'high'
                },
                'BMI': {
                    'title': 'Weight Management',
                    'description': 'Your BMI contributes to your risk. A combination of balanced diet and regular exercise can help achieve a healthier weight.',
                    'icon': '⚖️',
                    'priority': 'high'
                },
                'Age': {
                    'title': 'Regular Screening',
                    'description': 'Age is a non-modifiable risk factor. Regular health screenings become more important as we age.',
                    'icon': '📅',
                    'priority': 'medium'
                },
                'BloodPressure': {
                    'title': 'Blood Pressure Control',
                    'description': 'Managing blood pressure through diet, exercise, and stress reduction can help lower overall risk.',
                    'icon': '❤️',
                    'priority': 'high'
                },
                'DiabetesPedigreeFunction': {
                    'title': 'Family History Awareness',
                    'description': 'Your family history indicates genetic predisposition. Extra vigilance with lifestyle factors is recommended.',
                    'icon': '👨‍👩‍👧‍👦',
                    'priority': 'medium'
                },
                'Insulin': {
                    'title': 'Insulin Sensitivity',
                    'description': 'Consider foods with low glycemic index and regular physical activity to improve insulin sensitivity.',
                    'icon': '💉',
                    'priority': 'high'
                },
                'SkinThickness': {
                    'title': 'Body Composition',
                    'description': 'This measurement relates to body fat distribution. Focus on overall fitness and healthy body composition.',
                    'icon': '🏃',
                    'priority': 'low'
                },
                'Pregnancies': {
                    'title': 'Gestational Diabetes History',
                    'description': 'Pregnancy history can affect diabetes risk. Discuss with your healthcare provider about monitoring.',
                    'icon': '👶',
                    'priority': 'medium'
                }
            }
            
            if feature in rec_map:
                recommendations.append(rec_map[feature])
        
        # Add general recommendations if high risk
        if probability >= Config.RISK_THRESHOLDS['moderate']:
            recommendations.append({
                'title': 'Consult Healthcare Provider',
                'description': 'Based on your risk profile, we recommend scheduling a consultation with a healthcare professional for proper screening.',
                'icon': '🏥',
                'priority': 'high'
            })
        
        # Limit to top 4 recommendations
        return recommendations[:4]
    
    @staticmethod
    def get_available_models() -> List[str]:
        """Get list of available models."""
        return Config.AVAILABLE_MODELS
    
    @staticmethod
    def get_model_metrics() -> Dict:
        """Load and return model metrics."""
        if os.path.exists(Config.METRICS_PATH):
            with open(Config.METRICS_PATH, 'r') as f:
                return json.load(f)
        return {}


# ============================================================================
# QUICK TEST
# ============================================================================
if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("MEDIS Prediction Module - Test")
    print("=" * 60)
    
    # Initialize predictor
    predictor = DiabetesPredictor(model_name='random_forest')
    
    # Test case: High risk patient
    test_input = {
        'pregnancies': 5,
        'glucose': 160,
        'blood_pressure': 85,
        'skin_thickness': 35,
        'insulin': 200,
        'bmi': 35.5,
        'diabetes_pedigree': 0.8,
        'age': 52
    }
    
    print("\n📋 Test Input:")
    for k, v in test_input.items():
        print(f"   {k}: {v}")
    
    # Make prediction
    result = predictor.predict(test_input)
    
    print("\n" + "-" * 40)
    print("📊 PREDICTION RESULTS")
    print("-" * 40)
    print(f"Risk Probability: {result['prediction']['probability_percentage']}%")
    print(f"Risk Category: {result['risk']['label']}")
    print(f"Model Used: {result['input_summary']['model_used']}")
    
    print("\n🔍 Top Contributing Factors:")
    for factor in result['explainability']['top_factors']:
        impact_symbol = "↑" if factor['shap_value'] > 0 else "↓"
        print(f"   {impact_symbol} {factor['feature']}: {factor['description']}")
    
    print("\n💡 Recommendations:")
    for rec in result['recommendations']:
        print(f"   {rec['icon']} {rec['title']}: {rec['description'][:60]}...")
    
    print("\n✅ Prediction module test complete!")
