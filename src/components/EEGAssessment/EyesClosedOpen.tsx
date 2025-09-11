import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EyesClosedOpen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const totalTime = 5;
  const [stage, setStage] = useState<"eyesClosed" | "eyesOpen">("eyesClosed");
  const [timeLeft, setTimeLeft] = useState(totalTime);

  // Wave simulation
  const dt = 0.04; // 25 Hz update rate
  const numSamples = 200;
  const svgWidth = 400;
  const channelBaselines = [25, 55, 85, 115];
  const channelParams = [
    { freq: 10, amp: 15 }, // Alpha dominant
    { freq: 4, amp: 10 },  // Theta
    { freq: 20, amp: 8 },  // Beta
    { freq: 1, amp: 20 },  // Delta
  ];

  const [currentTime, setCurrentTime] = useState(0);
  const [samples, setSamples] = useState<number[][]>(
    channelParams.map((param) =>
      Array.from({ length: numSamples }, (_, i) => {
        const pastTime = 0 - (numSamples - 1 - i) * dt;
        return Math.sin(pastTime * 2 * Math.PI * param.freq) * param.amp;
      })
    )
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const newT = t + dt;
        const newSamples = channelParams.map((param, ch) => 
          Array.from({ length: numSamples }, (_, i) => {
            const pastTime = newT - (numSamples - 1 - i) * dt;
            return Math.sin(pastTime * 2 * Math.PI * param.freq) * param.amp;
          })
        );
        setSamples(newSamples);
        return newT;
      });
    }, 40); // ~25 Hz

    return () => clearInterval(interval);
  }, []);

  const generatePath = (samples: number[], baseline: number) => {
    let path = `M0 ${baseline}`;
    for (let i = 0; i < samples.length; i++) {
      const x = (i / (samples.length - 1)) * svgWidth;
      const y = baseline + samples[i];
      path += ` L${x} ${y}`;
    }
    return path;
  };

  const circumference = 2 * Math.PI * 52;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (stage === "eyesClosed") {
      setStage("eyesOpen");
      setTimeLeft(totalTime);
    } else {
      onComplete();
    }
    return () => clearInterval(timer);
  }, [timeLeft, stage, onComplete]);

  const strokeDashoffset = circumference * (1 - timeLeft / totalTime);

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
          {stage === "eyesClosed" ? "Close Your Eyes" : "Open Your Eyes"}
        </h2>

        {/* Timer Circle */}
        <div className="relative mx-auto w-32 h-32 mb-6">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transition={{ duration: 1, ease: "linear" }}
            />
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fill="#1f2937"
              fontSize="24"
              fontWeight="bold"
              className="drop-shadow-sm"
            >
              {timeLeft}
            </text>
            <text
              x="60"
              y="85"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              className="tracking-wide"
            >
              seconds
            </text>
          </svg>
        </div>

        {/* EEG Display */}
        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
          <div className="px-3 py-2 bg-gray-800 text-green-400 text-xs font-mono uppercase tracking-wider">
            EEG Channels Simulation
          </div>
          <svg viewBox="0 0 400 140" className="w-full h-32">
            {/* Vertical Grid Lines */}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2="140"
                stroke="#333"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            {/* Horizontal Grid Lines */}
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={i}
                x1="0"
                y1={i * 20}
                x2="400"
                y2={i * 20}
                stroke="#333"
                strokeWidth="0.5"
                opacity="0.3"
              />
            ))}
            {/* Channel Baselines */}
            {channelBaselines.map((baseline, i) => (
              <line
                key={i}
                x1="0"
                y1={baseline}
                x2="400"
                y2={baseline}
                stroke="#444"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
            {/* Waveforms */}
            {samples.map((waveSamples, ch) => (
              <motion.path
                key={ch}
                d={generatePath(waveSamples, channelBaselines[ch])}
                fill="none"
                stroke="#00ff41"
                strokeWidth="1.2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  pathLength: { duration: 0.3, ease: "easeInOut" },
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 2,
                }}
              />
            ))}
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default EyesClosedOpen;