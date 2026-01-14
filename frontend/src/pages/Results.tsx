import { useLocation, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Heart, Dumbbell, Apple, Coffee, ArrowRight, Download,
  BarChart3, Activity, Loader2, WifiOff, Brain
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskMeter from "@/components/dashboard/RiskMeter";
import ContributingFactors from "@/components/dashboard/ContributingFactors";
import { cn } from "@/lib/utils";
import { 
  getPrediction, 
  calculateBMI, 
  type UserFormData, 
  type PredictionResponse 
} from "@/services/api";

interface FormData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  bloodPressure: string;
  familyHistory: string;
  dietQuality: number;
  physicalActivity: number;
}

// Default recommendations (used as fallback)
const defaultRecommendations = [
  {
    icon: Dumbbell,
    title: "Increase Physical Activity",
    description: "Aim for at least 150 minutes of moderate exercise per week.",
    priority: "high",
  },
  {
    icon: Apple,
    title: "Improve Diet Quality",
    description: "Focus on whole grains, lean proteins, and more vegetables.",
    priority: "high",
  },
  {
    icon: Coffee,
    title: "Reduce Sugar Intake",
    description: "Cut back on sugary drinks and processed foods.",
    priority: "medium",
  },
  {
    icon: Heart,
    title: "Monitor Blood Pressure",
    description: "Regular check-ups can help catch issues early.",
    priority: "medium",
  },
];

