import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AlphaRestingStateTest from './AlphaRestingStateTest';
import AlphaReactiveStateTest from './AlphaReactiveStateTest';
import MuseHeadBand from '../../assets/images/S-Athena.webp'; // Import the Muse headband image
import neurosityHeadband from '../../assets/images/neurosity-headband.png'; // Import the image

interface HeadbandSelectionProps {
  onBack: () => void;
  onComplete: (data: any) => void;
  assessmentData: any;
}

const HeadbandSelection: React.FC<HeadbandSelectionProps> = ({ onBack, onComplete, assessmentData }) => {
  const [selectedHeadband, setSelectedHeadband] = useState<'muse' | 'neurosity' | null>(null);
  const [currentStage, setCurrentStage] = useState<'selection' | 'eyesClosed' | 'eyesOpen' | 'alphaResting' | 'alphaReactive'>('selection');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds for eyesClosed
  const [openEyesTime, setOpenEyesTime] = useState(0); // Start from 0 for eyesOpen

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentStage === 'eyesClosed' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft === 1) {
          new Audio('https://www.soundjay.com/buttons/beep-01a.mp3').play().catch(() => {});
          setTimeout(() => {
            setCurrentStage('eyesOpen');
            setOpenEyesTime(0); // Reset open eyes timer
          }, 1000);
        }
      }, 1000);
    } else if (currentStage === 'eyesOpen' && openEyesTime < 120) {
      timer = setInterval(() => {
        setOpenEyesTime((prev) => prev + 1);
        if (openEyesTime === 119) {
          new Audio('https://www.soundjay.com/buttons/beep-01a.mp3').play().catch(() => {});
          setTimeout(() => setCurrentStage('alphaResting'), 1000);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStage, timeLeft, openEyesTime]);

  const startEyesClosed = () => {
    setCurrentStage('eyesClosed');
    setTimeLeft(120); // Reset to 2 minutes
  };

  const waveVariants = {
    animate: {
      d: [
        "M0 50 L 50 50 L 70 30 L 90 70 L 110 40 L 130 60 L 150 50 L 170 50 L 190 30 L 210 70 L 230 40 L 250 60 L 270 50 L 290 50 L 310 30 L 330 70 L 350 40 L 370 60 L 390 50 L 400 50",
        "M0 50 L 50 50 L 70 70 L 90 30 L 110 60 L 130 40 L 150 50 L 170 50 L 190 70 L 210 30 L 230 60 L 250 40 L 270 50 L 290 50 L 310 70 L 330 30 L 350 60 L 370 40 L 390 60 L 400 50",
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'mirror' as const,
        ease: 'easeInOut',
      },
    },
  };

  const circleVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const renderContent = () => {
    if (currentStage === 'selection') {
      return (
        <div className="space-y-6 mb-20">
          <h2 className="text-xl font-bold text-center">Select Your Headband</h2>
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg shadow-md ${
                selectedHeadband === 'muse' ? 'bg-blue-200' : 'bg-gray-200'
              }`}
            >
              <img
                src={MuseHeadBand}
                alt="Muse Headband"
                className="w-32 h-32 rounded-lg mb-2 object-cover mx-auto"
              />
              <label className="flex items-center justify-center gap-2">
                <input
                  type="radio"
                  name="headband"
                  value="muse"
                  checked={selectedHeadband === 'muse'}
                  onChange={() => setSelectedHeadband('muse')}
                  className="mr-2"
                />
                Muse Headband
              </label>
            </div>
            <div
              className={`p-4 rounded-lg shadow-md ${
                selectedHeadband === 'neurosity' ? 'bg-blue-200' : 'bg-gray-200'
              }`}
            >
              <img
                src={neurosityHeadband}
                alt="Neurosity Headband"
                className="w-32 h-32 rounded-lg mb-2 object-cover mx-auto"
              />
              <label className="flex items-center justify-center gap-2">
                <input
                  type="radio"
                  name="headband"
                  value="neurosity"
                  checked={selectedHeadband === 'neurosity'}
                  onChange={() => setSelectedHeadband('neurosity')}
                  className="mr-2"
                />
                Neurosity Headband
              </label>
            </div>
          </div>
          <button
            onClick={startEyesClosed}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={!selectedHeadband}
          >
            Next
          </button>
        </div>
      );
    } else if (currentStage === 'eyesClosed' || currentStage === 'eyesOpen') {
      return (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-bold">
            {currentStage === 'eyesClosed' ? 'Close Your Eyes' : 'Open Your Eyes'}
          </h2>
          <motion.div
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)' }}
            variants={circleVariants}
            animate="animate"
          >
            <motion.div
              className="absolute inset-0 bg-gray-800 opacity-30"
              style={{ borderRadius: '50%' }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(0, 0, 0, 0.2)',
                  '0 0 20px rgba(0, 0, 0, 0.3)',
                  '0 0 10px rgba(0, 0, 0, 0.2)',
                ],
                transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
            <span className="relative z-10 text-2xl font-bold text-white" style={{ textShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}>
              {currentStage === 'eyesClosed' ? timeLeft : openEyesTime}s
            </span>
          </motion.div>
          <svg width="400" height="150" className="w-full">
            <motion.path
              d="M0 75 L 50 75 L 70 55 L 90 95 L 110 65 L 130 85 L 150 75 L 170 75 L 190 55 L 210 95 L 230 65 L 250 85 L 270 75 L 290 75 L 310 55 L 330 95 L 350 65 L 370 85 L 390 75 L 400 75"
              fill="none"
              stroke="rgba(0, 183, 255, 0.8)" // Red color for heartbeat signal
              strokeWidth="1"
              initial="initial"
              variants={waveVariants}
              animate="animate"
            />
          </svg>
        </div>
      );
    } else if (currentStage === 'alphaResting') {
      return <AlphaRestingStateTest onBack={() => setCurrentStage('eyesOpen')} onComplete={() => setCurrentStage('alphaReactive')} />;
    } else if (currentStage === 'alphaReactive') {
      return <AlphaReactiveStateTest onBack={() => setCurrentStage('alphaResting')} onComplete={() => {
        onComplete({ ...assessmentData, headband: selectedHeadband });
      }} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg shadow mb-4 flex items-center"
        >
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="ml-2 text-xl font-bold">EEG Assessment</h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default HeadbandSelection;