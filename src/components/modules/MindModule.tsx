import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDevice } from "../../context/DeviceContext";
import neurosityImg from "../../assets/images/neurosity-headband.png";
import sAthenaImg from "../../assets/images/S-Athena.webp";

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

// ✅ Import only these two from EEGAssessment folder
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

  const handleConnect = (checked: boolean) => {
    if (checked) {
      navigate("/signal-quality"); // 👉 Goes to SignalQualityScreen
    } else {
      setConnection(false, null); // disconnect globally
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

  // Pick the right image for the connected device
  const deviceImage =
    selectedDevice === "neurosity"
      ? neurosityImg
      : selectedDevice === "s-athena"
      ? sAthenaImg
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative pb-20">
      <div className="max-w-md mx-auto pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-10 px-4 py-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="rounded-full"
                style={{ backgroundColor: "green" }}
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">MIND</h1>
              </div>
            </div>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className="rounded-full"
            >
              {isConnected ? "Connected" : "Offline"}
            </Badge>
          </div>
        </motion.div>

        {/* Device Card */}
        <div className="px-4 space-y-6 mt-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* ✅ Show device image with glowing animation */}
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
                      <span className="absolute inset-0 rounded-md bg-indigo-500/30 blur-xl animate-pulse"></span>
                    </motion.div>
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold">
                      {isConnected
                        ? selectedDevice === "neurosity"
                          ? "Connected: Neurosity Crown"
                          : "Connected: Muse S Athena"
                        : "EEG Headset"}
                    </h3>
                    <p className="text-sm opacity-80">
                      {isConnected ? "Ready for EEG Session" : "Device Connection"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <WifiOff className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Toggle Button */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection</span>
                <Switch checked={isConnected} onCheckedChange={handleConnect} />
              </div>
            </CardContent>
          </Card>

          {/* ✅ Alert Below Device Card */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 shadow-md text-center"
            >
              <MessageCircle className="w-5 h-5 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm font-medium">
                Connect your HeadBand to continue EEG Session
              </p>
            </motion.div>
          )}

          {/* EEG Assessment & Custom Assessment Buttons */}
          {isConnected && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  EEG Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-yellow-100 text-yellow-700 rounded-xl"
                    onClick={() => setCurrentTest("eeg_assessment")}
                  >
                    EEG Assessment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-pink-100 text-pink-700 rounded-xl"
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
