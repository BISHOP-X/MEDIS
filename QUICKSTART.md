# 🚀 MEDIS Quick Start Guide

**Get MEDIS running in 5 minutes!**

---

## Prerequisites Checklist

Before starting, make sure you have installed:

- [ ] **Python 3.10+** - https://python.org *(check "Add to PATH"!)*
- [ ] **Node.js 18+** - https://nodejs.org *(download LTS version)*
- [ ] **Git** - https://git-scm.com

**Verify installations:**
```bash
python --version   # Should show Python 3.10+
node --version     # Should show v18+
npm --version      # Should show 9+
```

---

## Step-by-Step Commands

### 1. Clone & Enter Project
```bash
git clone <your-repo-url>
cd ZINO-PROJECT
```

### 2. Setup Python Environment
```bash
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install Python Dependencies
```bash
cd ml
pip install -r requirements.txt
```

### 4. Train ML Models
```bash
python train_models.py
```

### 5. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Running the App

### Terminal 1 - Backend API
```bash
cd ZINO-PROJECT
.venv\Scripts\activate
cd ml
uvicorn api:app --reload --port 8000
```
📍 API: http://localhost:8000
📍 Docs: http://localhost:8000/docs

### Terminal 2 - Frontend
```bash
cd ZINO-PROJECT/frontend
npm run dev
```
📍 Website: http://localhost:5173

---

## Quick Test

1. Open http://localhost:5173 in browser
2. Navigate to Assessment page
3. Fill in the health form
4. Get your diabetes risk prediction!

---

## Common Fixes

| Problem | Solution |
|---------|----------|
| "python not recognized" | Reinstall Python, check "Add to PATH" |
| "Cannot activate venv" | Use `cmd` instead of PowerShell |
| "Module not found" | Run `pip install -r requirements.txt` again |
| "Port already in use" | Use `--port 8001` instead |
| "Model files not found" | Run `python train_models.py` |

---

**Full documentation:** See [README.md](README.md)
