import { motion } from "framer-motion";
import { AlertTriangle, Users, Clock, TrendingUp } from "lucide-react";
const healthyLifestyleImage = "/image.png";

const stats = [
  {
    icon: Users,
    value: "537M",
    label: "Adults with diabetes globally",
    sublabel: "1 in 10 adults affected",
  },
  {
    icon: AlertTriangle,
    value: "50%",
    label: "Cases undiagnosed",
    sublabel: "Until complications arise",
  },
  {
    icon: Clock,
    value: "10+",
    label: "Years before symptoms",
    sublabel: "Silent progression",
  },
  {
    icon: TrendingUp,
    value: "$966B",
    label: "Annual healthcare costs",
    sublabel: "Preventable with early action",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              The Silent Epidemic
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-display mt-4 mb-6">
              Diabetes is Growing.{" "}
              <span className="text-gradient-primary">Early Detection</span>{" "}
              is Key.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Type 2 Diabetes affects hundreds of millions worldwide, with half 
              of cases going undiagnosed until serious complications develop. 
              Traditional healthcare waits for symptoms—but by then, damage may 
              already be done.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              <strong className="text-foreground">MEDIS changes this paradigm.</strong>{" "}
              By analyzing lifestyle factors, family history, and health metrics, 
              our AI can identify risk years before clinical symptoms appear—giving 
              you time to take preventive action.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-muted/50 rounded-xl p-4 border border-border/50 dark:bg-muted/30 dark:border-border/30"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.sublabel}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={healthyLifestyleImage}
                alt="Black healthcare professionals representing proactive healthcare"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <motion.div
              className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-4 shadow-lg border border-border/50 max-w-[200px] dark:bg-card/80 dark:border-border/30 dark:backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full gradient-health flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prevention Rate</p>
                  <p className="text-lg font-bold text-secondary">Up to 58%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                of Type 2 Diabetes cases can be prevented with lifestyle changes
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
