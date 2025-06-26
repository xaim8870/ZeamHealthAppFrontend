import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Heart, Activity, Moon } from "lucide-react";

interface ModuleButtonProps {
  label: string;
  color: "teal" | "green" | "orange" | "purple";
  onClick: () => void;
  className?: string; // Optional className prop
}

const ModuleButton = ({ label, color, onClick, className }: ModuleButtonProps) => {
  const colorMap = {
    teal: {
      bg: "from-teal-500 to-cyan-600",
      shadow: "shadow-teal-200",
      icon: "text-white",
      border: "border-teal-200",
      hover: "hover:bg-teal-600/90",
      glow: "shadow-[0_0_20px_rgba(0,255,255,1.0)]", // Cyan glow
    },
    green: {
      bg: "from-green-500 to-emerald-600",
      shadow: "shadow-green-200",
      icon: "text-green-600",
      border: "border-green-200",
      hover: "hover:bg-green-500/90",
      glow: "shadow-[0_0_20px_rgba(0,255,0,1.0)]", // Lime green glow
    },
    orange: {
      bg: "from-orange-500 to-amber-600",
      shadow: "shadow-orange-200",
      icon: "text-orange-600",
      border: "border-orange-200",
      hover: "hover:bg-orange-500/90",
      glow: "shadow-[0_0_20px_rgba(255,165,0,1.0)]", // Orange glow
    },
    purple: {
      bg: "from-purple-500 to-indigo-600",
      shadow: "shadow-purple-200",
      icon: "text-purple-600",
      border: "border-purple-200",
      hover: "hover:bg-purple-500/90",
      glow: "shadow-[0_0_20px_rgba(255,0,255,1.0)]", // Magenta glow
    },
  };

  const colors = colorMap[color];

  // Define icons based on label
  const getIcon = (label: string) => {
    const iconProps = {
      size: 30,
      className: `${colors.icon} transition-colors`,
    };

    switch (label.toLowerCase()) {
      case "body":
        return <Heart {...iconProps} />;
      case "mind":
        return <Brain {...iconProps} />;
      case "activity":
        return <Activity {...iconProps} />;
      case "sleep":
        return <Moon {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative w-full"
    >
      {/* Attractive Ground Background with Enhanced Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-300 rounded-xl z-[-1] overflow-visible">
        {/* Enhanced Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.4)_15%,_transparent_70%)] opacity-80"></div>
      </div>
      <Card
        className={`cursor-pointer border-0 bg-gradient-to-br ${colors.bg} p-6 flex flex-col items-center justify-center h-32 relative ${colors.shadow} ${colors.hover} ${className} !bg-gradient-to-br !${colors.bg} z-10`}
        onClick={onClick}
        style={{ background: `linear-gradient(to bottom right, ${colors.bg.replace("from-", "").replace("to-", ", ")})` }}
      >
        {/* Neuron-like Glow at Top-Right Corner with Full Visibility */}
        <div
          className={`absolute top-2 right-2 w-6 h-6 rounded-full ${colors.glow} animate-pulse opacity-100`}
        />
        {/* Content */}
        <div className="relative z-20">
          {/* Modern Icon */}
          <div className="mb-3 relative hover:scale-105 transition-transform">
            <div className={`w-12 h-10 rounded-xl ${colors.border} flex items-center justify-center`}>
              {getIcon(label)}
            </div>
          </div>

          <span className={`text-sm font-bold ${colors.icon} transition-colors tracking-wide`}>
            {label}
          </span>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-gray-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-gray-100 rounded-full opacity-10"></div>
      </Card>
    </motion.div>
  );
};

export default ModuleButton;