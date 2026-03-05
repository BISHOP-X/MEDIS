/**
 * MEDIS API Service
 * 
 * This module handles communication between the React frontend and the 
 * FastAPI ML backend. It transforms user-friendly form inputs into the
 * format expected by the machine learning models.
 * 
 * DESIGN DECISION: User-Friendly Form → ML Model Mapping
 * -------------------------------------------------------
 * The frontend collects easy-to-understand inputs (age, height, weight, 
 * family history as text), while the ML model requires clinical values 
 * (glucose levels, insulin, etc.). 
 * 
 * We use SMART DEFAULTS for clinical values that users typically don't know,
 * and MAP user-friendly inputs to clinical equivalents where possible.
 * 
 * See README.md for full explanation of this design choice.
 */

// API Base URL
// In production (Docker/nginx), nginx proxies /api/ → backend:8000
// In local dev, Vite proxies /api/ → localhost:8000 (see vite.config.ts)
const API_BASE_URL = '/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Form data as collected from the user in Assessment.tsx
 * These are USER-FRIENDLY inputs that anyone can answer
 */
export interface UserFormData {
  age: number;
  gender: string;           // "Male" | "Female"
  height: number;           // in cm
  weight: number;           // in kg
  bloodPressure: string;    // "Normal" | "Elevated" | "High"
  familyHistory: string;    // "None" | "Parent or Sibling" | "Grandparent"
  dietQuality: number;      // 1-10 scale
  physicalActivity: number; // 1-10 scale
  smokingStatus?: string;      // "Never" | "Former" | "Current"
  alcoholConsumption?: string; // "None" | "Occasional" | "Frequent"
  sleepDuration?: number;      // hours per night
  checkupFrequency?: string;   // "Regular" | "Occasional" | "Rare"
  pregnancies?: number;        // actual count (females)
}

/**
 * Data format expected by the ML backend API
 * These are CLINICAL VALUES used by the Pima Diabetes dataset
 */
export interface MLPredictionRequest {
  age: number;
  bmi: number;
  blood_pressure: number;      // Diastolic BP in mm Hg
  glucose: number;             // Plasma glucose concentration
  insulin: number;             // 2-Hour serum insulin
  skin_thickness: number;      // Triceps skin fold thickness
  pregnancies: number;         // Number of pregnancies
  diabetes_pedigree: number;   // Family history factor (0-2.5)
  model_name?: string;         // Which ML model to use
}

/**
 * Response from the ML prediction API
 * 
 * The API returns a nested structure with prediction, risk, explainability, etc.
 */
export interface PredictionResponse {
  // Prediction block
  prediction: {
    class: number;              // 0 = No diabetes, 1 = Diabetes
    label: string;              // "Not Diabetic" | "Diabetic"
    probability: number;        // 0.0 to 1.0
    probability_percentage: number; // 0 to 100
  };
  
  // Risk assessment block
  risk: {
    category: string;           // "low" | "moderate" | "high"
    label: string;              // "Low Risk" | "Moderate Risk" | "High Risk"
    color: string;              // Hex color
    description: string;
    action: string;
  };
  
  // Explainability block (SHAP values)
  explainability: {
    shap: Record<string, number>;
    top_factors: Array<{
      feature: string;
      contribution: number;
      direction: string;
    }>;
  };
  
  // Input summary
  input_summary: {
    features: Record<string, number>;
    model_used: string;
  };
  
  // Recommendations
  recommendations: Array<{
    title: string;
    description: string;
    icon: string;
    priority: string;
  }>;
  
