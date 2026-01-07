import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number;
}

const RiskMeter = ({ score }: RiskMeterProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (score < 30) return { stroke: "hsl(var(--risk-low))", text: "text-risk-low" };
    if (score < 60) return { stroke: "hsl(var(--risk-moderate))", text: "text-risk-moderate" };
    return { stroke: "hsl(var(--risk-high))", text: "text-risk-high" };
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      {/* Background Ring */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={color.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("text-5xl font-bold", color.text)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animatedScore}
        </motion.span>
        <span className="text-sm text-muted-foreground">Risk Score</span>
      </div>

      {/* Pulsing Ring Effect */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full border-4 opacity-0",
          score < 30 ? "border-risk-low" : score < 60 ? "border-risk-moderate" : "border-risk-high"
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
    </div>
  );
};

export default RiskMeter;
