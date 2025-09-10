import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Brain } from "lucide-react";
import Wavify from "react-wavify";

interface AlphaRestingProps {
  onComplete: () => void;
}

const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onComplete }) => {
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
  }, [timeLeft, started, phase, onComplete]);

  // Breathing phase toggle every 3 seconds
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (phase === "breathing" && started) {
      breathTimer = setInterval(() => setBreathIn((b) => !b), 3000);
    }
    return () => clearInterval(breathTimer);
  }, [phase, started]);

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Resting State Test</h2>
        </div>

        {/* Content Box */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-inner">
          <AnimatePresence>
            {phase === "math" && (
              <motion.div
                key="math"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center px-4"
              >
                <p className="text-lg font-semibold text-gray-800">Solve simple math mentally</p>
                <p className="text-sm text-gray-600">e.g., 12 + 8, 15 × 3</p>
              </motion.div>
            )}
            {phase === "breathing" && (
              <motion.div
                key="breathing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Wavify
                  fill={breathIn ? "#60A5FA" : "#34D399"}
                  paused={false}
                  options={{ height: 20, amplitude: 40, speed: 0.2, points: 3 }}
                  className="h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                  {breathIn ? "Inhale Deeply" : "Exhale Slowly"}
                </div>
              </motion.div>
            )}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-green-600 font-semibold"
              >
                <p className="text-lg">Resting Test Complete!</p>
                <p className="text-sm text-gray-600">Great job relaxing your mind.</p>
              </motion.div>
            )}
          </AnimatePresence>
          {started && phase !== "done" && (
            <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {timeLeft}s left
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          {!started && phase !== "done" && (
            <button
              onClick={() => setStarted(true)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
            >
              Begin Test
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
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button
                onClick={onComplete}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Next Step
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AlphaRestingStateTest;