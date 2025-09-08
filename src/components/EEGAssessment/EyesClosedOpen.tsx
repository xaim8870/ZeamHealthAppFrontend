import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Wave from "react-wavify";

const EyesClosedOpen: React.FC<{ onBack: () => void; onComplete: () => void }> = ({ onBack, onComplete }) => {
  const [stage, setStage] = useState<"eyesClosed" | "eyesOpen">("eyesClosed");
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds for testing

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (stage === "eyesClosed") {
      setStage("eyesOpen");
      setTimeLeft(5);
    } else {
      onComplete();
    }
    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  // Generate animated EEG waves
  const EEGWave = ({ color, delay }: { color: string; delay: number }) => (
    <motion.path
      d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
      stroke={color}
      strokeWidth="2"
      fill="transparent"
      initial={{ x: 200 }}
      animate={{ x: -200 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay }}
    />
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-2 text-xl font-bold">EEG Assessment</h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 relative overflow-hidden"
        >
          <h2 className="text-xl font-bold mb-4">
            {stage === "eyesClosed" ? "Close Your Eyes" : "Open Your Eyes"}
          </h2>

          {/* Timer Circle */}
          <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {/* Water-like waves inside the circle */}
            <div className="absolute bottom-0 w-full h-full">
              <Wave
                fill="#ffffff55"
                paused={false}
                options={{
                  height: 10,
                  amplitude: 20,
                  speed: 0.3,
                  points: 3,
                }}
                className="h-full"
              />
            </div>
            <span className="relative z-10">{timeLeft}s</span>
          </div>

          {/* EEG Brainwave signals under the circle */}
          <div className="mt-8">
            <svg viewBox="0 0 200 60" className="w-full h-20">
              <EEGWave color="#3b82f6" delay={0} /> {/* Blue */}
              <EEGWave color="#10b981" delay={0.5} /> {/* Green */}
              <EEGWave color="#f59e0b" delay={1} /> {/* Yellow */}
              <EEGWave color="#ef4444" delay={1.5} /> {/* Red */}
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EyesClosedOpen;
