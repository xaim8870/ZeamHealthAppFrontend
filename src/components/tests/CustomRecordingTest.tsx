import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Play, Clock, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomRecordingTestProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

const CustomRecordingTest = ({ onBack, onComplete }: CustomRecordingTestProps) => {
  const [length, setLength] = useState("1");
  const [label, setLabel] = useState("eyes-closed");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState("");

  // Length options from 1-10 minutes, then 15, 20, 25, 30
  const lengthOptions = [
    ...Array.from({ length: 10 }, (_, i) => ({ value: (i + 1).toString(), label: `${i + 1} minute${i > 0 ? 's' : ''}` })),
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "25", label: "25 minutes" },
    { value: "30", label: "30 minutes" }
  ];

  const labelOptions = [
    { value: "eyes-closed", label: "Eyes Closed" },
    { value: "eyes-open", label: "Eyes Open" },
    { value: "resting", label: "Resting" },
    { value: "erp", label: "ERP" },
    { value: "oddball", label: "Oddball" },
    { value: "others", label: "Others" }
  ];

  const handleStart = () => {
    const selectedLength = lengthOptions.find(opt => opt.value === length)?.label || `${length} minute${parseInt(length) > 1 ? 's' : ''}`;
    const selectedLabel = labelOptions.find(opt => opt.value === label)?.label || label;
    
    setRecordingText(`Recording ${selectedLength} of data labeled as ${selectedLabel.toLowerCase()}`);
    setIsRecording(true);

    // Simulate recording completion after a short delay for demo
    setTimeout(() => {
      setIsRecording(false);
      onComplete({
        duration: parseInt(length) * 60, // Convert to seconds
        label: selectedLabel,
        alphaPower: (Math.random() * 10 + 5).toFixed(1), // Mock data
        timestamp: new Date().toISOString()
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-10 px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Custom Recording Test</h1>
            </div>
          </div>
        </motion.div>

        <div className="px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Length Selection */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <label className="text-lg font-semibold text-gray-700">Length</label>
                    </div>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="Select recording length" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {lengthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Label Selection */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-purple-500" />
                      <label className="text-lg font-semibold text-gray-700">Label</label>
                    </div>
                    <Select value={label} onValueChange={setLabel}>
                      <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500">
                        <SelectValue placeholder="Select recording label" />
                      </SelectTrigger>
                      <SelectContent>
                        {labelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed">
                    1) Configure the recording and click "Start". You'll hear a sound when the recording is complete.
                  </p>
                </CardContent>
              </Card>

              {/* Start Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleStart}
                  disabled={isRecording}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg shadow-lg"
                >
                  {isRecording ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-5 h-5" />
                      Recording...
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Start
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Panel - Recording Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardContent className="p-6 h-full">
                  <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                    {recordingText ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-8"
                      >
                        <motion.div
                          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <div className="w-8 h-8 bg-white rounded-full"></div>
                        </motion.div>
                        <p className="text-lg font-medium text-gray-700 leading-relaxed">
                          {recordingText}
                        </p>
                        {isRecording && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4"
                          >
                            <div className="flex justify-center items-center gap-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: i * 0.2 
                                  }}
                                  className="w-2 h-2 bg-blue-500 rounded-full"
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Recording status will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRecordingTest; // Changed to default export