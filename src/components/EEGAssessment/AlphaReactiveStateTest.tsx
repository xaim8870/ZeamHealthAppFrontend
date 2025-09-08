import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Brain } from "lucide-react";

interface AlphaReactiveProps {
  onBack: () => void;
  onComplete: () => void;
}

const steps = [
  "Tone will play: close eyes at the tone",
  "Close your eyes",
  "Open your eyes",
  "Close your eyes",
  "Watch the image",
  "Close your eyes",
  "Open your eyes",
];

const AlphaReactiveStateTest: React.FC<AlphaReactiveProps> = ({ onBack, onComplete }) => {
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
  }, [started, timeLeft, stepIndex]);

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
            <Brain className="w-5 h-5 text-blue-500" /> Alpha Reactive State
          </h2>
        </div>

        {/* Content Box */}
        <div className="h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center relative">
          <AnimatePresence>
            {!completed && (
              <motion.span
                key={steps[stepIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-semibold text-gray-800 text-center px-4"
              >
                {steps[stepIndex]}
              </motion.span>
            )}
            {completed && (
              <motion.span
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl text-green-500 font-bold"
              >
                Reactive Test Completed!
              </motion.span>
            )}
          </AnimatePresence>
          {started && !completed && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          {!started && !completed && (
            <button
              onClick={() => {
                setStarted(true);
                setStepIndex(0);
                setTimeLeft(10);
              }}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Start
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

export default AlphaReactiveStateTest;
