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
import AlphaRestingStateTest from "../tests/AlphaRestingStateTest";
import AlphaReactiveStateTest from "../tests/AlphaReactiveStateTest";
import TenMinEyesClosedTest from "../tests/10MinsOfEyesClosedTest";
import CustomRecordingTest from "../tests/CustomRecordingTest";
import SignalQualityTest from "../tests/SignalQualityTest";
import EEGAssessment from "../tests/EEGAssessment";
import CustomAssessment from "../tests/CustomAssessment";
import HeadbandSelection from "../tests/HeadbandSelection";

interface MindModuleProps {
  onBack: () => void;
}

const MindModule: React.FC<MindModuleProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [signalQualityGood, setSignalQualityGood] = useState<boolean | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<"neurosity" | "muse" | null>(null);

  // Mock EEG data tailored to each device
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
      setSelectedDevice("neurosity"); // Default to neurosity; change to "muse" if preferred
      setSignalQualityGood(true); // Assume good signal quality for simplicity
    } else {
      setIsConnected(false);
      setSelectedDevice(null);
      setSignalQualityGood(null);
    }
  };

  if (currentTest === "signal_quality") {
    return (
      <SignalQualityTest
        onBack={() => setCurrentTest(null)}
        onComplete={(isGood) => {
          setSignalQualityGood(isGood);
          if (isGood) {
            setIsConnected(true);
          }
          setCurrentTest(null);
        }}
      />
    );
  }

  if (currentTest) {
    const testComponents: { [key: string]: React.ReactNode } = {
      custom_recording: (
        <CustomRecordingTest
          onBack={() => setCurrentTest(null)}
          onComplete={(data) => {
            setTestResults(data);
            setCurrentTest(null);
          }}
        />
      ),
      alpha_resting_state: (
        <AlphaRestingStateTest
          onBack={() => setCurrentTest(null)}
          onComplete={(data) => {
            setTestResults(data);
            setCurrentTest(null);
          }}
        />
      ),
      alpha_reactive_state: (
        <AlphaReactiveStateTest
          onBack={() => setCurrentTest(null)}
          onComplete={(data) => {
            setTestResults(data);
            setCurrentTest(null);
          }}
        />
      ),
      "10min_eyes_closed": (
        <TenMinEyesClosedTest
          onBack={() => setCurrentTest(null)}
          onComplete={(data) => {
            setTestResults(data);
            setCurrentTest(null);
          }}
        />
      ),
      eeg_assessment: (
        <EEGAssessment
          onBack={() => setCurrentTest(null)}
          onComplete={(data) => {
            setTestResults(data);
            setCurrentTest(null);
          }}
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
    <div key={currentTest} className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative pb-20">
      <div className="max-w-md mx-auto pb-6">
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

        <div className="px-4 space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedDevice === "neurosity" ? "Neurosity Crown" : selectedDevice === "muse" ? "Muse Headband" : "EEG Headset"}</h3>
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
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-white/20"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>Signal Quality</span>
                      <span>{currentData.signal_quality}%</span>
                    </div>
                    <Progress value={currentData.signal_quality} className="mt-2 h-2" />
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Test Results</h3>
                    <Button variant="ghost" size="sm" onClick={() => setTestResults(null)}>
                      Clear
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Alpha Power</div>
                      <div className="text-xl font-bold">{testResults.alphaPower} μV</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-gray-500 text-sm">Duration</div>
                      <div className="text-xl font-bold">{testResults.duration}s</div>
                    </div>
                  </div>
                  <Button className="mt-4 w-full">View Detailed Report</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  EEG Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select a test</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "signal_quality", label: "Signal Quality", color: "bg-gray-100 text-gray-700" },
                      { id: "custom_recording", label: "Custom Recording", color: "bg-green-100 text-green-700" },
                      { id: "alpha_resting_state", label: "Alpha Resting State", color: "bg-blue-100 text-blue-700" },
                      { id: "alpha_reactive_state", label: "Alpha Reactive State", color: "bg-purple-100 text-purple-700" },
                      { id: "10min_eyes_closed", label: "10 Mins Eyes Closed", color: "bg-gray-100 text-gray-700" },
                      { id: "eeg_assessment", label: "EEG Assessment", color: "bg-yellow-100 text-yellow-700" },
                      { id: "custom_assessment", label: "Custom Assessment", color: "bg-pink-100 text-pink-700" },
                    ].map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTest(type.id)}
                        disabled={!isConnected}
                        className={`rounded-xl ${type.color} hover:bg-opacity-80`}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {!isConnected && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Connect your {selectedDevice === "neurosity" ? "Neurosity Crown" : selectedDevice === "muse" ? "Muse Headband" : "EEG Headset"} to select a test
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  <Tabs defaultValue="live" className="w-full">
                    <TabsList className="w-full bg-gray-50 rounded-t-lg rounded-b-none h-12">
                      <TabsTrigger value="live" className="flex-1 rounded-lg">
                        Live Data
                      </TabsTrigger>
                      <TabsTrigger value="analysis" className="flex-1 rounded-lg">
                        Analysis
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="live" className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                          <div className="text-blue-600 text-sm font-medium">Focus Score</div>
                          <div className="text-2xl font-bold text-blue-700">{currentData.focus}/10</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                          <div className="text-orange-600 text-sm font-medium">Stress Level</div>
                          <div className="text-2xl font-bold text-orange-700">{currentData.stress}/10</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(currentData)
                          .slice(1, 5)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <span className="text-sm font-medium text-gray-700 capitalize">{key} Wave</span>
                              <span className="text-sm font-bold text-gray-900">{value} Hz</span>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="analysis" className="p-6">
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Analysis will appear here during recording</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-500" />
                  CBT Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    {isConnected
                      ? `Based on your EEG data from the ${selectedDevice === "neurosity" ? "Neurosity Crown" : "Muse Headband"}, I notice ${
                          currentData.stress > 5 ? "elevated" : "normal"
                        } stress levels. Would you like to try a breathing exercise?`
                      : "Connect your device to receive personalized recommendations based on your brain activity."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                    Start Exercise
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                    Chat More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MindModule;