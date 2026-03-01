"""Quick test to debug model output"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from predict import DiabetesPredictor
import numpy as np

# Test with clearly high-risk input
p = DiabetesPredictor('xgboost')

high_risk = {
    'pregnancies': 6, 'glucose': 180, 'blood_pressure': 95,
    'skin_thickness': 35, 'insulin': 250, 'bmi': 38.0,
    'diabetes_pedigree': 1.2, 'age': 55
}
r1 = p.predict(high_risk)
print("=== HIGH RISK INPUT ===")
print("probability:", r1["prediction"]["probability"])
print("probability_percentage:", r1["prediction"]["probability_percentage"])
print("risk label:", r1["risk"]["label"])
print("class:", r1["prediction"]["class"])
print("type:", type(r1["prediction"]["probability"]))

low_risk = {
    'pregnancies': 0, 'glucose': 85, 'blood_pressure': 70,
    'skin_thickness': 20, 'insulin': 60, 'bmi': 22.0,
    'diabetes_pedigree': 0.2, 'age': 25
}
r2 = p.predict(low_risk)
print("\n=== LOW RISK INPUT ===")
print("probability:", r2["prediction"]["probability"])
print("probability_percentage:", r2["prediction"]["probability_percentage"])
print("risk label:", r2["risk"]["label"])

# Simulating frontend worst-case user
frontend_worst = {
    'age': 55, 'bmi': 38.0, 'blood_pressure': 95, 'glucose': 175,
    'insulin': 233, 'skin_thickness': 25, 'pregnancies': 1, 'diabetes_pedigree': 1.0
}
r3 = p.predict(frontend_worst)
print("\n=== FRONTEND WORST CASE ===")
print("probability:", r3["prediction"]["probability"])
print("probability_percentage:", r3["prediction"]["probability_percentage"])
print("risk label:", r3["risk"]["label"])

# Test what the scaler outputs
print("\n=== SCALER DEBUG ===")
import pandas as pd
from predict import Config
features_raw = pd.DataFrame([[1, 175, 95, 25, 233, 38.0, 1.0, 55]], columns=Config.FEATURE_COLUMNS)
print("Raw features:", features_raw.values)
features_scaled = p.scaler.transform(features_raw)
print("Scaled features:", features_scaled)
print("Scaler data_min:", p.scaler.data_min_)
print("Scaler data_max:", p.scaler.data_max_)

# Check raw model output
proba = p.model.predict_proba(features_scaled)
print("\nRaw predict_proba:", proba)
print("Type:", type(proba[0][1]))
