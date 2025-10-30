import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, HeartPulse, Activity, MoonStar } from "lucide-react";

interface HealthTriangleProps {
  onSelect: (module: "body" | "mind" | "activity" | "sleep") => void;
  className?: string;
}

const HealthTriangle = ({ onSelect, className }: HealthTriangleProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const modules = [
    {
      id: "body",
      label: "Physical Health",
      icon: HeartPulse,
      color: "from-cyan-400 via-blue-500 to-blue-600",
      strokeColor: "white",
      position: { x: 144, y: 50 },
    },
    {
      id: "mind",
      label: "Mental Wellness",
      icon: Brain,
      color: "from-red-800 via-violet-500 to-purple-900",
      strokeColor: "white",
      position: { x: 220, y: 180 },
    },
    {
      id: "activity",
      label: "Physical Activity",
      icon: Activity,
      color: "from-emerald-400 via-green-500 to-green-600",
      strokeColor: "white",
      position: { x: 68, y: 180 },
    },
    {
      id: "sleep",
      label: "Rest & Recovery",
      icon: MoonStar,
      color: "from-indigo-400 via-indigo-500 to-indigo-600",
      strokeColor: "white",
      position: { x: 144, y: 130 },
    },
  ];

  const connectionVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1, // 100% opacity now
      transition: { duration: 1.8, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      className={`relative w-80 h-80 flex items-center justify-center p-0 mx-auto ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🔺 Strong, solid triangle sides */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glowing triangle */}
        <motion.path
          d={`M ${modules[0].position.x} ${modules[0].position.y} 
             L ${modules[1].position.x} ${modules[1].position.y} 
             L ${modules[2].position.x} ${modules[2].position.y} Z`}
          stroke="url(#connectionGrad)"
          strokeWidth="5"
          opacity={1}
          
          fill="none"
          variants={connectionVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Lines from center to modules */}
        {modules.slice(0, 3).map((module, index) => (
          <motion.line
            key={`center-${index}`}
            x1={modules[3].position.x}
            y1={modules[3].position.y}
            x2={module.position.x}
            y2={module.position.y}
            stroke="url(#connectionGrad)"
            strokeWidth="3"
            filter="url(#glow)"
            variants={connectionVariants}
            initial="hidden"
            animate="visible"
          />
        ))}
      </svg>

      {/* ⚪ Modules (now 3D-look) */}
      {modules.map((module) => {
        const Icon = module.icon;
        return (
          <motion.div
            key={module.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
            style={{ left: module.position.x, top: module.position.y }}
            onClick={() => onSelect(module.id as any)}
          >
            {/* Glowing layer behind */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${module.color} blur-xl opacity-60`}
            />

            {/* 3D Circle */}
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center 
                         shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3),inset_-3px_-3px_6px_rgba(0,0,0,0.4)]  backdrop-blur-md transition-all duration-300
                         ${isDarkMode ? "bg-white/10" : "bg-gray-900/10"}`}
              style={{
                borderColor: module.strokeColor,
              }}
            >
              <Icon
                className="w-7 h-7 "
                
                stroke="#f5f5f5" 
                strokeWidth={2} // Default width of icons
              />
            </div>
          </motion.div>
        );
      })}

      {/* 🌐 Center Orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full shadow-lg shadow-purple-500/40">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-md"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HealthTriangle;
