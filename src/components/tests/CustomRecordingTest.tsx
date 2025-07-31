import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Play, Clock, Tag, StopCircle } from "lucide-react";
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Length options from 1-10 minutes, then 15, 20, 25, 30
  const lengthOptions = [
    ...Array.from({ length: 10 }, (_, i) => ({
      value: (i + 1).toString(),
      label: `${i + 1} minute${i > 0 ? "s" : ""}`,
    })),
    { value: "15", label: "15 minutes" },
    { value: "20", label: "20 minutes" },
    { value: "25", label: "25 minutes" },
    { value: "30", label: "30 minutes" },
  ];

  const labelOptions = [
    { value: "eyes-closed", label: "Eyes Closed" },
    { value: "eyes-open", label: "Eyes Open" },
    { value: "resting", label: "Resting" },
    { value: "erp", label: "ERP" },
    { value: "oddball", label: "Oddball" },
    { value: "others", label: "Others" },
  ];

  // Play beep sound using Web Audio API
  const playBeep = () => {
    const ctx = new (window.AudioContext || window.AudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const handleStart = () => {
    const selectedLength = lengthOptions.find((opt) => opt.value === length)?.label || `${length} minute${parseInt(length) > 1 ? "s" : ""}`;
    const selectedLabel = labelOptions.find((opt) => opt.value === label)?.label || label;
    
    setRecordingText(`Recording ${selectedLength} of data labeled as ${selectedLabel.toLowerCase()}`);
    setIsRecording(true);
    setTimeLeft(parseInt(length) * 60); // Set countdown timer in seconds
    setShowCompletion(false);
  };

  const handleStop = () => {
    setIsRecording(false);
    setTimeLeft(0);
    setRecordingText("");
    setShowCompletion(false);
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRecording(false);
            setShowCompletion(true);
            playBeep();
            onComplete({
              duration: parseInt(length) * 60,
              label: labelOptions.find((opt) => opt.value === label)?.label || label,
              alphaPower: (Math.random() * 10 + 5).toFixed(1),
              timestamp: new Date().toISOString(),
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording, timeLeft, length, label, onComplete]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex flex-col max-w-md mx-auto mb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg shadow-lg mb-4 flex items-center justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-10 h-10 text-white-600" />
            </Button>
            <div className="flex items-center gap-2">
              
              <h1 className="text-xl font-bold text-white-900">Custom Recording Test</h1>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex-grow p-4 space-y-6 overflow-y-auto">
        {/* Length Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-orange-50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <label className="text-lg font-semibold text-gray-800">Recording Length</label>
              </div>
              <Select value={length} onValueChange={setLength} disabled={isRecording}>
                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white/50 focus:border-blue-500">
                  <SelectValue placeholder="Select recording length" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white/95">
                  {lengthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {/* Label Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-xl bg-orange-50 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-5 h-5 text-purple-600" />
                <label className="text-lg font-semibold text-gray-800">Recording Label</label>
              </div>
              <Select value={label} onValueChange={setLabel} disabled={isRecording}>
                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white/50 focus:border-purple-500">
                  <SelectValue placeholder="Select recording label" />
                </SelectTrigger>
                <SelectContent className="bg-white/95">
                  {labelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <p className="text-gray-700 text-sm leading-relaxed">
                1) Select recording length and label.<br />
                2) Tap "Start" to begin. A countdown will show progress.<br />
                3) Tap "Stop" to end early, or wait for the beep when complete.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recording Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm ">
            <CardContent className="p-2">
              <div className="h-48 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50">
                {showCompletion ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-6"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700">Recording Completed!</p>
                  </motion.div>
                ) : recordingText ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-6"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <div className="w-8 h-8 bg-white rounded-full"></div>
                    </motion.div>
                    <p className="text-lg font-medium text-gray-700">{recordingText}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{formatTime(timeLeft)}</p>
                    <div className="flex justify-center items-center gap-1 mt-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      ))}
                    </div>
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

      {/* Start/Stop Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 sticky bottom-0"
      >
        <div className="flex gap-3">
          <Button
            onClick={handleStart}
            disabled={isRecording}
            className="flex-1 h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-lg shadow-lg disabled:opacity-50"
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={isRecording ? { opacity: 0.7 } : {}}
            >
              <Play className="w-5 h-5" />
              Start
            </motion.div>
          </Button>
          {isRecording && (
            <Button
              onClick={handleStop}
              className="flex-1 h-14 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold text-lg shadow-lg"
            >
              <motion.div className="flex items-center justify-center gap-2">
                <StopCircle className="w-5 h-5" />
                Stop
              </motion.div>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CustomRecordingTest;