  // Legacy flat fields for backward compatibility
  risk_level?: string;
  risk_percentage?: number;
  model_used?: string;
  feature_contributions?: Record<string, number>;
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Calculate BMI from height (cm) and weight (kg)
 */
export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

/**
 * Map blood pressure category to typical diastolic value (mm Hg)
 * 
 * Medical Reference:
 * - Normal: < 80 mm Hg
 * - Elevated: 80-89 mm Hg  
 * - High (Stage 1): 90-120 mm Hg
 * 
 * We use representative middle values for each category.
 */
export function mapBloodPressureToValue(category: string): number {
  switch (category) {
    case 'Normal':
      return 70;    // Healthy diastolic BP
    case 'Elevated':
      return 85;    // Pre-hypertension range
    case 'High':
      return 95;    // Stage 1 hypertension
    default:
      return 75;    // Default to normal-ish
  }
}

/**
 * Map family history to Diabetes Pedigree Function value
 * 
 * The Diabetes Pedigree Function (DPF) is a genetic score from 0.078 to 2.42
 * in the Pima dataset. It represents likelihood of diabetes based on family history.
 * 
 * Mapping:
 * - No family history → Low DPF (0.2)
 * - Grandparent has diabetes → Medium DPF (0.5)
 * - Parent or sibling has diabetes → High DPF (1.0)
 */
export function mapFamilyHistoryToPedigree(familyHistory: string): number {
  switch (familyHistory) {
    case 'None':
      return 0.2;   // Low genetic risk
    case 'Grandparent':
      return 0.5;   // Moderate genetic risk
    case 'Parent or Sibling':
      return 1.0;   // High genetic risk (first-degree relative)
    default:
      return 0.3;   // Default to low-moderate
  }
}

/**
 * Estimate glucose level based on lifestyle factors
 * 
 * Since we don't collect actual glucose readings, we estimate based on:
 * - Diet quality (poor diet → higher glucose)
 * - Physical activity (low activity → higher glucose)
 * - BMI (higher BMI → typically higher glucose)
 * - Age (older → higher risk)
 * 
 * Normal fasting glucose: 70-100 mg/dL
 * Pre-diabetic: 100-125 mg/dL
 * Diabetic: > 126 mg/dL
 * 
 * We produce a WIDE range (75-180) so the model can meaningfully differentiate.
 */
export function estimateGlucose(
  dietQuality: number, 
  physicalActivity: number, 
  bmi: number,
  age?: number
): number {
  // Start at a normal healthy baseline
  let glucose = 85;
  
  // Poor diet is the biggest glucose driver (diet 1-10, lower = worse)
  // A terrible diet (1) adds 45, great diet (10) adds 0
  glucose += (10 - dietQuality) * 5;
  
  // Low activity raises glucose meaningfully
  // No exercise (1) adds 36, very active (10) adds 0
  glucose += (10 - physicalActivity) * 4;
  
  // BMI is strongly correlated with glucose
  if (bmi >= 35) glucose += 30;
  else if (bmi >= 30) glucose += 20;
  else if (bmi >= 27) glucose += 12;
  else if (bmi >= 25) glucose += 6;
  
  // Age factor
  const ageVal = age || 30;
  if (ageVal >= 55) glucose += 15;
  else if (ageVal >= 45) glucose += 10;
  else if (ageVal >= 35) glucose += 5;
  
  // Keep within realistic bounds (75-200)
  return Math.min(200, Math.max(75, Math.round(glucose)));
}

/**
 * Estimate insulin based on BMI, activity, and diet
 * 
 * Normal fasting insulin: 25-100 μU/mL
 * Higher BMI often correlates with insulin resistance (higher values)
 * Poor lifestyle → body produces more insulin to compensate
 */
export function estimateInsulin(
  bmi: number, 
  physicalActivity: number,
  dietQuality?: number
): number {
  let insulin = 60;  // Healthy baseline
  
  // Higher BMI → higher insulin (insulin resistance)
  if (bmi >= 35) insulin += 100;
  else if (bmi >= 30) insulin += 70;
  else if (bmi >= 27) insulin += 40;
  else if (bmi >= 25) insulin += 20;
  
  // Low activity → higher insulin resistance
  insulin += (10 - physicalActivity) * 8;
  
  // Poor diet raises insulin
  const diet = dietQuality ?? 5;
  insulin += (10 - diet) * 5;
  
  return Math.min(500, Math.max(15, Math.round(insulin)));
}

// ============================================================================
// MAIN TRANSFORMATION FUNCTION
// ============================================================================

/**
 * Transform user-friendly form data into ML model input
 * 
 * This is the CORE MAPPING function that bridges the gap between
 * what users can easily provide and what the ML model needs.
 */
export function transformFormDataToMLInput(
  formData: UserFormData,
  modelName: string = 'xgboost'
): MLPredictionRequest {
  // Calculate BMI from height/weight, cap at 60 to stay within model range
  const bmi = Math.min(calculateBMI(formData.height, formData.weight), 60);
  
  // Map categorical inputs to numerical values
  const bloodPressure = mapBloodPressureToValue(formData.bloodPressure);
  const diabetesPedigree = mapFamilyHistoryToPedigree(formData.familyHistory);
  
  // Estimate clinical values from lifestyle factors
  const glucose = estimateGlucose(formData.dietQuality, formData.physicalActivity, bmi, formData.age);
  const insulin = estimateInsulin(bmi, formData.physicalActivity, formData.dietQuality);
  
  // Use actual pregnancy count for females if provided; default to 1 for females, 0 for males
  const pregnancies = formData.gender === 'Female'
    ? (formData.pregnancies ?? 1)
    : 0;
  
  // Skin thickness - use population average (no easy way to collect this)
  const skinThickness = 25;
  
  return {
    age: formData.age,
    bmi: bmi,
    blood_pressure: bloodPressure,
    glucose: glucose,
    insulin: insulin,
    skin_thickness: skinThickness,
    pregnancies: pregnancies,
    diabetes_pedigree: diabetesPedigree,
    model_name: modelName,
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Make a prediction request to the ML backend
 */
export async function getPrediction(
  formData: UserFormData,
  modelName: string = 'xgboost'
): Promise<PredictionResponse> {
  // Transform user input to ML format
  const mlInput = transformFormDataToMLInput(formData, modelName);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlInput),
      signal: controller.signal,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Log detail for debugging 422s
      const detail = typeof errorData.detail === 'string'
        ? errorData.detail
        : JSON.stringify(errorData.detail ?? errorData);
      console.error(`[API] ${response.status} from /predict:`, detail, errorData);
      throw new Error(detail || `API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

