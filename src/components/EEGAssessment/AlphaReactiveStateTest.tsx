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
        setStepIndex(stepIndex + 1);
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
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Reactive State Test</h2>
        </div>

        {/* Content Box */}
        <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center relative shadow-inner">
          <AnimatePresence>
            {!completed && (
              <motion.div
                key={steps[stepIndex]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center px-4"
              >
                <p className="text-lg font-semibold text-gray-800">{steps[stepIndex]}</p>
                {stepIndex === 4 && (
                  <img src="/path/to/calming-image.jpg" alt="Calming scene" className="mt-2 w-32 h-32 rounded-lg mx-auto" /> // Add a real calming image asset
                )}
              </motion.div>
            )}
            {completed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-green-600 font-semibold"
              >
                <p className="text-lg">Reactive Test Complete!</p>
                <p className="text-sm text-gray-600">Well done responding to cues.</p>
              </motion.div>
            )}
          </AnimatePresence>
          {started && !completed && (
            <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {timeLeft}s left
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          {!started && !completed && (
            <button
              onClick={() => {
                setStarted(true);
                setStepIndex(0);
                setTimeLeft(10);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
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
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button
                onClick={onComplete}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
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