import { motion } from "framer-motion";
import { Home, Heart, Brain, Activity, Moon, User, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ModuleType } from "@/pages/Index";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", module: "home" as ModuleType, icon: Home, color: "text-indigo-500", path: "/" },
    { label: "Body", module: "body" as ModuleType, icon: Heart, color: "text-teal-500", path: "/body" },
    { label: "Mind", module: "mind" as ModuleType, icon: Brain, color: "text-green-500", path: "/mind" },
    { label: "Activity", module: "activity" as ModuleType, icon: Activity, color: "text-orange-500", path: "/activity" },
    { label: "Sleep", module: "sleep" as ModuleType, icon: Moon, color: "text-purple-500", path: "/sleep" },
    { label: "Chat", module: "chat" as ModuleType, icon: MessageCircle, color: "text-sky-500", path: "/chat" }, // 🟢 New Chat button
    { label: "Profile", module: "profile" as ModuleType, icon: User, color: "text-pink-500", path: "/profile" },
  ];

  const buttonVariants = {
    hover: { scale: 1.08, y: -2 },
    tap: { scale: 0.95 },
  };

  return (
    <footer className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-full px-4">
      <div
        className="
          max-w-md mx-auto 
          rounded-2xl shadow-lg 
          px-3 py-2
          backdrop-blur-md bg-white/70 dark:bg-gray-900/40
          border border-white/30 dark:border-white/10
        "
      >
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
                className={`
                  flex flex-col items-center justify-center
                  w-14 h-12 rounded-lg mx-1 transition-colors
                  ${isActive ? "bg-white/50 dark:bg-white/10 shadow-md" : "hover:bg-white/40 dark:hover:bg-white/5"}
                `}
                aria-label={label}
              >
                <Icon
                  className={`w-5 h-5 ${color} ${
                    isActive ? "scale-110 drop-shadow-sm" : ""
                  }`}
                />
                <span
                  className={`text-[11px] font-medium ${color} ${
                    isActive ? "opacity-100" : "opacity-90"
                  }`}
                >
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
