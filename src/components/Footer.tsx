import { motion } from "framer-motion";
import { Home, Heart, Brain, Activity, Moon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ModuleType } from "@/pages/Index";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", module: "home" as ModuleType, icon: Home, color: "text-indigo-600", path: "/" },
    { label: "Body", module: "body" as ModuleType, icon: Heart, color: "text-teal-600", path: "/body" },
    { label: "Mind", module: "mind" as ModuleType, icon: Brain, color: "text-green-600", path: "/mind" },
    { label: "Activity", module: "activity" as ModuleType, icon: Activity, color: "text-orange-600", path: "/activity" },
    { label: "Sleep", module: "sleep" as ModuleType, icon: Moon, color: "text-purple-600", path: "/sleep" },
  ];

  const buttonVariants = {
    hover: { scale: 1.1, y: -2 },
    tap: { scale: 0.95 },
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white-800 ">
      <div className="max-w-md mx-auto bg-purple-900 shadow-lg rounded-t-2xl p-4 dark:bg-gray-900">
        <nav className="flex justify-between items-center">
          {navItems.map(({ label, module, icon: Icon, color, path }) => {
            const isActive = location.pathname === path;
            return (
              <motion.button
                key={module}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? "bg-white/30 shadow-sm" : "hover:bg-white/20"
                }`}
                aria-label={label}
              >
                <Icon className={`w-5 h-5 ${color} ${isActive ? "opacity-100" : "opacity-100"}`} />
                <span className={`text-xs font-medium ${color} ${isActive ? "opacity-100" : "opacity-100"}`}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;