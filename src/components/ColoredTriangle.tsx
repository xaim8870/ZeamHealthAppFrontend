import React from "react";
import { motion } from "framer-motion";

const ColoredTriangle = () => {
  // Animation variants for paths
  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
  };

  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24">
        {/* Blue Side */}
        <motion.path
          d="M 6 18 L 12 6"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={pathVariants}
          initial="initial"
          animate="animate"
        />
        {/* Purple Side */}
        <motion.path
          d="M 12 6 L 18 18"
          stroke="#8B5CF6"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={pathVariants}
          initial="initial"
          animate="animate"
        />
        {/* Green Side */}
        <motion.path
          d="M 6 18 L 18 18"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          variants={pathVariants}
          initial="initial"
          animate="animate"
        />
      </svg>
    </div>
  );
};

export default ColoredTriangle;