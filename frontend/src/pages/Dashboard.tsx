import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Activity, TrendingUp, Heart, Calendar, 
  ArrowRight, BarChart3, Settings, Bell, FileText
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskMeter from "@/components/dashboard/RiskMeter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  id: string;
  created_at: string;
  risk_score: number;
  risk_level: string;
  bmi: number;
  blood_pressure: string;
  model_used: string;
  age: number;
  gender: string;
}

const healthTips = [
  "Try to walk for at least 30 minutes today",
  "Remember to stay hydrated - aim for 8 glasses of water",
  "Consider adding more vegetables to your next meal",
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setAssessments(data || []);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const latest = assessments[0];
  const previous = assessments[1];
  const currentScore = latest ? Math.round(latest.risk_score) : 0;
  const improvement = previous ? Math.round(previous.risk_score) - currentScore : 0;
  const assessmentCount = assessments.length;

  // Days active = days since first assessment (or 0)
  const daysActive = assessments.length > 0
    ? Math.max(1, Math.round((Date.now() - new Date(assessments[assessments.length - 1].created_at).getTime()) / 86400000))
    : 0;

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low";
    if (score < 60) return "Moderate";
    return "High";
  };

  const userName = user?.name || "User";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                Welcome back, <span className="text-gradient-primary">{userName}</span>
              </h1>
              <p className="text-muted-foreground">
                {assessmentCount > 0
                  ? "Here's an overview of your health insights and progress."
                  : "Take your first assessment to see personalized insights."}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="ghost" size="icon" onClick={() => toast({ title: "No new notifications", description: "You're all caught up!" })}>
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast({ title: "Settings", description: "Profile settings coming soon." })}>
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="hero" asChild>
                <Link to="/assessment">
                  New Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Current Risk Score",
                value: currentScore,
                icon: Activity,
                color: "text-primary",
                bg: "bg-primary/10",
                suffix: "%",
              },
              {
                title: "Improvement",
                value: improvement,
                icon: TrendingUp,
                color: "text-secondary",
                bg: "bg-secondary/10",
                suffix: " pts",
                positive: true,
              },
              {
                title: "Assessments",
                value: assessmentCount,
                icon: BarChart3,
                color: "text-accent",
                bg: "bg-accent/10",
                suffix: "",
              },
              {
                title: "Days Active",
                value: daysActive,
                icon: Calendar,
                color: "text-primary",
                bg: "bg-primary/10",
                suffix: "",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-card/50 dark:border dark:border-border/30 dark:hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className={cn("text-3xl font-bold", stat.color)}>
                          {stat.positive && stat.value > 0 && "+"}
                          {stat.value}
                          {stat.suffix}
                        </p>
                      </div>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, "dark:bg-opacity-20")}>
                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Risk Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-0 shadow-lg overflow-hidden dark:border dark:border-border/30">
                <CardHeader className="gradient-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Risk Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-8 flex flex-col items-center">
                  <RiskMeter score={currentScore} />
                  <div className="mt-6 text-center">
                    <span className={cn(
                      "text-xl font-bold",
                      currentScore < 30 ? "text-risk-low" : currentScore < 60 ? "text-risk-moderate" : "text-risk-high"
                    )}>
                      {currentScore === 0 ? "No Data" : `${getRiskLabel(currentScore)} Risk`}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      {improvement > 0
                        ? `You've improved by ${improvement} points since your previous assessment!`
                        : assessmentCount > 0
                          ? "Complete more assessments to track progress."
                          : "Take your first assessment to get started."}
                    </p>
                  </div>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link to="/assessment">New Assessment</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-0 shadow-lg dark:border dark:border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No assessments yet. Take your first one!</p>
                    ) : assessments.slice(0, 3).map((a, index) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl dark:bg-muted/30"
                      >
                        <div>
                          <p className="font-medium text-sm">Completed Risk Assessment</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className={cn(
                          "text-sm font-bold px-3 py-1 rounded-full",
                          Math.round(a.risk_score) < 30
                            ? "bg-risk-low/10 text-risk-low" 
                            : Math.round(a.risk_score) < 60
                              ? "bg-risk-moderate/10 text-risk-moderate" 
                              : "bg-risk-high/10 text-risk-high"
                        )}>
                          {Math.round(a.risk_score)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full border-0 shadow-lg dark:border dark:border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    Daily Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthTips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/20 dark:bg-secondary/10 dark:border-secondary/30"
                      >
                        <div className="w-6 h-6 rounded-full gradient-health flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Tips
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Health History Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Health Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No assessment history yet.</p>
                    <Button variant="hero" className="mt-4" asChild>
                      <Link to="/assessment">Take Your First Assessment <ArrowRight className="w-4 h-4" /></Link>
                    </Button>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Risk Score</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">BMI</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Blood Pressure</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((record) => {
                        const score = Math.round(record.risk_score);
                        const status = getRiskLabel(score);
                        return (
                        <tr key={record.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 text-sm font-medium">{new Date(record.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "text-sm font-bold px-3 py-1 rounded-full",
                              score < 30
                                ? "bg-risk-low/10 text-risk-low" 
                                : score < 60
                                  ? "bg-risk-moderate/10 text-risk-moderate" 
                                  : "bg-risk-high/10 text-risk-high"
                            )}>
                              {score}%
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">{record.bmi?.toFixed(1) || "—"}</td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-medium",
                              record.blood_pressure === "Normal" 
                                ? "bg-green-100 text-green-700" 
                                : record.blood_pressure === "Elevated"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            )}>
                              {record.blood_pressure || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-medium",
                              status === "Low" 
                                ? "bg-risk-low/10 text-risk-low" 
                                : status === "Moderate"
                                  ? "bg-risk-moderate/10 text-risk-moderate"
                                  : "bg-risk-high/10 text-risk-high"
                            )}>
                              {status} Risk
                            </span>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                )}
                {assessments.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {assessments.length} record{assessments.length !== 1 ? "s" : ""}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming soon", description: "Full report download will be available soon." })}>
                    Download Full Report
                  </Button>
                </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
