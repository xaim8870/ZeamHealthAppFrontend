import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Brain,
  Activity,
  MoonStar,
  LogOut,
  Settings,
  Calendar,
  Menu,
  Sun,
  Moon,
  Camera,
} from "lucide-react";

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "therapy" | "settings">("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState("https://i.pravatar.cc/150?img=3");
  const [bio, setBio] = useState({
    name: "David Johnson",
    age: 28,
    dob: "1997-02-14",
    status: "Single",
    tagline: "Focused Mind • Balanced Body",
  });

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "therapy", label: "Therapy" },
    { key: "settings", label: "Settings" },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-black relative pb-20">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 pt-6">
        <Button variant="ghost" size="sm">
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </Button>
        <h1 className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-cyan-400">
          ZEAM HEALTH
        </h1>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Banner + Profile */}
      <div className="relative h-40 bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-cyan-700 dark:to-indigo-900 rounded-b-3xl mt-2">
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden"
          >
            <img src={profileImage} alt="User Avatar" className="w-full h-full object-cover" />
            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </motion.div>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{bio.name}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{bio.tagline}</p>
        <div className="flex justify-center gap-4 text-xs text-gray-700 dark:text-gray-300 mt-2">
          <span>Age: {bio.age}</span>
          <span>DOB: {bio.dob}</span>
          <span>Status: {bio.status}</span>
        </div>
        <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-700 dark:text-white">
          Premium User
        </span>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-6 space-x-3">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => setActiveTab(tab.key as any)}
            className={`rounded-full px-5 py-1 text-sm ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white"
                : "dark:border-gray-600 dark:text-gray-300"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {activeTab === "overview" && (
          <>
            <Card className="p-4 rounded-2xl shadow-md bg-white/60 dark:bg-gray-800/50 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Last EEG</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">12 min • Deep Focus</p>
                </div>
                <Brain className="w-6 h-6 text-indigo-500" />
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

        {activeTab === "therapy" && (
          <>
            <Card className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-md shadow-md">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-cyan-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Deep Sleep Therapy
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Week 2 of 6</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-3">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "33%" }} />
              </div>
              <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">33% Complete</p>
            </Card>

            <Card className="p-5 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-yellow-700 dark:to-amber-800 shadow-md">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Upcoming Session</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Tomorrow • 9:00 PM</p>
            </Card>
          </>
        )}

        {activeTab === "settings" && (
          <Card className="p-5 rounded-2xl bg-white/60 dark:bg-gray-800/50 backdrop-blur-md shadow-md space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Account</h3>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 dark:border-gray-600 dark:text-gray-300"
            >
              <User className="w-4 h-4" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 dark:border-gray-600 dark:text-gray-300"
            >
              <Settings className="w-4 h-4" /> Preferences
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 border-red-300 dark:border-red-600 dark:text-red-400"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
