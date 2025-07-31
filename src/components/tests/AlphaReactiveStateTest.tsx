import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, RotateCcw } from 'lucide-react';

interface AlphaReactiveStateTestProps {
  onBack: () => void;
  onComplete: (data: { alphaPower: number; duration: number }) => void;
}

const steps = [
  'Tone will play; close eyes at the tone, then alternate closing/opening.',
  'Close your eyes',
  'Open your eyes',
  'Close your eyes',
  'Watch the image',
  'Close your eyes',
  'Open your eyes',
];

const STEP_DURATION = 20;
const TOTAL_DURATION = steps.length * STEP_DURATION;

const AlphaReactiveStateTest: React.FC<AlphaReactiveStateTestProps> = ({ onBack, onComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted) {
      setIsStarted(false);
      setCompleted(true);
      onComplete({ alphaPower: 9.0, duration: TOTAL_DURATION });
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, onComplete]);

  useEffect(() => {
    if (!isStarted) return;
    const stepIndex = Math.floor((TOTAL_DURATION - timeLeft) / STEP_DURATION);
    if (stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
      new Audio('https://www.soundjay.com/buttons/beep-01a.mp3')
        .play()
        .catch(() => {});
    }
  }, [timeLeft, isStarted, currentStep]);

  const handleStart = () => {
    setIsStarted(true);
    setCompleted(false);
    setTimeLeft(TOTAL_DURATION);
    setCurrentStep(0);
  };

  const handleReset = () => {
    setIsStarted(true);
    setCompleted(false);
    setTimeLeft(TOTAL_DURATION);
    setCurrentStep(0);
  };

  const progressSeconds = timeLeft % STEP_DURATION || STEP_DURATION;

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center mb-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <Brain className="ml-2 w-6 h-6" />
          <h1 className="ml-2 text-xl font-bold">Alpha Reactive State</h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          {/* Steps */}
          <div className="space-y-2 mb-4">
            {steps.map((s, idx) => (
              <p
                key={idx}
                className={`${
                  idx === currentStep ? 'font-semibold text-blue-600' : 'text-gray-600'
                }`}
              >
                {idx + 1}. {s}
              </p>
            ))}
          </div>

          {/* Instruction Box */}
          <div className="relative w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            {currentStep !== 4 ? (
              <motion.span
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-800 text-xl font-semibold text-center"
              >
                {steps[currentStep]}
              </motion.span>
            ) : (
              <motion.img
                key="anim"
                src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif"
                alt="Loading animation"
                className="w-32 h-32 rounded"
              />
            )}

            {isStarted && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                {progressSeconds}s
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {!isStarted && !completed && (
              <button
                onClick={handleStart}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Start
              </button>
            )}

            {completed && (
              <>
                <button
                  onClick={handleReset}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
                <button
                  onClick={onBack}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AlphaReactiveStateTest;
