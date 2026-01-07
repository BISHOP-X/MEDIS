import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Activity, TrendingUp, Heart, Calendar, 
  ArrowRight, BarChart3, Settings, Bell
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RiskMeter from "@/components/dashboard/RiskMeter";
import { cn } from "@/lib/utils";

const recentActivity = [
  { date: "Jan 5, 2024", action: "Completed Risk Assessment", score: 42 },
  { date: "Dec 20, 2023", action: "Updated Health Metrics", score: 45 },
  { date: "Dec 1, 2023", action: "Initial Assessment", score: 52 },
];

const healthTips = [
  "Try to walk for at least 30 minutes today",
  "Remember to stay hydrated - aim for 8 glasses of water",
  "Consider adding more vegetables to your next meal",
];

const Dashboard = () => {
  const currentScore = 42;
  const previousScore = 52;
  const improvement = previousScore - currentScore;

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
                Welcome back, <span className="text-gradient-primary">User</span>
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your health insights and progress.
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
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
                value: 3,
                icon: BarChart3,
                color: "text-accent",
                bg: "bg-accent/10",
                suffix: "",
              },
              {
                title: "Days Active",
                value: 45,
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
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className={cn("text-3xl font-bold", stat.color)}>
                          {stat.positive && "+"}
                          {stat.value}
                          {stat.suffix}
                        </p>
                      </div>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
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
              <Card className="h-full border-0 shadow-lg overflow-hidden">
                <CardHeader className="gradient-primary text-primary-foreground">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Risk Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-8 flex flex-col items-center">
                  <RiskMeter score={currentScore} />
                  <div className="mt-6 text-center">
                    <span className="text-xl font-bold text-risk-moderate">
                      Moderate Risk
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      You've improved by {improvement} points since your first assessment!
                    </p>
                  </div>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link to="/results">View Full Report</Link>
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
              <Card className="h-full border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date}
                          </p>
                        </div>
                        <div className={cn(
                          "text-sm font-bold px-3 py-1 rounded-full",
                          activity.score < 40 
                            ? "bg-risk-low/10 text-risk-low" 
                            : activity.score < 60 
                              ? "bg-risk-moderate/10 text-risk-moderate" 
                              : "bg-risk-high/10 text-risk-high"
                        )}>
                          {activity.score}%
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
              <Card className="h-full border-0 shadow-lg">
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
                        className="flex gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/20"
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
