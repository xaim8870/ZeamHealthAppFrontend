import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, MessageCircle, Wifi, WifiOff, Zap, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  const [isConnected, setIsConnected] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [selectedDevice, setSelectedDevice] = useState<"neurosity" | "muse" | null>(null);

  // Mock EEG data
  const mockEEGData = {
    neurosity: {
      currentState: isConnected ? "Focused" : "Disconnected",
      alpha: 8.2,
      beta: 12.5,
      theta: 4.1,
      delta: 2.3,
      stress: 3.2,
      focus: 7.8,
      signal_quality: 85,
    },
    muse: {
      currentState: isConnected ? "Calm" : "Disconnected",
      alpha: 9.0,
      beta: 11.0,
      theta: 3.5,
      delta: 1.8,
      stress: 2.5,
      focus: 8.5,
      signal_quality: 90,
    },
  };

  const currentData = selectedDevice ? mockEEGData[selectedDevice] : mockEEGData.neurosity;

  const handleConnect = () => {
    if (!isConnected) {
      setIsConnected(true);
      setSelectedDevice("neurosity");
    } else {
      setIsConnected(false);
      setSelectedDevice(null);
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="rounded-full" style={{ backgroundColor: "green" }}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">MIND</h1>
              </div>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="rounded-full">
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
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedDevice || "EEG Headset"}</h3>
                    <p className="text-sm opacity-90">EEG Headset</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Device Connection</span>
                <Switch checked={isConnected} onCheckedChange={handleConnect} />
              </div>
              {isConnected && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <span>Signal Quality</span>
                    <span>{currentData.signal_quality}%</span>
                  </div>
                  <Progress value={currentData.signal_quality} className="mt-2 h-2" />
                </motion.div>
              )}
            </CardContent>
          </Card>

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
                  <Button variant="outline" size="sm" className="bg-yellow-100 text-yellow-700 rounded-xl" onClick={() => setCurrentTest("eeg_assessment")}>
                    EEG Assessment
                  </Button>
                  <Button variant="outline" size="sm" className="bg-pink-100 text-pink-700 rounded-xl" onClick={() => setCurrentTest("custom_assessment")}>
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