const Results = () => {
  const location = useLocation();
  const { formData, bmi: passedBmi } = (location.state as { formData: FormData; bmi: string }) || {};

  // State for API response
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Calculate BMI
  const bmi = passedBmi || (formData ? calculateBMI(formData.height, formData.weight).toString() : "0");

  // Redirect if no data
  if (!formData) {
    return <Navigate to="/assessment" replace />;
  }

  // Call ML API on mount
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        // Call the real ML API
        const result = await getPrediction(formData as UserFormData, 'random_forest');
        setPrediction(result);
        setUsingFallback(false);
        
      } catch (error) {
        console.error('API Error:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to connect to ML server');
        setUsingFallback(true);
        
        // Use fallback calculation if API fails
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [formData]);

  // Fallback risk calculation (used when API is unavailable)
  const calculateFallbackRiskScore = (): number => {
    let score = 0;
    
    // Age factor
    if (formData.age > 45) score += 15;
    else if (formData.age > 35) score += 10;
    else if (formData.age > 25) score += 5;

    // BMI factor
    const bmiNum = parseFloat(bmi);
    if (bmiNum >= 30) score += 25;
    else if (bmiNum >= 25) score += 15;
    else if (bmiNum < 18.5) score += 5;

    // Blood pressure
    if (formData.bloodPressure === "High") score += 20;
    else if (formData.bloodPressure === "Elevated") score += 10;

    // Family history
    if (formData.familyHistory === "Parent or Sibling") score += 20;
    else if (formData.familyHistory === "Grandparent") score += 10;

    // Diet quality (inverse)
    score += (10 - formData.dietQuality) * 2;

    // Physical activity (inverse)
    score += (10 - formData.physicalActivity) * 2;

    return Math.min(100, Math.max(0, score));
  };

  // Use API result or fallback
  // Handle nested API response structure
  const getRiskPercentage = (): number => {
    if (prediction) {
      // New nested structure
      if (prediction.prediction?.probability_percentage !== undefined) {
        return prediction.prediction.probability_percentage;
      }
      // Legacy flat structure
      if (prediction.risk_percentage !== undefined) {
        return prediction.risk_percentage;
      }
    }
    return calculateFallbackRiskScore();
  };
  
  const riskScore = getRiskPercentage();
  
  const getRiskLevel = () => {
    if (prediction) {
      // New nested structure
      if (prediction.risk?.label) {
        const label = prediction.risk.label;
        if (label.includes("Low")) return { label: "Low Risk", color: "text-risk-low", bg: "bg-risk-low" };
        if (label.includes("Moderate")) return { label: "Moderate Risk", color: "text-risk-moderate", bg: "bg-risk-moderate" };
        return { label: "High Risk", color: "text-risk-high", bg: "bg-risk-high" };
      }
      // Legacy flat structure
      if (prediction.risk_level) {
        const level = prediction.risk_level;
        if (level === "Low") return { label: "Low Risk", color: "text-risk-low", bg: "bg-risk-low" };
        if (level === "Moderate") return { label: "Moderate Risk", color: "text-risk-moderate", bg: "bg-risk-moderate" };
        return { label: "High Risk", color: "text-risk-high", bg: "bg-risk-high" };
      }
    }
    // Fallback
    if (riskScore < 30) return { label: "Low Risk", color: "text-risk-low", bg: "bg-risk-low" };
    if (riskScore < 60) return { label: "Moderate Risk", color: "text-risk-moderate", bg: "bg-risk-moderate" };
    return { label: "High Risk", color: "text-risk-high", bg: "bg-risk-high" };
  };

  const riskLevel = getRiskLevel();

  // Contributing factors - from API's SHAP values or fallback
  const getFactors = () => {
    // Check new nested structure first
    if (prediction?.explainability?.top_factors && prediction.explainability.top_factors.length > 0) {
      return prediction.explainability.top_factors.slice(0, 6).map((factor) => ({
        name: factor.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Math.round(Math.abs(factor.contribution) * 100),
        max: 100,
        positive: factor.direction === 'increases_risk',
      }));
    }
    
    // Check legacy flat structure
    if (prediction?.feature_contributions) {
      // Convert SHAP values to display format
      const contributions = prediction.feature_contributions;
      const entries = Object.entries(contributions);
      
      // Sort by absolute value (most impactful first)
      entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
      
      // Convert to percentage (SHAP values are typically -1 to 1)
      return entries.slice(0, 6).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: Math.round(Math.abs(value) * 100),
        max: 100,
        positive: value > 0, // Positive = increases risk
      }));
    }
    
    // Fallback factors
    return [
      { name: "BMI", value: parseFloat(bmi) >= 25 ? 80 : 30, max: 100 },
      { name: "Age", value: formData.age > 45 ? 70 : formData.age > 35 ? 50 : 30, max: 100 },
      { name: "Blood Pressure", value: formData.bloodPressure === "High" ? 90 : formData.bloodPressure === "Elevated" ? 60 : 20, max: 100 },
      { name: "Family History", value: formData.familyHistory === "Parent or Sibling" ? 85 : formData.familyHistory === "Grandparent" ? 50 : 10, max: 100 },
      { name: "Diet", value: (10 - formData.dietQuality) * 10, max: 100 },
      { name: "Activity", value: (10 - formData.physicalActivity) * 10, max: 100 },
    ];
  };

  const factors = getFactors();

  // Get recommendations from API or use defaults
  const getRecommendations = () => {
    if (prediction && prediction.recommendations && prediction.recommendations.length > 0) {
      // Map API recommendations to display format
      // API can return either strings or objects with title/description
      return prediction.recommendations.slice(0, 4).map((rec: unknown, index: number) => {
        // Handle both string and object formats
        if (typeof rec === 'string') {
          return {
            icon: [Dumbbell, Apple, Coffee, Heart][index % 4],
            title: rec.split('.')[0] || rec.substring(0, 30),
            description: rec,
            priority: index < 2 ? "high" : "medium",
          };
        } else if (typeof rec === 'object' && rec !== null) {
          // API returns objects with title, description, priority, icon
          const recObj = rec as { title?: string; description?: string; priority?: string };
          return {
            icon: [Dumbbell, Apple, Coffee, Heart][index % 4],
            title: recObj.title || `Recommendation ${index + 1}`,
            description: recObj.description || '',
            priority: recObj.priority || (index < 2 ? "high" : "medium"),
          };
        }
        // Fallback
        return {
          icon: [Dumbbell, Apple, Coffee, Heart][index % 4],
          title: `Recommendation ${index + 1}`,
          description: String(rec),
          priority: index < 2 ? "high" : "medium",
        };
      });
    }
    return defaultRecommendations;
  };

  const recommendations = getRecommendations();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white animate-pulse" />
                </div>
                <Loader2 className="w-24 h-24 absolute -top-2 -left-2 animate-spin text-primary" />
              </div>
              <h2 className="text-2xl font-bold mt-8">Analyzing Your Data</h2>
              <p className="text-muted-foreground mt-2">Our AI is processing your health information...</p>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* API Status Banner */}
          {usingFallback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3"
            >
              <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ML Server Offline - Using Fallback Calculation
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Start the backend server for AI-powered predictions: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">uvicorn api:app --port 8000</code>
                </p>
              </div>
            </motion.div>
          )}

          {/* ML Model Badge */}
          {prediction && !usingFallback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3"
            >
              <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ AI Prediction Complete
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Model: <span className="font-semibold">{(prediction.input_summary?.model_used || prediction.model_used || 'random_forest').replace(/_/g, ' ').toUpperCase()}</span> | 
                  Powered by SHAP Explainability
                </p>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Your <span className="text-gradient-primary">Results</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Based on your assessment, here's your personalized diabetes risk analysis
              and recommendations.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Risk Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="h-full border-0 shadow-lg overflow-hidden dark:border dark:border-border/30">
                <CardHeader className="gradient-primary text-primary-foreground text-center py-6">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-8 flex flex-col items-center">
                  <RiskMeter score={riskScore} />
                  <div className="mt-6 text-center">
                    <span className={cn("text-2xl font-bold", riskLevel.color)}>
                      {riskLevel.label}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      {riskScore < 30 
                        ? "Keep up your healthy lifestyle!" 
                        : riskScore < 60 
                          ? "Consider lifestyle improvements" 
                          : "Consult a healthcare provider"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contributing Factors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="h-full border-0 shadow-lg dark:border dark:border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    AI Insights: Contributing Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    Our AI analyzed your data and identified these factors affecting your risk score:
                  </p>
                  <ContributingFactors factors={factors} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-secondary" />
              Personalized Recommendations
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className={cn(
                    "h-full border-0 shadow-md transition-all hover:shadow-lg dark:bg-card/50 dark:border dark:border-border/30",
                    rec.priority === "high" && "border-l-4 border-l-accent"
                  )}>
                    <CardContent className="p-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                        rec.priority === "high" 
                          ? "bg-accent/10 text-accent dark:bg-accent/20" 
                          : "bg-primary/10 text-primary dark:bg-primary/20"
                      )}>
                        <rec.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold mb-2">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                      {rec.priority === "high" && (
                        <span className="inline-block mt-3 text-xs font-semibold text-accent bg-accent/10 dark:bg-accent/20 px-2 py-1 rounded-full">
                          High Priority
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">
                View Full Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              <Download className="w-5 h-5" />
              Download Report
            </Button>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 bg-muted/50 rounded-2xl p-6 border border-border/50"
          >
            <div className="flex gap-4 items-start">
              <AlertTriangle className="w-6 h-6 text-risk-moderate flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Important Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  This assessment is for informational purposes only and is not a substitute 
                  for professional medical advice, diagnosis, or treatment. Always consult 
                  with a qualified healthcare provider for personalized medical guidance.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;
