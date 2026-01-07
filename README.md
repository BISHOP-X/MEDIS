# 🏥 MEDIS - Medical Early Diabetes Insight System

AI-powered Type 2 Diabetes risk prediction system using non-invasive assessment data.

## 📋 Project Overview

MEDIS is a web-based early-stage T2DM risk prediction system that uses Machine Learning to analyze non-invasive user data (demographics, lifestyle, vitals) and outputs personalized risk predictions with explainable AI insights.

**Key Features:**
- 🤖 4 ML models (Logistic Regression, Random Forest, SVM, XGBoost)
- 📊 SHAP explainability for transparent predictions
- 🎨 Modern React UI with Tailwind CSS
- 🔐 Supabase authentication and data storage
- 📱 Mobile-responsive design

## 🏗️ Project Structure

```
ZINO-PROJECT/
├── frontend/           # React + Vite + TypeScript UI
├── backend/            # Python FastAPI ML server
├── models/             # Trained .joblib ML models
├── data/               # Training datasets (Pima, Kaggle)
├── docs/               # Documentation and reports
├── CONTEXT.md          # Project master context
└── README.md           # This file
```

## 🚀 Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python train_models.py  # First time only
python main.py
```

API runs at: `http://localhost:8000`

API Docs: `http://localhost:8000/docs`

## 📚 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Routing:** React Router
- **Animations:** Framer Motion
- **State:** React Hook Form + Zod
- **Charts:** Recharts

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.10+
- **ML Libraries:** scikit-learn, XGBoost, SHAP
- **Data:** Pandas, NumPy
- **Model Storage:** Joblib

### Database
- **Platform:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** User profiles, prediction history

## 🎯 Features Completed

✅ Landing page with hero section  
✅ Authentication UI (Login/Signup)  
✅ 3-step assessment wizard  
✅ Results page with risk meter  
✅ Dashboard with history  
✅ Contributing factors visualization  
✅ FastAPI backend structure  
✅ Model training pipeline  

## 🚧 TODO

- [ ] Train models with real Pima/Kaggle datasets
- [ ] Implement actual SHAP calculations
- [ ] Connect frontend to backend API
- [ ] Integrate Supabase authentication
- [ ] Store predictions in database
- [ ] Add family history & pregnancies fields
- [ ] Deploy to production

## 📖 Documentation

See [CONTEXT.md](CONTEXT.md) for detailed project specifications, ML architecture, and implementation guidelines.

## 🎓 Academic Context

This project is designed as a school assignment demonstrating:
- Full-stack web development
- Machine Learning model deployment
- Healthcare technology application
- Explainable AI principles

## 📊 ML Model Performance

Models are evaluated on:
- **Accuracy** - Overall correctness
- **Precision** - Positive prediction accuracy
- **Recall** - Sensitivity (prioritized to avoid false negatives)
- **F1 Score** - Harmonic mean of precision and recall

Target: **Recall > 75%** (missing a diabetic case is worse than a false alarm)

## 🔗 Useful Links

- **Pima Dataset:** https://www.kaggle.com/uciml/pima-indians-diabetes-database
- **Kaggle Dataset:** https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **SHAP Library:** https://shap.readthedocs.io/

## 👨‍💻 Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

### Backend Development

```bash
cd backend
uvicorn main:app --reload  # Auto-reload on changes
python train_models.py     # Retrain models
```

## 📝 License

Academic project - Not for commercial use.

---

**Built with ❤️ for proactive healthcare**
