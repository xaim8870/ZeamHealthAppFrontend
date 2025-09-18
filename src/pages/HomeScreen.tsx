import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Users,
  Sun,
  Moon,
  Brain,
  Activity,
  Bell,
  Menu,
  HeartPulse,
  MoonStar,
} from "lucide-react";
import HealthTriangle from "../components/HealthTriangle";
import NeuralPatternBackground from "../components/NeuralPatternBackground";
import SummaryCard from "../components/SummaryCard";
import InsightsChart from "../components/InsightsChart";
import HamburgerMenu from "../components/HamburgerMenu"; // ✅ Import
import { useNavigate } from "react-router-dom";
import Highlights from "../components/Highlights";
import type { ModuleType } from "./Index";

interface HomeScreenProps {
  onChatOpen: () => void;
}

const HomeScreen = ({ onChatOpen }: HomeScreenProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ moved inside component
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleModuleSelect = (module: ModuleType) => {
    const paths: { [key in ModuleType]?: string } = {
      body: "/body",
      mind: "/mind",
      activity: "/activity",
      sleep: "/sleep",
      provider: "/provider",
      chat: "/chat",
    };
    navigate(paths[module] || "/");
  };

  const getThemeButtonIcon = () =>
    isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />;

  const insightsData = [
    { name: "Readiness", value: 70, fill: "#3b82f6" },
    { name: "Sleep", value: 80, fill: "#8b5cf6" },
    { name: "Activity", value: 60, fill: "#10b981" },
  ];

  return (
    <div className="min-h-screen relative pb-20 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-cyan-900 bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <NeuralPatternBackground className="absolute inset-0 z-[-1]" opacity={0.12} />

      {/* ✅ Hamburger Menu + Overlay */}
      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(path) => {
          navigate(path);
          setMenuOpen(false);
        }}
        user={{ name: "David", loggedIn: true }}
      />

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="max-w-md mx-auto px-4 pt-6 pb-8 relative z-10">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-4"
        >
          <Button onClick={() => setMenuOpen(true)} variant="ghost" size="sm">
            <Menu className="w-6 h-6" />
          </Button>

          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-cyan-400">
            ZEAM HEALTH
          </h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full p-2"
          >
            {getThemeButtonIcon()}
          </Button>
        </motion.div>

        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Hi David 👋
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome back! You’ve burned <span className="font-bold">52</span> calories today 🔥
          </p>
        </div>

        {/* Triangle Hub */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center justify-center mb-8"
        >
          <HealthTriangle onSelect={handleModuleSelect} className="theme-exempt" />
          <p className="text-sm mt-3 text-gray-600 dark:text-gray-400 text-center">
            Tap any edge to explore{" "}
            <span className="font-semibold">Body, Mind, Activity, Sleep</span>
          </p>
        </motion.div>

        {/* Summary Section */}
        {/* ... keep your SummaryCards here ... */}

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex justify-center"
        >
          <InsightsChart data={insightsData} overallScore={72} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Highlights />
        </motion.div>

        {/* AI EEG Assistant */}
        {/* ... same as before ... */}

        {/* Alert */}
        {/* ... same as before ... */}

        {/* Provider Dashboard */}
        {/* ... same as before ... */}
      </div>
    </div>
  );
};

export default HomeScreen;
