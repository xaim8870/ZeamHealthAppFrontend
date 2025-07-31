import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Sun, Moon } from "lucide-react";
import HealthTriangle from "../components/HealthTriangle"; // Adjust path
import ModuleButton from "../components/ModuleButton"; // Adjust path
import NeuralPatternBackground from "../components/NeuralPatternBackground"; // Adjust path
import ColoredTriangle from "../components/ColoredTriangle"; // Adjust path
import { useNavigate } from "react-router-dom";
import type { ModuleType } from "./Index"; // Adjust path

interface HomeScreenProps {
  onChatOpen: () => void;
}

const HomeScreen = ({ onChatOpen }: HomeScreenProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const getThemeButtonIcon = () => {
    return isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen relative pb-20 dark:bg-black">
      <NeuralPatternBackground className="absolute inset-0 z-[-1]" opacity={0.15} />
      <div className="h-12 bg-transparent" />
      <div className="max-w-md mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 relative"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="absolute top-0 right-0 bg-teal-800 text-white dark:hover:text-green-800 dark:text-white-600 dark:hover:text-gray-400 dark:bg-green"
          >
            {getThemeButtonIcon()}
          </Button>
          <div className="flex items-center justify-center gap-2 mb-3">
            <ColoredTriangle />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
              ZEAM HEALTH
            </h1>
          </div>
          <p className="text-black text-sm font-medium tracking-wide dark:text-white">
            WELLNESS & ANALYTICS
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-center justify-center mb-6"
        >
          <HealthTriangle onSelect={handleModuleSelect} className="theme-exempt" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-center mt-4"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-1 dark:text-gray-400">Whole Person Health</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1 dark:bg-red-500"
              />
              Connected 
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="inline-block w-2 h-2 rounded-full bg-blue-500 mx-1 dark:bg-blue-500"
              />
              Synchronized 
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="inline-block w-2 h-2 rounded-full bg-green-500 mx-1 dark:bg-green-500"
              />
              Optimized
            </p>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <ModuleButton label="BODY" color="teal" onClick={() => handleModuleSelect("body")} className="theme-exempt" />
          <ModuleButton label="MIND" color="green" onClick={() => handleModuleSelect("mind")} className="theme-exempt" />
          <ModuleButton label="ACTIVITY" color="orange" onClick={() => handleModuleSelect("activity")} className="theme-exempt" />
          <ModuleButton label="SLEEP" color="purple" onClick={() => handleModuleSelect("sleep")} className="theme-exempt" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-6 px-1"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
            <div className="relative p-4">
              <Button
                onClick={onChatOpen}
                variant="ghost"
                className="w-full h-auto text-left p-0 text-white hover:bg-white/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">Personal Health Assistant</h3>
                    <p className="text-xs opacity-90 leading-tight">Get AI-powered insights and recommendations</p>
                  </div>
                </div>
              </Button>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={() => handleModuleSelect("provider")}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-xl px-6 dark:text-white dark:hover:text-black"
          >
            <Users className="w-4 h-4 mr-2" />
            Provider Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;