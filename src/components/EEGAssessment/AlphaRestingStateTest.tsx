import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Brain } from "lucide-react";
import Wavify from "react-wavify";

interface AlphaRestingProps {
  onBack: () => void;
  onComplete: () => void;
}

const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onBack, onComplete }) => {
  const [phase, setPhase] = useState<"math" | "breathing" | "done">("math");
  const [timeLeft, setTimeLeft] = useState(20);
  const [started, setStarted] = useState(false);
  const [breathIn, setBreathIn] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (started && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && started) {
      if (phase === "math") {
        setPhase("breathing");
        setTimeLeft(15);
      } else if (phase === "breathing") {
        setPhase("done");
        setStarted(false);
        onComplete();
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, started, phase]);

  // Breathing phase toggle every 3 seconds
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (phase === "breathing" && started) {
      breathTimer = setInterval(() => setBreathIn((b) => !b), 3000);
    }
    return () => clearInterval(breathTimer);
  }, [phase, started]);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" /> Alpha Resting State
          </h2>
        </div>

        {/* Content Box */}
        <div className="relative h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence>
            {phase === "math" && (
              <motion.span
                key="math"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-semibold text-gray-800"
              >
                Solve simple math equations quickly!
              </motion.span>
            )}
            {phase === "breathing" && (
              <motion.div
                key="breathing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 w-full"
              >
                <Wavify
                  fill={breathIn ? "#60A5FA" : "#34D399"}
                  paused={false}
                  options={{ height: 20, amplitude: 40, speed: 0.2, points: 3 }}
                  className="h-32"
                />
                <div className="absolute top-4 w-full text-center text-white text-xl font-bold">
                  {breathIn ? "Inhale..." : "Exhale..."}
                </div>
              </motion.div>
            )}
            {phase === "done" && (
              <motion.span
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl text-green-500 font-semibold"
              >
                Resting Test Completed!
              </motion.span>
            )}
          </AnimatePresence>
          {started && phase !== "done" && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          {!started && phase !== "done" && (
            <button
              onClick={() => setStarted(true)}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Start
            </button>
          )}
          {phase === "done" && (
            <>
              <button
                onClick={() => {
                  setPhase("math");
                  setTimeLeft(20);
                  setStarted(false);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={onComplete}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AlphaRestingStateTest;
