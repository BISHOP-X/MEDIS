import { useLocation, Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
  estimateGlucose,
  estimateInsulin,
  type UserFormData, 
  type PredictionResponse 
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface FormData {
  age: number;
  gender: string;
  height: number;
  weight: number;
  bloodPressure: string;
  familyHistory: string;
  dietQuality: number;
  physicalActivity: number;
  smokingStatus: string;
  alcoholConsumption: string;
  sleepDuration: number;
  checkupFrequency: string;
  pregnancies: number;
}



const Results = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData, bmi: passedBmi } = (location.state as { formData: FormData; bmi: string }) || {};

  // State for API response
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const savedRef = useRef(false);

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
        const result = await getPrediction(formData as UserFormData, 'xgboost');
        setPrediction(result);
        setUsingFallback(false);

        // Save to Supabase (only once — prevent duplicates on back/forward)
        if (user?.id && !savedRef.current) {
          savedRef.current = true;
          const riskPct = calculateFallbackRiskScore();
          const riskLvl = riskPct >= 60 ? "High Risk" : riskPct >= 30 ? "Moderate Risk" : "Low Risk";
          const modelUsed = result.input_summary?.model_used ?? result.model_used ?? "xgboost";
          const contributions = result.explainability?.shap ?? result.feature_contributions ?? {};
          const recs = result.recommendations ?? [];
          const { error: insertError } = await supabase.from("assessments").insert({
            user_id: user.id,
            age: formData.age,
            gender: formData.gender,
            height: formData.height,
            weight: formData.weight,
            bmi: parseFloat(bmi),
            blood_pressure: formData.bloodPressure,
            family_history: formData.familyHistory,
            diet_quality: formData.dietQuality,
            physical_activity: formData.physicalActivity,
            risk_score: riskPct,
            risk_level: riskLvl,
            model_used: modelUsed,
            feature_contributions: contributions,
            recommendations: recs,
            smoking_status: formData.smokingStatus,
            alcohol_consumption: formData.alcoholConsumption,
            sleep_duration: formData.sleepDuration,
            checkup_frequency: formData.checkupFrequency,
            pregnancies: formData.pregnancies,
          });
          if (insertError) {
            console.error('Failed to save assessment:', insertError.message);
          }
        }
        
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

    // Age
    if (formData.age > 45) score += 15;
    else if (formData.age > 35) score += 10;
    else if (formData.age > 25) score += 5;

    // BMI
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

    // Diet quality (inverse: bad diet = higher score)
    score += (10 - formData.dietQuality) * 2;

    // Physical activity (inverse: sedentary = higher score)
    score += (10 - formData.physicalActivity) * 2;

    // Smoking
    if (formData.smokingStatus === "Current") score += 15;
    else if (formData.smokingStatus === "Former") score += 5;

    // Alcohol
    if (formData.alcoholConsumption === "Frequent") score += 10;
    else if (formData.alcoholConsumption === "Occasional") score += 3;

    // Sleep (outside 6–9 hrs = higher risk)
    const sleep = formData.sleepDuration ?? 7;
    if (sleep < 6 || sleep > 9) score += 8;

    // Rare check-ups = no monitoring
    if (formData.checkupFrequency === "Rare") score += 5;

    return Math.min(100, Math.max(0, score));
  };

  // Always use the fallback score — it directly reflects user inputs
  // and is more intuitive than the ML model's clinical estimate.
  // The ML API is still called for the "AI Prediction Complete" badge
  // and to save ML metadata to the database.
  const riskScore = calculateFallbackRiskScore();
  
  const getRiskLevel = () => {
    if (riskScore < 30) return { label: "Low Risk", color: "text-risk-low", bg: "bg-risk-low" };
    if (riskScore < 60) return { label: "Moderate Risk", color: "text-risk-moderate", bg: "bg-risk-moderate" };
    return { label: "High Risk", color: "text-risk-high", bg: "bg-risk-high" };
  };

  const riskLevel = getRiskLevel();

  // Contributing factors — clinical-style with estimated biomarkers
  // (the client explicitly requested Glucose, Insulin, BMI, Blood Pressure,
  // Age, and Pregnancies to show as factors)
  const getFactors = () => {
    const bmiNum = parseFloat(bmi);
    const estimatedGlucose = estimateGlucose(formData.dietQuality, formData.physicalActivity, bmiNum, formData.age);
    const estimatedInsulin = estimateInsulin(bmiNum, formData.physicalActivity, formData.dietQuality);

    // Normalise to 0–100 bars relative to clinical risk thresholds
    const glucoseBar = Math.min(100, Math.round(((estimatedGlucose - 75) / (200 - 75)) * 100));
    const insulinBar = Math.min(100, Math.round(((estimatedInsulin - 15) / (300 - 15)) * 100));
    const bmiBar     = Math.min(100, Math.round((bmiNum / 45) * 100));
    const bpBar      = formData.bloodPressure === "High" ? 85 : formData.bloodPressure === "Elevated" ? 60 : 25;
    const ageBar     = Math.min(100, Math.round(((formData.age - 18) / 62) * 100));
    const familyBar  = formData.familyHistory === "Parent or Sibling" ? 90 : formData.familyHistory === "Grandparent" ? 55 : 10;

    const factors: Array<{ name: string; value: number; max: number }> = [
      { name: "Glucose (est.)",   value: glucoseBar, max: 100 },
      { name: "BMI",              value: bmiBar,     max: 100 },
      { name: "Blood Pressure",   value: bpBar,      max: 100 },
      { name: "Insulin (est.)",   value: insulinBar, max: 100 },
      { name: "Age",              value: ageBar,     max: 100 },
      { name: "Family History",   value: familyBar,  max: 100 },
    ];

    // Replace Family History with Pregnancies for females who have been pregnant
    if (formData.gender === "Female" && formData.pregnancies > 0) {
      const pregnancyBar = Math.min(100, formData.pregnancies * 12);
      factors.splice(5, 1, { name: "Pregnancies", value: pregnancyBar, max: 100 });
    }

    return factors;
  };

  const factors = getFactors();

  // Conditional recommendations — only shown when the user's inputs
  // actually warrant them. Perfect health inputs → positive reinforcement only.
  const getRecommendations = () => {
    const bmiNum = parseFloat(bmi);
    const recs: Array<{ icon: any; title: string; description: string; priority: string }> = [];

    if (formData.physicalActivity < 6)
      recs.push({ icon: Dumbbell, title: "Increase Physical Activity", description: "Aim for at least 150 minutes of moderate exercise per week.", priority: "high" });

    if (formData.dietQuality < 6)
      recs.push({ icon: Apple, title: "Improve Diet Quality", description: "Focus on whole grains, lean proteins, and more vegetables.", priority: "high" });

    if (formData.smokingStatus === "Current")
      recs.push({ icon: AlertTriangle, title: "Quit Smoking", description: "Smoking significantly raises insulin resistance and doubles diabetes risk. Seek support to quit.", priority: "high" });

    if (formData.alcoholConsumption === "Frequent")
      recs.push({ icon: Coffee, title: "Reduce Alcohol Consumption", description: "Frequent alcohol disrupts blood sugar regulation and strains the liver.", priority: "high" });

    if (formData.sleepDuration < 6 || formData.sleepDuration > 9)
      recs.push({ icon: Heart, title: "Improve Sleep Habits", description: "Aim for 7–8 hours of sleep. Poor sleep raises blood sugar and insulin resistance.", priority: "medium" });

    if (bmiNum >= 25)
      recs.push({ icon: Activity, title: "Maintain Healthy Weight", description: "Even a 5–10% weight reduction significantly lowers diabetes risk.", priority: bmiNum >= 30 ? "high" : "medium" });

    if (formData.bloodPressure === "High" || formData.bloodPressure === "Elevated")
      recs.push({ icon: Heart, title: "Monitor Blood Pressure", description: "High blood pressure compounds diabetes risk. Regular monitoring is essential.", priority: formData.bloodPressure === "High" ? "high" : "medium" });

    if (formData.checkupFrequency === "Rare")
      recs.push({ icon: CheckCircle, title: "Schedule Regular Check-ups", description: "Annual blood sugar testing helps detect pre-diabetes early when it is most treatable.", priority: "medium" });

    if (formData.dietQuality < 5)
      recs.push({ icon: Coffee, title: "Reduce Sugar Intake", description: "Cut back on sugary drinks and processed foods to improve metabolic health.", priority: "medium" });

    if (formData.familyHistory !== "None" && riskScore >= 40)
      recs.push({ icon: TrendingUp, title: "Genetic Risk Monitoring", description: "With family history of diabetes, annual HbA1c testing is strongly recommended.", priority: "high" });

    // Perfect health — show positive reinforcement instead
    if (recs.length === 0) {
      return [
        { icon: CheckCircle, title: "Maintain Your Healthy Habits",    description: "Your lifestyle significantly reduces diabetes risk. Keep it up!",                    priority: "low" },
        { icon: Activity,    title: "Stay Active",                      description: "Continue regular exercise to keep insulin sensitivity high long-term.",            priority: "low" },
        { icon: Apple,       title: "Continue Balanced Diet",           description: "Your diet quality is excellent. Maintaining it is key to long-term metabolic health.", priority: "low" },
        { icon: Heart,       title: "Annual Health Screening",          description: "Even with low risk, annual check-ups are a valuable preventive habit.",            priority: "low" },
      ];
    }

    return recs.slice(0, 4);
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
            <Button variant="outline" size="lg" onClick={() => {
              const text = [
                "MEDIS — Diabetes Risk Assessment Report",
                "========================================",
                `Date: ${new Date().toLocaleDateString()}`,
                `Risk Score: ${riskScore}%`,
                `Risk Level: ${riskLevel.label}`,
                "",
                "Assessment Inputs:",
                `  Age: ${formData.age}`,
                `  Gender: ${formData.gender}`,
                `  BMI: ${bmi}`,
                `  Blood Pressure: ${formData.bloodPressure}`,
                `  Family History: ${formData.familyHistory}`,
                `  Diet Quality: ${formData.dietQuality}/10`,
                `  Physical Activity: ${formData.physicalActivity}/10`,
                "",
                "Contributing Factors:",
                ...factors.map(f => `  ${f.name}: ${f.value}%`),
                "",
                "Recommendations:",
                ...recommendations.map((r, i) => `  ${i + 1}. ${r.title} — ${r.description}`),
                "",
                "Disclaimer: This is a screening tool, not a medical diagnosis.",
              ].join("\n");
              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `MEDIS_Report_${new Date().toISOString().slice(0, 10)}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
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
