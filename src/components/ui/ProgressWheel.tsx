import React from "react";
import { motion } from "framer-motion";

interface ProgressWheelProps {
  /** Remaining time in seconds */
  timeLeft: number;
  /** Total time in seconds */
  totalTime: number;
  /** Stroke color of the progress ring */
  color?: string;
  /** Diameter of the wheel in px */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
}

const ProgressWheel: React.FC<ProgressWheelProps> = ({
  timeLeft,
  totalTime,
  color = "#38bdf8",
  size = 160,
  strokeWidth = 10,
}) => {
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const safeTotal = Math.max(totalTime ?? 1, 1);
  const clampedLeft = Math.max(0, Math.min(timeLeft ?? safeTotal, safeTotal));

  // progress: 0 → 1
  const progress = (safeTotal - clampedLeft) / safeTotal;

  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#1f2937"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Progress ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}                 // ✅ give SVG a numeric base value
        initial={{ strokeDashoffset: circumference }}     // ✅ prevent "undefined → number"
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1, ease: "linear" }}
      />
    </svg>
  );
};

export default ProgressWheel;
