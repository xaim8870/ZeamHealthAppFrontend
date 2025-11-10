import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const EyesClosedOpen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  // ---------------- CONFIG ----------------
  const totalTime = 15; // seconds per stage
  const dt = 0.14; // simulation timestep
  const numSamples = 200;
  const svgWidth = 400;

  // EEG channel baselines and parameters
  const channelBaselines = [25, 55, 85, 115];
  const channelParams = [
    { freq: 10, amp: 15, speed: 1.0, phase: 0 },
    { freq: 4, amp: 10, speed: 0.6, phase: 1.3 },
    { freq: 20, amp: 8, speed: 1.8, phase: 2.6 },
    { freq: 1, amp: 22, speed: 0.4, phase: 3.4 },
  ];

  // ---------------- STATE ----------------
  const [stage, setStage] = useState<"eyesClosed" | "eyesOpen">("eyesClosed");
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [t, setT] = useState(0);
  const [samples, setSamples] = useState<number[][]>(
    channelParams.map(() => Array(numSamples).fill(0))
  );

  // ---------------- EEG WAVE ANIMATION ----------------
  useEffect(() => {
    const interval = setInterval(() => {
      setT((prev) => {
        const newT = prev + dt;
        const newSamples = channelParams.map((param) =>
          Array.from({ length: numSamples }, (_, i) => {
            const localTime =
              newT * param.speed -
              (numSamples - i) * dt * param.speed +
              param.phase;
            return Math.sin(localTime * 2 * Math.PI * param.freq) * param.amp;
          })
        );
        setSamples(newSamples);
        return newT;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const generatePath = (arr: number[], baseline: number) =>
    arr.reduce(
      (p, y, i) => p + ` L${(i / (arr.length - 1)) * svgWidth} ${baseline + y}`,
      `M0 ${baseline}`
    );

  // ---------------- TIMER LOGIC ----------------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (stage === "eyesClosed") {
      setStage("eyesOpen");
      setTimeLeft(totalTime);
    } else onComplete();
    return () => clearInterval(timer);
  }, [timeLeft, stage, onComplete]);

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - timeLeft / totalTime);

  // ---------------- UI ----------------
  return (
    <div className="relative w-full max-w-md">
      {/* 🌌 STAR BACKGROUND */}
<div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#020710] via-[#06101b] to-[#031009] overflow-hidden rounded-3xl">
  {Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="absolute rounded-full bg-white"
      style={{
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.7 + 0.2,
        boxShadow: "0 0 6px rgba(255,255,255,0.5)",
      }}
    />
  ))}
</div>

      {/* 🧠 CARD CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-2xl p-6 text-white space-y-6 border border-emerald-700/40
                  "
      >
        {/* Title */}
        <motion.h2
          key={stage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-bold text-center bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]"
        >
          {stage === "eyesClosed" ? "Close Your Eyes" : "Open Your Eyes"}
        </motion.h2>

        {/* ⏱ Circular Timer */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={stage === "eyesClosed" ? "#10B981" : "#3B82F6"} />
                <stop offset="100%" stopColor={stage === "eyesClosed" ? "#06B6D4" : "#10B981"} />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" stroke="#1f2937" strokeWidth="6" fill="none" className="opacity-30" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transition={{ duration: 1, ease: "linear" }}
              className="drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="56"
              fill="none"
              stroke={stage === "eyesClosed" ? "#10B981" : "#06B6D4"}
              strokeWidth="1"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="blur-md"
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <motion.span
              key={timeLeft}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-bold text-emerald-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
            >
              {timeLeft}
            </motion.span>
            <span className="text-xs uppercase text-gray-400 tracking-widest">sec</span>
          </div>
        </div>

        {/* ⚡ EEG Visualization */}
        <svg viewBox="0 0 400 140" className="w-full h-36">
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 20}
              x2="400"
              y2={i * 20}
              stroke="#ffffff"
              strokeWidth="0.5"
              opacity="0.8"
            />
          ))}
          {samples.map((wave, ch) => (
            <motion.path
              key={ch}
              d={generatePath(wave, channelBaselines[ch])}
              fill="none"
              stroke={`hsl(${160 + ch * 40}, 85%, 60%)`}
              strokeWidth="1.5"
              strokeLinecap="round"
              className=""
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.5 + ch * 0.6, // different timing
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>

        {/* Subtitle */}
        <p className="text-center text-sm text-gray-300 mt-2 italic">
          {stage === "eyesClosed"
            ? "Relax and remain still while we record your resting alpha state..."
            : "Now open your eyes and maintain focus — detecting reactive changes..."}
        </p>
      </motion.div>
    </div>
  );
};

export default EyesClosedOpen;
