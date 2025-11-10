import { useState } from "react";
import { Hand, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Users,
  Sun,
  Moon,
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
import HamburgerMenu from "../components/HamburgerMenu";
import { useNavigate } from "react-router-dom";
import Highlights from "../components/Highlights";
import TriangleChart from "@/components/TriangleChart";
import ActionButtons from "@/components/ActionButton";
import DailyJournal from "@/components/DailyJournal";
import CircularChart from "@/components/CircularChart";
import NeuralBackground from "@/components/NeuralBackground";
import type { ModuleType } from "./Index";

interface HomeScreenProps {
  onChatOpen: () => void;
}

const HomeScreen = ({ onChatOpen }: HomeScreenProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <div className=" flex justify-center items-start  min-h-screen  bg-gray-100 dark:bg-black">
      <div className="relative min-h-screen w-full max-w-md pb-20 
                  dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-cyan-900 
                  bg-gradient-to-b from-blue-50 via-white to-indigo-50 shadow-sm top-3 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
     {/** <NeuralPatternBackground 
  className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
  opacity={0.5}
/>  */}
<div className="absolute inset-0 z-10">
    <NeuralBackground />
  </div>


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

          <h1
  className="
    font-aldrich  md:text-3xl font-extrabold tracking-widest
   text-green-800 dark:text-orange-400  
    text-glow-teal animate-pulse-glow
  "
>
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
        <div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        Hi David
        <Hand className="w-3 h-3 text-gray-500" />

      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
        Welcome back! You’ve burned 
        <span className="font-bold text-gray-900 dark:text-gray-100 mx-1">52</span> 
        calories today 
        <Flame className="w-6 h-6 text-orange-700 mb-2" />
      </p>
    </div>
        {/* Triangle Hub */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative flex flex-col items-center justify-center mb-0 p-0 z-[20] ml-2"
        >
          <HealthTriangle onSelect={handleModuleSelect} className="theme-exempt" />
          <p className="text-sm mt-0 text-gray-600 dark:text-gray-400 text-center">
            
            <span className="font-semibold">Body, Mind, Activity, Sleep</span>
          </p>
        </motion.div>

        {/* ✅ Summary Section 
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4 mb-4"
        >
          <SummaryCard
            title="Readiness"
            time="5 mins ago"
            icon={<HeartPulse className="w-5 h-5 text-gray-100" />}
            stats={[
              { label: "Respiratory rate", value: "20bpm" },
              { label: "Body temperature", value: "37°C" },
            ]}
            gradientLight="from-blue-200 to-indigo-200"
            gradientDark="from-red-600 to-indigo-700"
          />
          <SummaryCard
            title="Sleep"
            time="10 hours ago"
            icon={<MoonStar className="w-5 h-5 text-gray-100" />}
            stats={[
              { label: "Sleep efficiency", value: "70" },
              { label: "Time in bed", value: "8hr 12min" },
              { label: "Resting heart rate", value: "80bpm" },
            ]}
            gradientLight="from-yellow-200 to-amber-200"
            gradientDark="from-yellow-700 to-amber-800"
          />
          <SummaryCard
            title="Activity"
            time="3 mins ago"
            icon={<Activity className="w-5 h-5 text-gray-100" />}
            stats={[
              { label: "Goal progress", value: "84" },
              { label: "Steps", value: "8,400" },
            ]}
            gradientLight="from-red-200 to-pink-200"
            gradientDark="from-red-600 to-pink-700"
          />
        </motion.div> */}
        {/* Triangles Section 
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-around mb-6"
          >
            <TriangleChart label="Sleep Performance" value={74} color="#3b82f6" />
            <TriangleChart label="Readiness Status" value={85} color="#10b981" />
            <TriangleChart label="Neuro Balance" value={63} color="#f97316" />
          </motion.div> */}
          {/* Futuristic Circular Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-around mb-6"
          >
            <CircularChart label="Sleep Performance" value={74} color="#3b82f6" />
            <CircularChart label="Readiness Status" value={85} color="#10b981" />
            <CircularChart label="Neuro Balance" value={63} color="#f97316" />
          </motion.div>


          {/* Action Buttons */}
          <ActionButtons />

          {/* Daily Journal */}
          <DailyJournal />

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex justify-center"
        >
          <InsightsChart data={insightsData} overallScore={72} />
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Highlights />
        </motion.div>

        {/* AI EEG Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 p-4 rounded-xl shadow-md bg-white dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              AI EEG Assistant
            </h3>
            <Button
              onClick={onChatOpen}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ask about your brain activity, sleep, or fitness insights.
          </p>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 p-4 rounded-xl shadow-md bg-red-100 dark:bg-red-900/40"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">
              Alerts
            </h3>
          </div>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            High stress detected in your EEG data. Consider a break.
          </p>
        </motion.div>

        {/* Provider Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-4 rounded-xl shadow-md bg-white dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Provider Dashboard
            </h3>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              View
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track patient progress and EEG data insights in one place.
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default HomeScreen;
