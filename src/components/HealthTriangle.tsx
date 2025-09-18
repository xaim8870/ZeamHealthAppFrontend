import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, HeartPulse, Activity, MoonStar } from "lucide-react";

interface HealthTriangleProps {
  onSelect: (module: "body" | "mind" | "activity" | "sleep") => void;
  className?: string;
}

const HealthTriangle = ({ onSelect, className }: HealthTriangleProps) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const modules = [
    {
      id: "body",
      label: "Physical Health",
      icon: HeartPulse,
      color: "from-cyan-400 via-blue-500 to-blue-600",
      strokeColor: "#3b82f6",
      glowColor: "rgba(59, 130, 246, 0.8)",
      position: { x: 144, y: 50 },
      description: "Strengthen your body"
    },
    {
      id: "mind",
      label: "Mental Wellness",
      icon: Brain,
      color: "from-purple-400 via-violet-500 to-purple-600",
      strokeColor: "#8b5cf6",
      glowColor: "rgba(139, 92, 246, 0.8)",
      position: { x: 220, y: 180 },
      description: "Nurture your mind"
    },
    {
      id: "activity",
      label: "Physical Activity",
      icon: Activity,
      color: "from-emerald-400 via-green-500 to-green-600",
      strokeColor: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.8)",
      position: { x: 68, y: 180 },
      description: "Move your body"
    },
    {
      id: "sleep",
      label: "Rest & Recovery",
      icon: MoonStar,
      color: "from-indigo-400 via-indigo-500 to-indigo-600",
      strokeColor: "#6366f1",
      glowColor: "rgba(99, 102, 241, 0.8)",
      position: { x: 144, y: 130 },
      description: "Restore your energy"
    }
  ];

  const connectionVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.6,
      transition: { duration: 2, ease: "easeInOut", delay: 0.8 }
    },
    hover: {
      opacity: 1,
      strokeWidth: 4,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`relative w-80 h-80 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl z-0">
        {isDarkMode ? (
          // 🌌 Dark Mode: space particles
          [...Array(40)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -60, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))
        ) : (
          // ☀️ Light Mode: rotating lines from center
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                className="absolute w-px h-2/3 bg-gradient-to-b from-cyan-400/60 to-transparent"
                style={{ transformOrigin: "bottom center" }}
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 6 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.5
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <linearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M ${modules[0].position.x} ${modules[0].position.y} 
             L ${modules[1].position.x} ${modules[1].position.y} 
             L ${modules[2].position.x} ${modules[2].position.y} Z`}
          stroke="url(#connectionGrad)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          variants={connectionVariants}
          initial="hidden"
          animate={hoveredModule ? "hover" : "visible"}
        />
        {modules.slice(0, 3).map((module, index) => (
          <motion.line
            key={`center-${index}`}
            x1={modules[3].position.x}
            y1={modules[3].position.y}
            x2={module.position.x}
            y2={module.position.y}
            stroke="url(#connectionGrad)"
            strokeWidth="1"
            strokeDasharray="3,3"
            variants={connectionVariants}
            initial="hidden"
            animate={hoveredModule ? "hover" : "visible"}
          />
        ))}
      </svg>

      {/* Modules */}
      <AnimatePresence>
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ left: module.position.x, top: module.position.y }}
              whileHover={{ scale: 1.15 }}
              onHoverStart={() => setHoveredModule(module.id)}
              onHoverEnd={() => setHoveredModule(null)}
              onClick={() => onSelect(module.id as any)}
            >
              {/* Glow */}
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${module.color} blur-lg`}
                animate={{
                  scale: hoveredModule === module.id ? 1.4 : 1,
                  opacity: hoveredModule === module.id ? 0.8 : 0.4
                }}
                transition={{ duration: 0.3 }}
              />
              {/* Main Circle */}
              <motion.div
                className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${module.color} shadow-xl border border-white/20 flex items-center justify-center`}
                animate={{
                  boxShadow:
                    hoveredModule === module.id
                      ? `0 0 30px ${module.glowColor}`
                      : `0 0 15px ${module.glowColor}`
                }}
              >
                <Icon className="w-7 h-7" stroke={module.strokeColor} strokeWidth={2.5} />
              </motion.div>
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredModule === module.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-2 bg-black/80 text-white text-xs rounded-md shadow-md whitespace-nowrap"
                  >
                    {module.label} – {module.description}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Center Orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full shadow-lg">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-sm"
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Hint */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-300 z-30"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Tap to Explore
      </motion.div>
    </motion.div>
  );
};

export default HealthTriangle;
