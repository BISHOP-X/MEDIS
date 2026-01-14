"""
MEDIS - Medical Early Diabetes Insight System
Model Training Pipeline

This script trains multiple machine learning models for diabetes prediction
using the Pima Indians Diabetes Dataset.

Models Trained:
1. Logistic Regression - Baseline interpretable model
2. Random Forest - Ensemble tree-based model
3. Support Vector Machine (SVM) - Kernel-based classifier
4. XGBoost - Gradient boosting for high accuracy

Author: MEDIS Development Team
Date: January 2026
Version: 1.0.0
"""

# ============================================================================
# IMPORTS
# ============================================================================
import os
import sys
import json
import warnings
from datetime import datetime

import numpy as np
import pandas as pd
import joblib

# Scikit-learn imports
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

# XGBoost
try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("Warning: XGBoost not installed. Skipping XGBoost model.")

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')


# ============================================================================
# CONFIGURATION
# ============================================================================
class Config:
    """Configuration settings for the training pipeline."""
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(BASE_DIR, "..", "data", "pima_diabetes_sample.csv")
    MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
    METRICS_PATH = os.path.join(BASE_DIR, "model_metrics.json")
    
    # Training parameters
    TEST_SIZE = 0.2
    RANDOM_STATE = 42
    CV_FOLDS = 5
    
    # Feature columns (from Pima dataset)
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
    TARGET_COLUMN = 'Outcome'


# ============================================================================
# DATA LOADING & PREPROCESSING
# ============================================================================
def load_data(data_path: str) -> pd.DataFrame:
    """
    Load the diabetes dataset from CSV file.
    
    Args:
        data_path: Path to the CSV file
        
    Returns:
        DataFrame containing the dataset
    """
    print("=" * 60)
    print("STEP 1: Loading Dataset")
    print("=" * 60)
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at: {data_path}")
    
    df = pd.read_csv(data_path)
    
    print(f"✓ Dataset loaded successfully")
    print(f"  - Total samples: {len(df)}")
    print(f"  - Features: {len(df.columns) - 1}")
    print(f"  - Target distribution:")
    print(f"    - No Diabetes (0): {(df['Outcome'] == 0).sum()} ({(df['Outcome'] == 0).mean()*100:.1f}%)")
    print(f"    - Diabetes (1): {(df['Outcome'] == 1).sum()} ({(df['Outcome'] == 1).mean()*100:.1f}%)")
    
    return df


