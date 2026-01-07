# PROJECT MASTER CONTEXT: MEDIS (Medical Early Diabetes Insight System)

## 1. Project Overview & Objectives
**MEDIS** is a web-based, early-stage Type 2 Diabetes Mellitus (T2DM) risk prediction system.
* [cite_start]**Goal:** To shift healthcare from reactive treatment to proactive prevention by identifying at-risk individuals before symptoms appear[cite: 51, 73].
* [cite_start]**Core Logic:** The system uses Machine Learning to analyze **non-invasive** user data (demographics, lifestyle, vitals) and outputs a personalized risk probability[cite: 74, 91].
* [cite_start]**Critical Requirement:** The system must prioritize **Recall (Sensitivity)** to minimize false negatives (missing a diabetic case is worse than a false alarm)[cite: 105, 503].

---

## 2. Technical Architecture & Stack
The system follows a 3-tier architecture (Data, Application, Presentation) but has been modernized from the original documentation to a React/Python hybrid stack.

### **A. Frontend (Presentation Layer)**
* **Framework:** React (Vite) + TypeScript.
* **Styling:** Tailwind CSS + Shadcn UI (Components).
* **State Management:** React Hook Form + Zod (for complex form validation).
* **Visualization:** Recharts (or similar) to render SHAP explainability charts.
* **Design Aesthetic:** "Cinematic Medical." [cite_start]High-trust, premium visuals, glassmorphism, mobile-responsive[cite: 398].

### **B. Backend (Application Layer / ML Engine)**
* [cite_start]**Language:** Python 3[cite: 532].
* **API Framework:** FastAPI (preferred) or Flask.
* **Responsibility:**
    * Exposes a `/predict` endpoint.
    * [cite_start]Loads trained models from `.joblib` files[cite: 541].
    * [cite_start]Processes inputs and calculates SHAP values[cite: 536].
* **ML Libraries:**
    * [cite_start]`scikit-learn`: For Logistic Regression, Random Forest, SVM[cite: 533].
    * [cite_start]`xgboost`: For Gradient Boosting[cite: 534].
    * [cite_start]`shap`: For model explainability[cite: 387].
    * [cite_start]`pandas` / `numpy`: Data preprocessing[cite: 535].

### **C. Database (Data Layer)**
* **Platform:** Supabase.
* **Auth:** Handles User Login/Signup and Session Management.
* **Storage:** Stores user profile data and historical prediction logs.

---

## 3. Machine Learning Specifications
The backend must train, validate, and host **four specific models**. The user may either select a model or the system uses the highest-performing one (Champion Model).

**1. The Models:**
* [cite_start]**Logistic Regression:** Baseline classification model (Note: Document specifies Logistic, not Linear)[cite: 469].
* [cite_start]**Random Forest Classifier:** Handles non-linear feature interactions[cite: 471].
* [cite_start]**Support Vector Machine (SVM):** Finds optimal decision boundaries in multidimensional space[cite: 475].
* [cite_start]**XGBoost:** Gradient boosting for high efficiency and accuracy[cite: 478].

**2. Data Pipeline:**
* [cite_start]**Datasets:** UCI Pima Indians Diabetes Database & Kaggle Diabetes Health Indicators[cite: 414, 417].
* **Preprocessing:**
    * [cite_start]**Imputation:** Median imputation for missing values[cite: 426].
    * [cite_start]**Normalization:** Min-Max scaling (0-1) for Age, BMI[cite: 445].
    * [cite_start]**Encoding:** Label/One-Hot encoding for categorical variables (Family History, Diet)[cite: 449].

---

## 4. Functional Requirements & Feature List

### **Phase 1: Authentication**
* Secure Login and Registration pages using Supabase Auth.
* Protected routes (Dashboard accessible only after login).

### **Phase 2: The Assessment Wizard (Input)**
[cite_start]A multi-step form collecting **Non-Invasive Risk Factors**[cite: 171]:
1.  [cite_start]**Demographics:** Age[cite: 172].
2.  [cite_start]**Vitals:** Height & Weight (System must auto-calculate BMI)[cite: 172], Blood Pressure (if applicable).
3.  [cite_start]**Medical History:** Family History of Diabetes (Yes/No)[cite: 172], Pregnancies (for female users).
4.  [cite_start]**Lifestyle:** Diet Quality, Physical Activity Level[cite: 172].

### **Phase 3: The Dashboard (Output)**
Once data is submitted to the Python API, the Dashboard displays:
1.  [cite_start]**Risk Score:** A visual Gauge/Meter showing the probability (Low, Moderate, High)[cite: 114].
2.  **Explainability (Crucial):** A "Why this result?" section. [cite_start]Use SHAP values to generate a chart showing which factors (e.g., "BMI > 30") contributed most to the risk[cite: 270, 396].
3.  [cite_start]**Recommendations:** Actionable advice based on the risk tier (e.g., "Increase cardio activity")[cite: 397].

---

## 5. Implementation Guide for the LLM
* **Form Logic:** When building the form, use `zod` schemas to validate inputs (e.g., Age cannot be > 120, BMI cannot be < 10).
* **API Connection:** The React frontend should send a JSON payload to the Python backend matching the model's expected feature set (e.g., `{"age": 45, "bmi": 28.5, "glucose": 110...}`).
* **SHAP Integration:** The Python backend response will include `shap_values`. The Frontend must map these values to a chart component to visualize "Feature Importance."
* **Routing:**
    * `/` -> Landing Page.
    * `/auth` -> Login/Signup.
    * `/assess` -> The Wizard Form.
    * `/dashboard` -> Results & History.

## 6. Design Vibe (Handed off from Lovable)
* **Aesthetic:** Cinematic, high-trust, futuristic medical interface.
* **Components:** Shadcn Cards, Dialogs, and Progress bars.
* **Responsiveness:** Mobile-first is mandatory.