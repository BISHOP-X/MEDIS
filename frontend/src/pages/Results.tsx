import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Heart, Dumbbell, Apple, Coffee, ArrowRight, Download,
  BarChart3, Activity
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskMeter from "@/components/dashboard/RiskMeter";
import ContributingFactors from "@/components/dashboard/ContributingFactors";
import { cn } from "@/lib/utils";

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

const recommendations = [
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
  const { formData, bmi } = (location.state as { formData: FormData; bmi: string }) || {};

  // Redirect if no data
  if (!formData) {
    return <Navigate to="/assessment" replace />;
  }

  // Calculate risk score based on form data (simplified algorithm)
  const calculateRiskScore = (): number => {
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

  const riskScore = calculateRiskScore();
  
  const getRiskLevel = () => {
    if (riskScore < 30) return { label: "Low Risk", color: "text-risk-low", bg: "bg-risk-low" };
    if (riskScore < 60) return { label: "Moderate Risk", color: "text-risk-moderate", bg: "bg-risk-moderate" };
    return { label: "High Risk", color: "text-risk-high", bg: "bg-risk-high" };
  };

  const riskLevel = getRiskLevel();

  // Contributing factors for the chart
  const factors = [
    { name: "BMI", value: parseFloat(bmi) >= 25 ? 80 : 30, max: 100 },
    { name: "Age", value: formData.age > 45 ? 70 : formData.age > 35 ? 50 : 30, max: 100 },
    { name: "Blood Pressure", value: formData.bloodPressure === "High" ? 90 : formData.bloodPressure === "Elevated" ? 60 : 20, max: 100 },
    { name: "Family History", value: formData.familyHistory === "Parent or Sibling" ? 85 : formData.familyHistory === "Grandparent" ? 50 : 10, max: 100 },
    { name: "Diet", value: (10 - formData.dietQuality) * 10, max: 100 },
    { name: "Activity", value: (10 - formData.physicalActivity) * 10, max: 100 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
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
              <Card className="h-full border-0 shadow-lg overflow-hidden">
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
              <Card className="h-full border-0 shadow-lg">
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
                    "h-full border-0 shadow-md transition-all hover:shadow-lg",
                    rec.priority === "high" && "border-l-4 border-l-accent"
                  )}>
                    <CardContent className="p-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                        rec.priority === "high" 
                          ? "bg-accent/10 text-accent" 
                          : "bg-primary/10 text-primary"
                      )}>
                        <rec.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold mb-2">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                      {rec.priority === "high" && (
                        <span className="inline-block mt-3 text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
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
