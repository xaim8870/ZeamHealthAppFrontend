import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, RotateCcw } from 'lucide-react';

const generateQuestionSets = () => {
  const operations = ['+', '-', '*'];
  const sets = [];
  for (let i = 0; i < 5; i++) {
    const questions = [];
    for (let j = 0; j < 16; j++) {
      const num1 = Math.floor(Math.random() * (j % 2 === 0 ? 10 : 99)) + 1;
      const num2 = Math.floor(Math.random() * (j % 2 === 0 ? 10 : 99)) + 1;
      const operation = operations[Math.floor(Math.random() * operations.length)];
      questions.push(`${num1} ${operation} ${num2}`);
    }
    sets.push(questions);
  }
  return sets;
};

const questionSets = generateQuestionSets();

interface AlphaRestingStateTestProps {
  onBack: () => void;
  onComplete: (data: { alphaPower: number; duration: number }) => void;
}

const AlphaRestingStateTest: React.FC<AlphaRestingStateTestProps> = ({ onBack, onComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [phase, setPhase] = useState<'math' | 'instruction' | 'breathing' | 'completed'>('math');
  const [timeLeft, setTimeLeft] = useState(30);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('out'); // Start with exhale
  const [currentQuestionSet, setCurrentQuestionSet] = useState<string[]>([]);

  useEffect(() => {
    if (isStarted && phase === 'math') {
      const randomSet = questionSets[Math.floor(Math.random() * questionSets.length)];
      setCurrentQuestionSet(randomSet);
    }
  }, [isStarted, phase]);

  // Timer transitions between phases
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            if (phase === 'math') {
              setPhase('instruction');
              return 3;
            } else if (phase === 'instruction') {
              setPhase('breathing');
              return 30;
            } else if (phase === 'breathing') {
              setPhase('completed');
              setIsStarted(false);
              return 0;
            }
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, phase]);

  // Alternate breathing phase every 3 seconds
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (isStarted && phase === 'breathing') {
      setBreathPhase('out'); // always start with exhale
      breathTimer = setInterval(() => {
        setBreathPhase((prev) => (prev === 'in' ? 'out' : 'in'));
      }, 3000);
    }
    return () => clearInterval(breathTimer);
  }, [isStarted, phase]);

  const handleStart = () => {
    setIsStarted(true);
    setPhase('math');
    setTimeLeft(30);
    setBreathPhase('out');
    const randomSet = questionSets[Math.floor(Math.random() * questionSets.length)];
    setCurrentQuestionSet(randomSet);
  };

  const handleReset = () => {
    onComplete({ alphaPower: 8.5, duration: 63 }); // Optional
    handleStart(); // Just restart the test
  };

  const getBreathingText = () => {
    if (phase === 'instruction') return 'Prepare to Breathe';
    if (phase === 'breathing') return breathPhase === 'in' ? 'Inhale' : 'Exhale';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center mb-20">
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
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 rounded-t-none"
        >
          <div className="space-y-4">
            <p className={`text-gray-600 ${phase === 'math' ? 'font-bold text-black' : ''}`}>
              1. Complete as many of the equations in 30 seconds as possible.
            </p>
            <p className={`text-gray-600 ${phase === 'instruction' ? 'font-bold text-black' : ''}`}>
              2. After the tone plays, breathe in time with the image and still your mind.
            </p>
            <p className={`text-gray-600 ${phase === 'breathing' ? 'font-bold text-black' : ''}`}>
              3. Breathe deeply. Focus gently on the breath.
            </p>

            {/* Visual Box */}
            <div className="relative">
              <motion.div
                className="w-full h-64 bg-gray-600 rounded-lg flex items-center justify-center"
                animate={{
                  scale:
                    phase === 'breathing'
                      ? breathPhase === 'in'
                        ? 1.2
                        : 0.8
                      : 1,
                }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              >
                <AnimatePresence>
                  {phase === 'math' && isStarted && currentQuestionSet.length > 0 && (
                    <motion.div
                      key="math"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-4 gap-2 text-white text-md"
                    >
                      {currentQuestionSet.map((question, index) => (
                        <div key={index} className="p-2 bg-white/30 rounded text-center">
                          {question}
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {(phase === 'instruction' || phase === 'breathing') && (
                    <motion.div
                      key="breathing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="text-white text-xl font-semibold">
                        {getBreathingText()}
                      </span>
                    </motion.div>
                  )}

                  {phase === 'completed' && (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <span className="text-white text-lg font-semibold">Test Completed!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {isStarted && phase !== 'completed' && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                  {timeLeft}s
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {phase === 'completed' && (
                <>
                  <button
                    onClick={handleReset}
                    className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </div>
                  </button>
                  <button
                    onClick={onBack}
                    className="w-full bg-gray-200 text-gray-800 font-medium py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </>
              )}
              {!isStarted && phase !== 'completed' && (
                <button
                  onClick={handleStart}
                  className="w-full bg-blue-500 text-white font-medium py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Start
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AlphaRestingStateTest;
