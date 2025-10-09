// src/pages/SplashScreen.tsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000); // 4 seconds splash duration
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-50 
      dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Triangle Shape */}
      <motion.div
        className="relative w-24 h-24 mb-6"
        initial={{ scale: 0.7, rotate: 0, opacity: 0 }}
        animate={{
          scale: [0.7, 1.05, 1],
          rotate: [0, 10, -10, 0],
          opacity: 1,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full drop-shadow-xl"
        >
          <motion.polygon
            points="50,10 90,90 10,90"
            fill="url(#triangleGradient)"
            stroke="url(#triangleGradient)"
            strokeWidth="2"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" /> {/* Indigo-500 */}
              <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet-500 */}
              <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* App Name */}
      <motion.h1
        className="text-2xl sm:text-3xl font-bold tracking-wide text-gray-800 dark:text-gray-100 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        ZEAM HEALTH
      </motion.h1>

      {/* Loader */}
      <motion.div
        className="relative w-10 h-10 border-4 border-indigo-400 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      ></motion.div>

      {/* Subtle Pulse Ring */}
      <motion.div
        className="absolute"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-40 h-40 border border-indigo-300 dark:border-indigo-700 rounded-full blur-md opacity-40"></div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
