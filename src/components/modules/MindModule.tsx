import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDevice } from "../../context/DeviceContext";
import neurosityImg from "../../assets/images/neurosity-headband.png";
import sAthenaImg from "../../assets/images/S-Athena.webp";
import MindBackground from "../../components/MindBackground";
 // if you have dark mode context


import {
  ArrowLeft,
  Brain,
  MessageCircle,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer";

// ✅ Import EEG Modules
import EEGAssessment from "../EEGAssessment/EEGAssessmentFlow";
import CustomAssessment from "../EEGAssessment/CustomAssessment";

interface MindModuleProps {
  onBack: () => void;
}

const MindModule: React.FC<MindModuleProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { isConnected, selectedDevice, setConnection } = useDevice();
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const handleConnect = (checked: boolean) => {
    if (checked) {
      navigate("/signal-quality");
    } else {
      setConnection(false, null);
      setCurrentTest(null);
    }
  };

  const handleEEGAssessmentComplete = (data: any) => {
    setTestResults(data);
    setCurrentTest(null);
  };

  if (currentTest) {
    const testComponents: { [key: string]: React.ReactNode } = {
      eeg_assessment: (
        <EEGAssessment
          onBack={() => setCurrentTest(null)}
          onComplete={handleEEGAssessmentComplete}
        />
      ),
      custom_assessment: (
        <CustomAssessment
          onBack={() => setCurrentTest(null)}
          onComplete={(data) => {
            setTestResults(data);
            setCurrentTest(null);
          }}
        />
      ),
    };
    return testComponents[currentTest] || null;
  }

  const deviceImage =
    selectedDevice === "neurosity"
      ? neurosityImg
      : selectedDevice === "s-athena"
      ? sAthenaImg
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br z-10 from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative pb-20 transition-colors duration-500">
       <MindBackground isDark={isDarkMode} />

      <div className="max-w-md mx-auto pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10 px-4 py-4 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
                  MIND
                </h1>
              </div>
            </div>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={`rounded-full text-xs px-3 py-1 font-medium ${
                isConnected
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {isConnected ? "Connected" : "Offline"}
            </Badge>
          </div>
        </motion.div>

        {/* Device Card */}
        <div className="px-4 space-y-6 mt-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-blue-600 dark:from-indigo-700 dark:to-indigo-900 text-white transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {deviceImage && isConnected ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: 1,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      className="relative"
                    >
                      <img
                        src={deviceImage}
                        alt={selectedDevice || "EEG Headset"}
                        className="w-12 h-12 object-contain rounded-md bg-white/20 p-1"
                      />
                      <span className="absolute inset-0 rounded-md bg-indigo-400/30 blur-xl animate-pulse"></span>
                    </motion.div>
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-white">
                      {isConnected
                        ? selectedDevice === "neurosity"
                          ? "Connected: Neurosity Crown"
                          : "Connected: Muse S Athena"
                        : "EEG Headset"}
                    </h3>
                    <p className="text-sm opacity-80">
                      {isConnected
                        ? "Ready for EEG Session"
                        : "Device Connection"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-300" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-300 dark:text-gray-400" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-white/80">Connection</span>
                <Switch checked={isConnected} onCheckedChange={handleConnect} />
              </div>
            </CardContent>
          </Card>

          {/* Alert */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 shadow-md text-center transition-colors"
            >
              <MessageCircle className="w-5 h-5 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium">
                Connect your HeadBand to continue EEG Session
              </p>
            </motion.div>
          )}

          {/* EEG Tests */}
          {isConnected && (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-100">
                  <Zap className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  EEG Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-none rounded-xl hover:opacity-90"
                    onClick={() => setCurrentTest("eeg_assessment")}
                  >
                    EEG Assessment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-none rounded-xl hover:opacity-90"
                    onClick={() => setCurrentTest("custom_assessment")}
                  >
                    Custom Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MindModule;
