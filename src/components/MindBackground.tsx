import React from "react";
import { motion } from "framer-motion";

interface MindBackgroundProps {
  isDark: boolean;
}

const MindBackground: React.FC<MindBackgroundProps> = ({ isDark }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* 🔹 Gradient backdrop */}
      <motion.div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"
            : "bg-gradient-to-b from-blue-50 via-white to-indigo-100"
        }`}
      />

      {/* 🔹 Animated wave-like lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute top-${i * 1} left-0 w-[200%] h-[250px] opacity-20 ${
            isDark ? "bg-gradient-to-r from-cyan-600/30 to-indigo-800/30" : "bg-gradient-to-r from-blue-400/30 to-cyan-600/30"
          }`}
          style={{
            top: `${i * 30 + 10}%`,
            transform: `rotate(${i % 2 === 0 ? 2 : -2}deg)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: ["0%", "-50%", "0%"],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 🔹 Neural pulses / circular signals */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${
            isDark ? "bg-cyan-500/10" : "bg-blue-400/15"
          }`}
          style={{
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            filter: "blur(100px)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 🔹 Subtle grid overlay for a “neural lab” look */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)]"
            : "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_1px,transparent_1px)]"
        } bg-[length:30px_30px] opacity-40`}
      />
    </div>
  );
};

export default MindBackground;
