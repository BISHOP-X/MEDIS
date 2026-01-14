import { motion } from "framer-motion";
import { ClipboardList, Cpu, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import aiAnalysisImage from "@/assets/ai-analysis.jpg";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Input Your Data",
    description: "Answer simple questions about your age, weight, lifestyle habits, and family history. No invasive tests required.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analysis",
    description: "Our machine learning model processes your data using patterns from thousands of health records to calculate your risk.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Get Insights",
    description: "Receive your personalized risk score with clear explanations and actionable recommendations to improve your health.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 section-muted">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mt-4 mb-4">
            How <span className="text-gradient-primary">MEDIS</span> Works
          </h2>
          <p className="text-muted-foreground">
            Get your diabetes risk assessment in three simple steps. 
            No appointments, no waiting—just answers.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative flex gap-6"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-16 bg-gradient-to-b from-primary/50 to-transparent" />
                )}
                
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Button variant="hero" size="lg" asChild>
                <Link to="/assessment">
                  Start Your Assessment
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={aiAnalysisImage}
                alt="AI Analysis Dashboard"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-card rounded-xl p-3 shadow-lg border border-border/50"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-sm font-medium">AI Processing</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-card rounded-xl p-3 shadow-lg border border-border/50"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-risk-low/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-risk-low" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <p className="text-sm font-bold text-risk-low">Low Risk</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
