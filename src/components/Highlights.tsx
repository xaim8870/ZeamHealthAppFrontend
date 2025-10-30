import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Flame, Footprints, Zap, BarChart3 } from "lucide-react";

interface HighlightItemProps {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color: string;
  icon?: JSX.Element;
}

const HighlightItem = ({ label, value, goal, unit, color, icon }: HighlightItemProps) => {
  const progress = Math.min((value / goal) * 100, 100);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="mb-6 last:mb-0 group">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          {/* Glassy Icon Circle */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center 
                       backdrop-blur-xl bg-gradient-to-br from-white/10 to-gray-400/20
                       border border-white/30 shadow-inner"
          >
            {/* Force all icons to white stroke */}
            {icon && (
              <span className="text-white opacity-90">
                {icon}
              </span>
            )}
          </div>

          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
          </span>
        </div>

        <span className="text-xs font-medium 
                         text-gray-500 dark:text-gray-400 
                         bg-white/10 dark:bg-gray-800/40 
                         backdrop-blur-md border border-white/20 px-2 py-1 rounded-full">
          {value}/{goal} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2.5 bg-gradient-to-r from-gray-300/40 to-gray-400/40 
                        dark:from-gray-700/40 dark:to-gray-800/40 
                        rounded-full overflow-hidden shadow-inner backdrop-blur-md">
          <div
            className="h-2.5 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{
              width: `${animatedProgress}%`,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(230,230,230,0.9) 50%, rgba(200,200,200,1) 100%)",
              boxShadow: "0 0 8px rgba(255,255,255,0.5)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform translate-x-[-100%] animate-shine" />
          </div>
        </div>

        {animatedProgress > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 
                       bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.7)]"
            style={{ left: `${animatedProgress}%` }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(animatedProgress)}% complete
        </span>
        <span className="text-xs font-semibold text-white/80">
          +{Math.round((value / goal) * 100)}%
        </span>
      </div>
    </div>
  );
};

const Highlights = () => {
  const highlightData = [
    {
      label: "Active Calorie Burn",
      value: 452,
      goal: 550,
      unit: "cal",
      color: "#ef4444",
      icon: <Flame className="w-4 h-4" stroke="white" strokeWidth={2.2} />,
    },
    {
      label: "Steps",
      value: 8600,
      goal: 10000,
      unit: "steps",
      color: "#22c55e",
      icon: <Footprints className="w-4 h-4" stroke="white" strokeWidth={2.2} />,
    },
    {
      label: "Active Minutes",
      value: 68,
      goal: 100,
      unit: "mins",
      color: "#f59e0b",
      icon: <Zap className="w-4 h-4" stroke="white" strokeWidth={2.2} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 rounded-2xl
                 bg-gradient-to-br from-white/20 via-gray-200/10 to-gray-400/20
                 dark:from-gray-800/40 dark:via-gray-700/40 dark:to-gray-900/40
                 backdrop-blur-2xl border border-white/20 dark:border-gray-600/20
                 shadow-[0_0_25px_rgba(255,255,255,0.05)]
                 transition-all"
    >
      <h2 className="text-base font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center space-x-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     backdrop-blur-xl bg-gradient-to-br from-white/10 to-gray-400/20
                     border border-white/30 shadow-inner"
        >
          <BarChart3 className="w-4 h-4" stroke="white" strokeWidth={2.2} />
        </div>
        <span>Highlights</span>
      </h2>

      <div className="space-y-6">
        {highlightData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <HighlightItem {...item} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Highlights;

// --- CSS Animation for shine effect ---
if (typeof document !== "undefined") {
  const styles = `
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shine {
    animation: shine 2s infinite linear;
  }`;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
