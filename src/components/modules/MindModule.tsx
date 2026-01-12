// src/components/modules/MindModule.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { useDevice } from "../../context/DeviceContext";
import MindBackground from "../../components/MindBackground";
import Footer from "../Footer";

import neurosityImg from "../../assets/images/neurosity-headband.png";
import sAthenaImg from "../../assets/images/S-Athena.webp";

import {
  ArrowLeft,
  Brain,
  Wifi,
  WifiOff,
  Zap,
  Activity,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import EEGAssessment from "../EEGAssessment/EEGAssessmentFlow";
import CustomAssessment from "../EEGAssessment/CustomAssessment";

interface MindModuleProps {
  onBack: () => void;
}

const MindModule: React.FC<MindModuleProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { isConnected, selectedDevice, setConnection, disconnectDevice } =
    useDevice();

  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  const handleConnectToggle = (checked: boolean) => {
    if (!checked) {
      disconnectDevice();
      return;
    }
    setShowDevicePicker(true);
  };

  if (currentTest) {
    const components: Record<string, JSX.Element> = {
      eeg_assessment: (
        <EEGAssessment
          onBack={() => setCurrentTest(null)}
          onComplete={() => setCurrentTest(null)}
        />
      ),
      custom_assessment: (
        <CustomAssessment
          onBack={() => setCurrentTest(null)}
          onComplete={() => setCurrentTest(null)}
        />
      ),
    };
    return components[currentTest] || null;
  }

  const deviceImage =
    selectedDevice === "neurosity"
      ? neurosityImg
      : selectedDevice === "muse"
      ? sAthenaImg
      : null;

  return (
    <div className="relative min-h-screen">
      <MindBackground
        isDark={document.documentElement.classList.contains("dark")}
      />

      <div className="relative z-10 max-w-md mx-auto pb-6">
        {/* HEADER */}
        <motion.div className="sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-4 py-4 border-b dark:border-gray-800 z-10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="font-semibold text-gray-900 dark:text-white">
              ZEAM HEALTH
            </h1>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Offline"}
            </Badge>
          </div>
        </motion.div>

        <div className="px-4 space-y-6 mt-6">
          {/* DEVICE CARD */}
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isConnected && deviceImage ? (
                    <img src={deviceImage} className="w-12 h-12 rounded-md" />
                  ) : (
                    <Brain className="w-8 h-8" />
                  )}

                  <div>
                    <h3 className="font-semibold">
                      {isConnected
                        ? `Connected: ${
                            selectedDevice === "neurosity"
                              ? "Neurosity Crown"
                              : "Muse Headset"
                          }`
                        : "EEG Headset"}
                    </h3>
                    <p className="text-sm opacity-80">
                      {isConnected
                        ? "Ready for EEG Session"
                        : "Device Connection"}
                    </p>
                  </div>
                </div>

                {isConnected ? (
                  <Wifi className="text-green-300" />
                ) : (
                  <WifiOff className="text-gray-300" />
                )}
              </div>

              <div className="flex justify-between mt-4">
                <span>Connection</span>
                <Switch
                  checked={isConnected}
                  onCheckedChange={handleConnectToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* SIGNAL QUALITY CARD */}
          {isConnected && (
            <Card className="border border-cyan-400/40 bg-cyan-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <Activity className="w-5 h-5" />
                  Signal Quality Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Ensure electrode contact and signal stability before starting
                  EEG recording.
                </p>

                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
                  onClick={() => {
                    if (selectedDevice === "muse") {
                      navigate("/signal-quality-muse");
                    } else {
                      navigate("/signal-quality-neurosity");
                    }
                  }}
                >
                  Check Signal Quality
                </Button>
              </CardContent>
            </Card>
          )}

          {/* EEG TESTS */}
          {isConnected && (
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                  <Zap className="w-5 h-5 text-orange-500" /> EEG Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setCurrentTest("eeg_assessment")}>
                    EEG Assessment
                  </Button>
                  <Button onClick={() => setCurrentTest("custom_assessment")}>
                    Custom Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* DEVICE PICKER */}
      {showDevicePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-80 space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              Select Device
            </h3>

            <Button
              className="w-full"
              onClick={() => {
                setShowDevicePicker(false);
                setConnection(false, "neurosity", null);
                navigate("/connect-neurosity");
              }}
            >
              Connect Neurosity Crown
            </Button>

            <Button
              className="w-full"
              onClick={() => {
                setShowDevicePicker(false);
                setConnection(false, "muse", null);
                navigate("/connect-muse");
              }}
            >
              Connect Muse Headset
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowDevicePicker(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MindModule;
