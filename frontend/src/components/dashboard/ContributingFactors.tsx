import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Factor {
  name: string;
  value: number;
  max: number;
}

interface ContributingFactorsProps {
  factors: Factor[];
}

const ContributingFactors = ({ factors }: ContributingFactorsProps) => {
  const getBarColor = (value: number) => {
    if (value < 30) return "bg-risk-low";
    if (value < 60) return "bg-risk-moderate";
    return "bg-risk-high";
  };

  const getImpactLabel = (value: number) => {
    if (value < 30) return { label: "Low", color: "text-risk-low" };
    if (value < 60) return { label: "Medium", color: "text-risk-moderate" };
    return { label: "High", color: "text-risk-high" };
  };

  return (
    <div className="space-y-6">
      {factors.map((factor, index) => {
        const impact = getImpactLabel(factor.value);
        return (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{factor.name}</span>
              <span className={cn("text-xs font-semibold", impact.color)}>
                {impact.label} Impact
              </span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor(factor.value))}
                initial={{ width: 0 }}
                animate={{ width: `${factor.value}%` }}
                transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ContributingFactors;
