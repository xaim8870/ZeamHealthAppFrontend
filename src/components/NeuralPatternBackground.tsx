import React from "react";
import { motion } from "framer-motion";

interface NeuralPatternBackgroundProps {
  className?: string;
  opacity?: number;
}

const NeuralPatternBackground = ({ className = "", opacity = 0.15 }: NeuralPatternBackgroundProps) => {
  return (
    <svg className={`absolute inset-0 w-full h-full ${className}`} style={{ opacity }}>
      <defs>
        <pattern id="neural-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <motion.circle
            cx="10"
            cy="10"
            r="3"
            fill="#EF4444"
            animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />
          <motion.circle
            cx="40"
            cy="10"
            r="3"
            fill="#3B82F6"
            animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.circle
            cx="10"
            cy="40"
            r="3"
            fill="#10B981"
            animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
          />
          <motion.circle
            cx="40"
            cy="40"
            r="3"
            fill="#8B5CF6"
            animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
          <motion.line
            x1="10"
            y1="10"
            x2="40"
            y2="10"
            stroke="#3B82F6"
            strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.line
            x1="10"
            y1="10"
            x2="10"
            y2="40"
            stroke="#EF4444"
            strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.line
            x1="40"
            y1="10"
            x2="40"
            y2="40"
            stroke="#10B981"
            strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
          <motion.line
            x1="10"
            y1="40"
            x2="40"
            y2="40"
            stroke="#8B5CF6"
            strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
          <motion.line
            x1="10"
            y1="10"
            x2="40"
            y2="40"
            stroke="#EF4444"
            strokeWidth="0.5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#neural-pattern)" />
    </svg>
  );
};

export default NeuralPatternBackground;