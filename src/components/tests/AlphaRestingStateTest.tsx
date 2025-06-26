import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain } from 'lucide-react';

interface AlphaRestingStateTestProps {
  onBack: () => void;
  onComplete: (data: { alphaPower: number; duration: number }) => void;
}

const AlphaRestingStateTest: React.FC<AlphaRestingStateTestProps> = ({ onBack, onComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out' | 'rest'>('rest');

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsStarted(false);
      onComplete({ alphaPower: 8.5, duration: 30 }); // Mock data for completion
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, onComplete]);

  // Breathing animation effect
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      breathTimer = setInterval(() => {
        setBreathPhase((prev) => {
          switch (prev) {
            case 'rest':
              return 'in';
            case 'in':
              return 'hold';
            case 'hold':
              return 'out';
            case 'out':
              return 'in';
            default:
              return 'rest';
          }
        });
      }, 4000); // 4-second cycle: 1s in, 1s hold, 1s out, 1s rest
    }
    return () => clearInterval(breathTimer);
  }, [isStarted, timeLeft]);

  const handleStart = () => {
    setIsStarted(true);
    setTimeLeft(30);
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
              <h1 className="text-xl font-bold">Alpha Resting State</h1>
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
            <p className="text-gray-600">
              1) Complete as many of the equations in 30 seconds as possible.
            </p>
            <p className="text-gray-600">
              2) After the tone plays, breathe in time with the image and still your mind.
            </p>
            <p className="text-gray-600">
              3) Breathe deeply. Focus gently on the breath.
            </p>
            <div className="relative">
              <motion.div
                className="w-full h-64 bg-gradient-to-b from-blue-200 to-blue-500 rounded-lg flex items-center justify-center"
                animate={{
                  scale: breathPhase === 'in' ? 1.2 : breathPhase === 'out' ? 0.8 : 1,
                  opacity: breathPhase === 'rest' ? 0.5 : 1,
                }}
                transition={{ duration: 1 }}
              >
                {isStarted && timeLeft > 0 && (
                  <span className="text-white text-lg font-semibold">
                    {breathPhase === 'in' && 'Inhale'}
                    {breathPhase === 'hold' && 'Hold'}
                    {breathPhase === 'out' && 'Exhale'}
                  </span>
                )}
              </motion.div>
              {isStarted && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                  {timeLeft}s
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

export default AlphaRestingStateTest;