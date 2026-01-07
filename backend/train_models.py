"""
MEDIS Model Training Script
Trains 4 ML models on diabetes datasets and saves them as .joblib files
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os

def load_datasets():
    """Load and combine diabetes datasets"""
    print("📂 Loading datasets...")
    
    # TODO: Add actual dataset loading
    # For now, create sample data structure
    print("⚠️  Using sample data. Replace with actual Pima/Kaggle datasets.")
    
    # Sample data structure (replace with actual data loading)
    # Expected features: Age, Gender, BMI, BP, FamilyHistory, Diet, Activity, Pregnancies
    n_samples = 1000
    np.random.seed(42)
    
    data = {
        'Age': np.random.randint(18, 80, n_samples),
        'Gender': np.random.randint(0, 2, n_samples),
        'BMI': np.random.uniform(18, 45, n_samples),
        'BloodPressure': np.random.randint(0, 3, n_samples),
        'FamilyHistory': np.random.randint(0, 3, n_samples),
        'DietQuality': np.random.randint(1, 11, n_samples),
        'PhysicalActivity': np.random.randint(1, 11, n_samples),
        'Pregnancies': np.random.randint(0, 10, n_samples),
        'Diabetes': np.random.randint(0, 2, n_samples)  # Target
    }
    
    df = pd.DataFrame(data)
    return df

def preprocess_data(df):
    """Preprocess and split data"""
    print("🔧 Preprocessing data...")
    
    # Separate features and target
    X = df.drop('Diabetes', axis=1)
    y = df['Diabetes']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Normalize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save scaler
    os.makedirs('../models', exist_ok=True)
    joblib.dump(scaler, '../models/scaler.joblib')
    print("✓ Saved scaler")
    
    return X_train_scaled, X_test_scaled, y_train, y_test

def train_model(name, model, X_train, X_test, y_train, y_test):
    """Train and evaluate a single model"""
    print(f"\n🤖 Training {name}...")
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)  # Critical for MEDIS!
    f1 = f1_score(y_test, y_pred)
    
    print(f"  Accuracy:  {accuracy:.3f}")
    print(f"  Precision: {precision:.3f}")
    print(f"  Recall:    {recall:.3f} ⚠️")
    print(f"  F1 Score:  {f1:.3f}")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"  Confusion Matrix:")
    print(f"    TN: {cm[0,0]}, FP: {cm[0,1]}")
    print(f"    FN: {cm[1,0]}, TP: {cm[1,1]}")
    
    return model, {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1
    }

def main():
    print("=" * 60)
    print("🏥 MEDIS MODEL TRAINING PIPELINE")
    print("=" * 60)
    
    # Load data
    df = load_datasets()
    print(f"✓ Loaded {len(df)} samples")
    
    # Preprocess
    X_train, X_test, y_train, y_test = preprocess_data(df)
    
    # Define models
    models = {
        'logistic_regression': LogisticRegression(max_iter=1000, random_state=42),
        'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'svm': SVC(kernel='rbf', probability=True, random_state=42),
        'xgboost': XGBClassifier(n_estimators=100, random_state=42, use_label_encoder=False, eval_metric='logloss')
    }
    
    # Train all models
    results = {}
    for name, model in models.items():
        trained_model, metrics = train_model(name, model, X_train, X_test, y_train, y_test)
        
        # Save model
        model_path = f'../models/{name}.joblib'
        joblib.dump(trained_model, model_path)
        print(f"✓ Saved to {model_path}")
        
        results[name] = metrics
    
    # Find champion model (prioritize recall)
    print("\n" + "=" * 60)
    print("🏆 CHAMPION MODEL SELECTION")
    print("=" * 60)
    
    champion = max(results.items(), key=lambda x: x[1]['recall'])
    print(f"Champion: {champion[0].upper()}")
    print(f"Recall Score: {champion[1]['recall']:.3f}")
    
    print("\n✅ Training complete! All models saved to /models directory.")

if __name__ == "__main__":
    main()