def preprocess_data(df: pd.DataFrame) -> tuple:
    """
    Preprocess the data: handle missing values, scale features, split data.
    
    Args:
        df: Raw DataFrame
        
    Returns:
        Tuple of (X_train, X_test, y_train, y_test, scaler)
    """
    print("\n" + "=" * 60)
    print("STEP 2: Preprocessing Data")
    print("=" * 60)
    
    # Separate features and target
    X = df[Config.FEATURE_COLUMNS].copy()
    y = df[Config.TARGET_COLUMN].copy()
    
    # Handle missing values (zeros in medical data often mean missing)
    # Replace 0s with NaN for certain columns where 0 is impossible
    zero_not_possible = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    
    for col in zero_not_possible:
        n_zeros = (X[col] == 0).sum()
        if n_zeros > 0:
            X[col] = X[col].replace(0, np.nan)
            X[col] = X[col].fillna(X[col].median())
            print(f"  ✓ Replaced {n_zeros} zeros in '{col}' with median")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=Config.TEST_SIZE,
        random_state=Config.RANDOM_STATE,
        stratify=y
    )
    
    print(f"\n  ✓ Data split completed:")
    print(f"    - Training set: {len(X_train)} samples")
    print(f"    - Test set: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"  ✓ Feature scaling applied (StandardScaler)")
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


# ============================================================================
# MODEL TRAINING
# ============================================================================
def train_logistic_regression(X_train, y_train, X_test, y_test) -> dict:
    """
    Train Logistic Regression model with hyperparameter tuning.
    
    Returns:
        Dictionary containing model, predictions, and metrics
    """
    print("\n" + "-" * 40)
    print("Training: Logistic Regression")
    print("-" * 40)
    
    # Hyperparameter grid
    param_grid = {
        'C': [0.01, 0.1, 1, 10],
        'penalty': ['l2'],
        'solver': ['lbfgs'],
        'max_iter': [1000]
    }
    
    # Grid search with cross-validation
    grid_search = GridSearchCV(
        LogisticRegression(random_state=Config.RANDOM_STATE),
        param_grid,
        cv=Config.CV_FOLDS,
        scoring='roc_auc',
        n_jobs=-1
    )
    
    grid_search.fit(X_train, y_train)
    model = grid_search.best_estimator_
    
    print(f"  Best parameters: {grid_search.best_params_}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    return {
        'model': model,
        'name': 'Logistic Regression',
        'y_pred': y_pred,
        'y_prob': y_prob,
        'best_params': grid_search.best_params_
    }


def train_random_forest(X_train, y_train, X_test, y_test) -> dict:
    """
    Train Random Forest model with hyperparameter tuning.
    
    Returns:
        Dictionary containing model, predictions, and metrics
    """
    print("\n" + "-" * 40)
    print("Training: Random Forest")
    print("-" * 40)
    
    # Hyperparameter grid
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [5, 10, 15, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    
    # Grid search with cross-validation
    grid_search = GridSearchCV(
        RandomForestClassifier(random_state=Config.RANDOM_STATE),
        param_grid,
        cv=Config.CV_FOLDS,
        scoring='roc_auc',
        n_jobs=-1
    )
    
    grid_search.fit(X_train, y_train)
    model = grid_search.best_estimator_
    
    print(f"  Best parameters: {grid_search.best_params_}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Feature importance (convert to native Python float for JSON serialization)
    feature_importance = {k: float(v) for k, v in zip(Config.FEATURE_COLUMNS, model.feature_importances_)}
    print(f"  Feature Importances:")
    for feat, imp in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        print(f"    - {feat}: {imp:.4f}")
    
    return {
        'model': model,
        'name': 'Random Forest',
        'y_pred': y_pred,
        'y_prob': y_prob,
        'best_params': grid_search.best_params_,
        'feature_importance': feature_importance
    }


def train_svm(X_train, y_train, X_test, y_test) -> dict:
    """
    Train Support Vector Machine model with hyperparameter tuning.
    
    Returns:
        Dictionary containing model, predictions, and metrics
    """
    print("\n" + "-" * 40)
    print("Training: Support Vector Machine (SVM)")
    print("-" * 40)
    
    # Hyperparameter grid
    param_grid = {
        'C': [0.1, 1, 10],
        'kernel': ['rbf', 'linear'],
        'gamma': ['scale', 'auto']
    }
    
    # Grid search with cross-validation
    grid_search = GridSearchCV(
        SVC(random_state=Config.RANDOM_STATE, probability=True),
        param_grid,
        cv=Config.CV_FOLDS,
        scoring='roc_auc',
        n_jobs=-1
    )
    
    grid_search.fit(X_train, y_train)
    model = grid_search.best_estimator_
    
    print(f"  Best parameters: {grid_search.best_params_}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    return {
        'model': model,
        'name': 'Support Vector Machine',
        'y_pred': y_pred,
        'y_prob': y_prob,
        'best_params': grid_search.best_params_
    }


def train_xgboost(X_train, y_train, X_test, y_test) -> dict:
    """
    Train XGBoost model with hyperparameter tuning.
    
    Returns:
        Dictionary containing model, predictions, and metrics
    """
    print("\n" + "-" * 40)
    print("Training: XGBoost")
    print("-" * 40)
    
    if not XGBOOST_AVAILABLE:
        print("  ⚠ XGBoost not available. Skipping...")
        return None
    
    # Hyperparameter grid
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [3, 5, 7],
        'learning_rate': [0.01, 0.1, 0.2],
        'subsample': [0.8, 1.0]
    }
    
    # Grid search with cross-validation
    grid_search = GridSearchCV(
        XGBClassifier(
            random_state=Config.RANDOM_STATE,
            use_label_encoder=False,
            eval_metric='logloss'
        ),
        param_grid,
        cv=Config.CV_FOLDS,
        scoring='roc_auc',
        n_jobs=-1
    )
    
    grid_search.fit(X_train, y_train)
    model = grid_search.best_estimator_
    
    print(f"  Best parameters: {grid_search.best_params_}")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Feature importance (convert to native Python float for JSON serialization)
    feature_importance = {k: float(v) for k, v in zip(Config.FEATURE_COLUMNS, model.feature_importances_)}
    print(f"  Feature Importances:")
    for feat, imp in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        print(f"    - {feat}: {imp:.4f}")
    
    return {
        'model': model,
        'name': 'XGBoost',
        'y_pred': y_pred,
        'y_prob': y_prob,
        'best_params': grid_search.best_params_,
        'feature_importance': feature_importance
    }


# ============================================================================
# MODEL EVALUATION
# ============================================================================
def evaluate_model(y_test, y_pred, y_prob, model_name: str) -> dict:
    """
    Calculate comprehensive evaluation metrics for a model.
    
    Args:
        y_test: True labels
        y_pred: Predicted labels
        y_prob: Predicted probabilities
        model_name: Name of the model
        
    Returns:
        Dictionary of metrics
    """
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1_score': f1_score(y_test, y_pred),
        'roc_auc': roc_auc_score(y_test, y_prob)
    }
    
    cm = confusion_matrix(y_test, y_pred)
    metrics['confusion_matrix'] = cm.tolist()
    metrics['true_negatives'] = int(cm[0, 0])
    metrics['false_positives'] = int(cm[0, 1])
    metrics['false_negatives'] = int(cm[1, 0])
    metrics['true_positives'] = int(cm[1, 1])
    
    return metrics


def print_evaluation_results(results: list, y_test) -> None:
    """
    Print formatted evaluation results for all models.
    
    Args:
        results: List of result dictionaries from training
        y_test: True labels
    """
    print("\n" + "=" * 60)
    print("STEP 4: Model Evaluation Results")
    print("=" * 60)
    
    # Print comparison table
    print("\n┌" + "─" * 58 + "┐")
    print(f"│ {'Model':<25} │ {'Accuracy':>8} │ {'AUC-ROC':>8} │ {'F1':>8} │")
    print("├" + "─" * 58 + "┤")
    
    for result in results:
        if result is None:
            continue
        metrics = evaluate_model(
            y_test, 
            result['y_pred'], 
            result['y_prob'], 
            result['name']
        )
        print(f"│ {result['name']:<25} │ {metrics['accuracy']:>8.4f} │ {metrics['roc_auc']:>8.4f} │ {metrics['f1_score']:>8.4f} │")
    
    print("└" + "─" * 58 + "┘")
    
    # Find best model
    best_result = max(
        [r for r in results if r is not None],
        key=lambda x: roc_auc_score(y_test, x['y_prob'])
    )
    best_auc = roc_auc_score(y_test, best_result['y_prob'])
    
    print(f"\n🏆 Best Model: {best_result['name']} (AUC-ROC: {best_auc:.4f})")


# ============================================================================
# MODEL SAVING
# ============================================================================
def save_models(results: list, scaler, y_test) -> None:
    """
    Save trained models and metadata.
    
    Args:
        results: List of result dictionaries from training
        scaler: Fitted StandardScaler
        y_test: True labels for metrics calculation
    """
    print("\n" + "=" * 60)
    print("STEP 5: Saving Models")
    print("=" * 60)
    
    # Create models directory if it doesn't exist
    os.makedirs(Config.MODELS_DIR, exist_ok=True)
    
    all_metrics = {}
    
    for result in results:
        if result is None:
            continue
            
        # Save model
        model_filename = result['name'].lower().replace(' ', '_') + '.joblib'
        model_path = os.path.join(Config.MODELS_DIR, model_filename)
        joblib.dump(result['model'], model_path)
        print(f"  ✓ Saved: {model_filename}")
        
        # Calculate and store metrics
        metrics = evaluate_model(
            y_test,
            result['y_pred'],
            result['y_prob'],
            result['name']
        )
        metrics['best_params'] = result.get('best_params', {})
        metrics['feature_importance'] = result.get('feature_importance', {})
        all_metrics[result['name']] = metrics
    
    # Save scaler
    scaler_path = os.path.join(Config.MODELS_DIR, 'scaler.joblib')
    joblib.dump(scaler, scaler_path)
    print(f"  ✓ Saved: scaler.joblib")
    
    # Save metrics to JSON
    all_metrics['training_info'] = {
        'date': datetime.now().isoformat(),
        'test_size': Config.TEST_SIZE,
        'cv_folds': Config.CV_FOLDS,
        'random_state': Config.RANDOM_STATE,
        'feature_columns': Config.FEATURE_COLUMNS
    }
    
    with open(Config.METRICS_PATH, 'w') as f:
        json.dump(all_metrics, f, indent=2)
    print(f"  ✓ Saved: model_metrics.json")
    
    print(f"\n✓ All models saved to: {Config.MODELS_DIR}")


# ============================================================================
# MAIN EXECUTION
# ============================================================================
def main():
    """Main execution function."""
    print("\n" + "╔" + "═" * 58 + "╗")
    print("║" + " MEDIS - Diabetes Prediction Model Training Pipeline ".center(58) + "║")
    print("╚" + "═" * 58 + "╝\n")
    
    start_time = datetime.now()
    
    try:
        # Step 1: Load data
        df = load_data(Config.DATA_PATH)
        
        # Step 2: Preprocess data
        X_train, X_test, y_train, y_test, scaler = preprocess_data(df)
        
        # Step 3: Train models
        print("\n" + "=" * 60)
        print("STEP 3: Training Models")
        print("=" * 60)
        
        results = []
        
        # Train all models
        results.append(train_logistic_regression(X_train, y_train, X_test, y_test))
        results.append(train_random_forest(X_train, y_train, X_test, y_test))
        results.append(train_svm(X_train, y_train, X_test, y_test))
        results.append(train_xgboost(X_train, y_train, X_test, y_test))
        
        # Step 4: Evaluate models
        print_evaluation_results(results, y_test)
        
        # Step 5: Save models
        save_models(results, scaler, y_test)
        
        # Summary
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("\n" + "=" * 60)
        print("TRAINING COMPLETE")
        print("=" * 60)
        print(f"  Total time: {duration:.2f} seconds")
        print(f"  Models trained: {len([r for r in results if r is not None])}")
        print(f"  Output directory: {Config.MODELS_DIR}")
        print("\n  Next steps:")
        print("  1. Run evaluate_models.py for detailed analysis")
        print("  2. Run shap_analysis.py for explainability")
        print("  3. Use models in API via predict.py")
        
    except Exception as e:
        print(f"\n❌ Error during training: {str(e)}")
        raise


if __name__ == "__main__":
    main()
