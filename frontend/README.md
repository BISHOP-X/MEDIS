# MEDIS Frontend

Web interface for the Medical Early Diabetes Insight System - an AI-powered Type 2 Diabetes risk prediction application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **React Router** - Routing

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── dashboard/   # Dashboard-specific components
│   ├── landing/     # Landing page sections
│   ├── layout/      # Header, Footer
│   └── ui/          # Shadcn UI components
├── contexts/        # React contexts (Auth)
├── hooks/           # Custom React hooks
├── lib/             # Utilities
└── pages/           # Route pages
```

## 🛠️ Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🔐 Authentication

Currently uses mock authentication with localStorage. Any credentials will work - no backend required for development.

## 📝 Features

- ✅ Landing page with hero section
- ✅ User authentication (mock)
- ✅ Protected routes
- ✅ 3-step health assessment wizard
- ✅ Risk calculation and visualization
- ✅ User dashboard
- ✅ Responsive design

## 🔗 Related

This frontend connects to the Python FastAPI backend located in `/backend`. See the main project README for full setup instructions.

## 📄 License

Academic project - Not for commercial use.
