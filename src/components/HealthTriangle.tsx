import React from "react";
import { motion } from "framer-motion";

interface HealthTriangleProps {
  onSelect: (module: "body" | "mind" | "activity" | "sleep") => void;
  className?: string; // Add optional className prop
}

const HealthTriangle = ({ onSelect, className }: HealthTriangleProps) => {
  // Animation variants for paths
  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } },
    hover: { scale: 1.03, strokeWidth: 14, transition: { duration: 0.3 } },
  };

  // Animation for center dot
  const dotVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.6, delay: 1.4, ease: "easeOut" } },
  };

  return (
    <div className={`relative w-72 h-72 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-4 overflow-hidden ${className}`}>
      {/* Enhanced Background Pattern (Neural Network-like Animation) */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.50 }}>
        <defs>
          <pattern id="neural-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            {/* Existing Circles with New Colors */}
            <motion.circle
              cx="10"
              cy="10"
              r="3"
              fill="#EF4444" // Red
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
              className="dark:fill-opacity-50"
            />
            <motion.circle
              cx="40"
              cy="10"
              r="3"
              fill="#3B82F6" // Blue
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="dark:fill-opacity-50"
            />
            <motion.circle
              cx="10"
              cy="40"
              r="3"
              fill="#10B981" // Green
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
              className="dark:fill-opacity-50"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="3"
              fill="#8B5CF6" // Purple
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="dark:fill-opacity-50"
            />
            {/* New Circles with Additional Colors */}
            <motion.circle
              cx="25"
              cy="25"
              r="3"
              fill="#F59E0B" // Yellow/Amber
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="dark:fill-opacity-50"
            />
            <motion.circle
              cx="15"
              cy="25"
              r="3"
              fill="#F472B6" // Pink
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
              className="dark:fill-opacity-50"
            />
            <motion.circle
              cx="35"
              cy="15"
              r="3"
              fill="#34D399" // Light Green
              animate={{ r: [3, 5, 3], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="dark:fill-opacity-50"
            />
            {/* Existing Lines with New Colors */}
            <motion.line
              x1="10"
              y1="10"
              x2="40"
              y2="10"
              stroke="#3B82F6" // Blue
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="dark:stroke-opacity-50"
            />
            <motion.line
              x1="10"
              y1="10"
              x2="10"
              y2="40"
              stroke="#EF4444" // Red
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="dark:stroke-opacity-50"
            />
            <motion.line
              x1="40"
              y1="10"
              x2="40"
              y2="40"
              stroke="#10B981" // Green
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="dark:stroke-opacity-50"
            />
            <motion.line
              x1="10"
              y1="40"
              x2="40"
              y2="40"
              stroke="#8B5CF6" // Purple
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="dark:stroke-opacity-50"
            />
            <motion.line
              x1="10"
              y1="10"
              x2="40"
              y2="40"
              stroke="#EF4444" // Red
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
              className="dark:stroke-opacity-50"
            />
            {/* New Lines with Additional Colors */}
            <motion.line
              x1="25"
              y1="25"
              x2="15"
              y2="25"
              stroke="#F59E0B" // Yellow/Amber
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="dark:stroke-opacity-50"
            />
            <motion.line
              x1="25"
              y1="25"
              x2="35"
              y2="15"
              stroke="#F472B6" // Pink
              strokeWidth="0.5"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="dark:stroke-opacity-50"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#neural-pattern)" />
      </svg>

      {/* SVG Triangle Structure */}
      <svg
        width="288"
        height="288"
        viewBox="0 0 288 288"
        className="absolute inset-0 m-auto"
      >
        {/* BODY - Blue (Physical Health) */}
        <motion.path
          variants={pathVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          d="M 72 216 L 144 72"
          stroke="#3B82F6"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          onClick={() => onSelect("body")}
          className="cursor-pointer touch-none dark:stroke-opacity-100"
        >
          <title>Physical Health</title>
        </motion.path>

        {/* MIND - Purple (Mental Health) */}
        <motion.path
          variants={pathVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          d="M 144 72 L 216 216"
          stroke="#8B5CF6"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          onClick={() => onSelect("mind")}
          className="cursor-pointer touch-none dark:stroke-opacity-100"
        >
          <title>Mental Wellness</title>
        </motion.path>

        {/* ACTIVITY - Green (Exercise) */}
        <motion.path
          variants={pathVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          d="M 72 216 L 216 216"
          stroke="#10B981"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          onClick={() => onSelect("activity")}
          className="cursor-pointer touch-none dark:stroke-opacity-100"
        >
          <title>Physical Activity</title>
        </motion.path>

        {/* SLEEP - Indigo (Rest) */}
        <motion.path
          variants={pathVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          d="M 72 234 L 216 234"
          stroke="#6366F1"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          onClick={() => onSelect("sleep")}
          className="cursor-pointer touch-none dark:stroke-opacity-100"
        >
          <title>Rest & Recovery</title>
        </motion.path>
      </svg>

      {/* Center Dot (Neuron-like Glow) */}
      <motion.div
        variants={dotVariants}
        initial="initial"
        animate="animate"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-blue-200 rounded-full shadow-lg animate-pulse dark:bg-gray-700 dark:shadow-[0_0_12px_rgba(100,100,100,0.8)]"
        style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)" }}
      />
    </div>
  );
};

export default HealthTriangle;