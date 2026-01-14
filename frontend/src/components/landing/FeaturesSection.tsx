import { motion } from "framer-motion";
import { Droplets, Zap, Brain, Shield, LineChart, Users } from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Non-Invasive Testing",
    description: "No blood tests or needles required. Simply answer questions about your lifestyle and health metrics.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Instant AI Results",
    description: "Our machine learning model analyzes your data in seconds to provide accurate risk predictions.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    description: "Understand exactly which factors contribute to your risk score with clear, visual explanations.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your health data is encrypted and never shared. We follow strict HIPAA compliance guidelines.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: LineChart,
    title: "Track Progress",
    description: "Monitor your health metrics over time and see how lifestyle changes affect your risk score.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Users,
    title: "Personalized Advice",
    description: "Receive tailored recommendations based on your unique health profile and risk factors.",
    color: "bg-accent/10 text-accent",
  },
];

const FeaturesSection = () => {
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
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Why Choose MEDIS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mt-4 mb-4">
            Advanced Features for{" "}
            <span className="text-gradient-primary">Proactive Health</span>
          </h2>
          <p className="text-muted-foreground">
            Powered by machine learning trained on thousands of health records 
            to deliver accurate, actionable insights.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/20 dark:bg-card/50 dark:hover:bg-card dark:border-border/30 dark:hover:border-primary/30"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform dark:bg-opacity-20`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none dark:from-primary/10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
