import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Brain } from "lucide-react";

interface AlphaReactiveProps {
  onComplete: () => void;
}

const steps = [
  "Listen for tone: Close eyes when it plays",
  "Close your eyes now",
  "Open your eyes",
  "Close your eyes",
  "Focus on the image",
  "Close your eyes",
  "Open your eyes",
];

const AlphaReactiveStateTest: React.FC<AlphaReactiveProps> = ({ onComplete }) => {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && started) {
      if (stepIndex < steps.length - 1) {
        setStepIndex((prev) => prev + 1);
        setTimeLeft(10);
      } else {
        setCompleted(true);
        setStarted(false);
        onComplete();
      }
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, stepIndex, onComplete]);

  return (
    <div className="w-full max-w-md relative">
      {/* 🌌 Starry Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#020710] via-[#06121b] to-[#031009] overflow-hidden rounded-3xl">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.2,
              boxShadow: "0 0 6px rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* 🧠 Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-[#0b1320]/90 via-[#0f2027]/85 to-[#0a1916]/90 
                   border border-emerald-700/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] 
                   backdrop-blur-2xl p-6 text-white space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            Alpha Reactive State Test
          </h2>
        </div>

        {/* Content Box */}
        <div className="h-52 bg-[#08121c]/60 border border-emerald-700/30 shadow-inner rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!completed && (
              <motion.div
                key={steps[stepIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-center px-4"
              >
                <p className="text-xl font-semibold text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  {steps[stepIndex]}
                </p>

                {/* Calming Image Step */}
                {stepIndex === 4 && (
                  <motion.img
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80"
                    alt="Calming visual"
                    className="mt-4 w-28 h-28 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] mx-auto object-cover"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>
            )}

            {/* Completion Message */}
            {completed && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-emerald-400 text-lg font-semibold">
                  Reactive Test Complete!
                </p>
                <p className="text-sm text-gray-400">Excellent response to cues.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer Badge */}
          {started && !completed && (
            <div className="absolute top-3 right-3 bg-gray-800/70 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-3">
          {!started && !completed && (
            <button
              onClick={() => {
                setStarted(true);
                setStepIndex(0);
                setTimeLeft(10);
              }}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 
                         shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300"
            >
              Begin Test
            </button>
          )}

          {completed && (
            <>
              <button
                onClick={() => {
                  setCompleted(false);
                  setStepIndex(0);
                  setTimeLeft(10);
                  setStarted(false);
                }}
                className="flex-1 py-3 rounded-xl text-gray-300 bg-gray-800/70 border border-gray-700/50 hover:bg-gray-700/70 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" /> Retry
              </button>

              <button
                onClick={onComplete}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 
                           shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300"
              >
                Finish Assessment
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AlphaReactiveStateTest;
