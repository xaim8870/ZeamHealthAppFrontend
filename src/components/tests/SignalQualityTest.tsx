import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sun, Moon } from 'lucide-react';
import neurosityHeadband from '../../assets/images/neurosity-headband.png'; // Import the image

const SignalQualityTest = ({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: (isGood: boolean) => void;
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [signalQuality, setSignalQuality] = useState<number[]>([]);
  const sensorCount = 8;

  useEffect(() => {
    if (isStarted) {
      const qualities = Array.from({ length: sensorCount }, () =>
        Math.floor(Math.random() * 101)
      );
      setSignalQuality(qualities);
      const allGood = qualities.every((q) => q > 70);
      setTimeout(() => onComplete(allGood), 2000);
    }
  }, [isStarted, onComplete]);

  const handleStart = () => {
    setIsStarted(true);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Approximate sensor positions based on the headband image (adjust as needed)
  const sensorPositions = [
    { x: 80, y: 50 },  // Left front
    { x: 100, y: 40 }, // Left middle
    { x: 120, y: 30 }, // Left top
    { x: 180, y: 30 }, // Right top
    { x: 200, y: 40 }, // Right middle
    { x: 220, y: 50 }, // Right front
    { x: 150, y: 60 }, // Center top
    { x: 150, y: 70 }, // Center bottom
  ].map(pos => ({
    x: pos.x, // Scale to SVG viewBox (0-300)
    y: pos.y, // Scale to SVG viewBox (0-150)
  }));

  return (
    <div className={`min-h-screen bg-gradient-to-b ${isDarkMode ? 'from-gray-900 to-gray-800' : 'from-gray-100 to-gray-200'} p-4 flex items-center justify-center`}>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full bg-gradient-to-r ${isDarkMode ? 'from-gray-800 to-black' : 'from-gray-300 to-white'} text-${isDarkMode ? 'white' : 'green-900'} p-4 rounded-t-xl shadow-xl flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-green-900'}`} />
            </button>
            <Brain className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-green-900'}`} />
            <h1 className="text-xl font-bold">Signal Quality</h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/20 text-white' : 'bg-gray-200 text-green-900'}`}
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-${isDarkMode ? 'gray-900' : 'gray-50'} rounded-b-xl shadow-xl p-6 border border-${isDarkMode ? 'gray-800' : 'gray-300'}`}
        >
          <div className="space-y-4 text-center">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Neurosity Headband Signal Test
            </h2>

            <div className="relative w-full h-64 flex items-center justify-center">
              <img
                src={neurosityHeadband}
                alt="Neurosity Headband"
                className="w-full h-full object-contain absolute top-0 left-0"
              />
              <svg viewBox="0 0 300 150" className="w-full max-w-sm relative">
                {Array.from({ length: sensorCount }, (_, i) => {
                  const { x, y } = sensorPositions[i];
                  const quality = signalQuality[i] || 0;
                  const isGood = quality > 70;

                  return (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={isStarted ? 6 : 4}
                      fill={isStarted ? (isGood ? '#22C55E' : '#EF4444') : isDarkMode ? '#4A5568' : '#A0AEC0'}
                      animate={
                        isStarted
                          ? {
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.8, 1],
                            }
                          : {}
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 1.5 + Math.random() * 0.5,
                        ease: 'easeInOut',
                      }}
                      stroke={isDarkMode ? '#2D3748' : '#CBD5E0'}
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>

            {isStarted && (
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {signalQuality.every((q) => q > 70)
                  ? '✅ All sensors good. Proceeding...'
                  : '⚠️ Poor signal on some sensors. Adjust and retry.'}
              </p>
            )}

            {!isStarted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className={`w-full ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium py-2 rounded-lg transition-colors shadow-md`}
              >
                Start Test
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignalQualityTest;