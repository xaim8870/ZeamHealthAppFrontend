import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Flame,
  Footprints,
  Zap,
  BarChart3,
} from "lucide-react";

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

  const getGradient = (color: string) => {
    const gradients = {
      '#ef4444': 'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      '#22c55e': 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
      '#f59e0b': 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      '#8b5cf6': 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
      '#06b6d4': 'linear-gradient(90deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
    };
    return gradients[color as keyof typeof gradients] || color;
  };

  return (
    <div className="mb-4 last:mb-0 group">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: `${color}20` }}
          >
            {icon && <span className="text-sm" style={{ color }}>{icon}</span>}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
            {label}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
          {value}/{goal} {unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-2.5 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${animatedProgress}%`, background: getGradient(color) }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] animate-shine" />
          </div>
        </div>

        {animatedProgress > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg z-10"
            style={{
              left: `${animatedProgress}%`,
              boxShadow: `0 0 12px ${color}80`,
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round(animatedProgress)}% complete
        </span>
        <span className="text-xs font-bold" style={{ color }}>
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
      icon: <Flame className="w-4 h-4" />,
    },
    {
      label: "Steps",
      value: 8600,
      goal: 10000,
      unit: "steps",
      color: "#22c55e",
      icon: <Footprints className="w-4 h-4" />,
    },
    {
      label: "Active Minutes",
      value: 68,
      goal: 100,
      unit: "mins",
      color: "#f59e0b",
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  return (
    <div className="p-5 space-y-1">
      <h2 className="text-base font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center space-x-2">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
          <BarChart3 className="w-4 h-4" />
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
    </div>
  );
};

export default Highlights;

// --- CSS Animations ---
if (typeof document !== "undefined") {
  const styles = `
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shine {
    animation: shine 2s infinite;
  }`;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
