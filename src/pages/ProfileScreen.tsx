import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  User,
  Brain,
  Activity,
  Moon,
  Sun,
  LogOut,
  Settings,
  Calendar,
  ChevronRight,
  Camera,
} from "lucide-react";

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "therapy" | "settings">("overview");
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [profileImage, setProfileImage] = useState("https://i.pravatar.cc/150?img=3");

  const user = {
    name: "David Johnson",
    age: 28,
    status: "Single",
    tagline: "Focused Mind • Balanced Body",
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfileImage(url);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* ✅ Mobile container like MindModule */}
      <div className="relative z-10 max-w-md mx-auto pb-24">
        {/* Header / Navbar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-wide">
            Profile
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-cyan-700 dark:to-indigo-900 rounded-b-3xl mt-2">
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden"
            >
              <img src={profileImage} alt="User Avatar" className="w-full h-full object-cover" />
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer shadow-md">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </motion.div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-16 text-center px-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{user.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.tagline}</p>
          <div className="flex justify-center gap-3 text-xs text-gray-700 dark:text-gray-300 mt-2">
            <span>Age: {user.age}</span>
            <span>Status: {user.status}</span>
          </div>
          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-700 dark:text-white">
            Premium User
          </span>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-6 space-x-3">
          {["overview", "therapy", "settings"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab as any)}
              className={`rounded-full px-5 py-1 text-sm ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                  : "dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 mt-6 space-y-6">
          {/* Overview */}
          {activeTab === "overview" && (
            <>
              {/* Notification Card */}
              <Card className="p-4 rounded-2xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-md shadow-md">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  Notifications
                </h3>
                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>🧠 EEG Session Completed</span>
                    <span className="text-gray-400">2h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💤 Sleep Improved</span>
                    <span className="text-gray-400">Yesterday</span>
                  </div>
                </div>
              </Card>

              {/* Activity Summary */}
              <Card className="p-4 rounded-2xl shadow-md bg-gradient-to-r from-indigo-500 to-cyan-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Last EEG</h3>
                    <p className="text-xs opacity-90">12 min • Deep Focus</p>
                  </div>
                  <Brain className="w-6 h-6" />
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-900 shadow-md">
                  <h3 className="text-xs text-gray-700 dark:text-gray-200">Activity</h3>
                  <p className="text-lg font-bold">8,400</p>
                  <span className="text-xs">Steps</span>
                </Card>
                <Card className="p-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-800 dark:to-purple-900 shadow-md">
                  <h3 className="text-xs text-gray-700 dark:text-gray-200">Sleep</h3>
                  <p className="text-lg font-bold">7h 45m</p>
                  <span className="text-xs">Last Night</span>
                </Card>
              </div>
            </>
          )}

          {/* Therapy */}
          {activeTab === "therapy" && (
            <>
              <Card className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-md shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Deep Sleep Therapy
                  </h3>
                  <Calendar className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Week 2 of 6</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-3">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "33%" }} />
                </div>
                <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                  33% Complete
                </p>
              </Card>

              <Card className="p-5 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-yellow-700 dark:to-amber-800 shadow-md">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                  Upcoming Session
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Tomorrow • 9:00 PM</p>
              </Card>
            </>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <Card className="p-5 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md shadow-md space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                Account Settings
              </h3>
              <Button variant="outline" className="w-full justify-between dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Edit Profile
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Button>
              <Button variant="outline" className="w-full justify-between dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Preferences
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between border-red-300 text-red-600 dark:border-red-600 dark:text-red-400"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Log Out
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
