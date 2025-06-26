import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain } from 'lucide-react';

interface AlphaReactiveStateTestProps {
  onBack: () => void;
  onComplete: (data: { alphaPower: number; duration: number }) => void;
}

const AlphaReactiveStateTest: React.FC<AlphaReactiveStateTestProps> = ({ onBack, onComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(140); // 7 steps * 20 seconds
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    'A tone will play every 20 seconds. At the first tone close your eyes, then alternate opening and closing your eyes.',
    'Close your eyes',
    'Open your eyes',
    'Close your eyes',
    'Watch the image',
    'Close your eyes',
    'Open your eyes',
  ];

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft % 20 === 0 && timeLeft > 0) {
          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
          // Simulate tone (replace with actual audio in production)
          if (typeof window !== 'undefined' && window.document) {
            const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
            audio.play().catch((err) => console.log('Audio play failed:', err));
          }
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsStarted(false);
      onComplete({ alphaPower: 8.7, duration: 140 }); // Mock data for completion
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, onComplete]);

  const handleStart = () => {
    setIsStarted(true);
    setTimeLeft(140);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg shadow-lg mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6" />
              <h1 className="text-xl font-bold">Alpha Reactive State</h1>
            </div>
          </div>
          {/* Optional: Add a close or settings button if needed */}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 rounded-t-none"
        >
          <div className="space-y-4">
            {steps.map((step, index) => (
              <p
                key={index}
                className={`text-gray-600 ${index === currentStep ? 'text-blue-600 font-semibold' : ''}`}
              >
                {index + 1}) {step}
              </p>
            ))}
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              {isStarted && currentStep >= 4 && currentStep < 6 && (
                <motion.div
                  className="w-3/4 h-3/4 bg-gradient-to-b from-purple-200 to-purple-500 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {isStarted && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                  {Math.ceil(timeLeft / 20)}s
                </div>
              )}
            </div>
            {!isStarted && (
              <button
                onClick={handleStart}
                className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Start
              </button>
            )}
            {isStarted && timeLeft === 0 && (
              <button
                onClick={onBack}
                className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AlphaReactiveStateTest;