import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, RotateCcw } from "lucide-react";

interface AlphaRestingProps {
  onComplete: () => void;
}

const generateMathQuestions = (count: number) => {
  const operations = ["+", "-", "×"];
  const questions: string[] = [];

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const op = operations[Math.floor(Math.random() * operations.length)];

    questions.push(`${num1} ${op} ${num2} = ?`);
  }

  return questions;
};

const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onComplete }) => {
  const TOTAL_TIME = 30;

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [questions, setQuestions] = useState<string[]>([]);

  // Generate initial questions once
  useEffect(() => {
    setQuestions(generateMathQuestions(12));
  }, []);

  // ⏱ Timer logic – ONLY depends on started + timeLeft
  useEffect(() => {
    if (!started) return;

    if (timeLeft <= 0) {
      // Timer finished – stop and let parent move to next step
      setStarted(false);
      onComplete();
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [started, timeLeft]); // ❗ no onComplete in deps

  const handleStart = () => {
    setStarted(true);
    setTimeLeft(TOTAL_TIME);
    setQuestions(generateMathQuestions(12)); // fresh set each run
  };

  const handleRetry = () => {
    setStarted(false);
    setTimeLeft(TOTAL_TIME);
    setQuestions(generateMathQuestions(12));
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Background Stars */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#030b18] via-[#06141f] to-[#04100B] rounded-3xl overflow-hidden">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.2,
              boxShadow: "0 0 6px rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-[#0b1320]/90 via-[#0f2027]/85 to-[#0a1916]/90 
                   border border-emerald-700/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] 
                   backdrop-blur-2xl p-6 text-white space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Alpha Resting State Test
          </h2>
        </div>

        {/* Questions + Timer */}
        <div className="relative min-h-52 rounded-xl bg-[#08121c]/60 border border-emerald-700/30 shadow-inner p-4 grid grid-cols-2 gap-3">
          {questions.map((q, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-900/40 p-3 rounded-lg text-center border border-emerald-600/30 shadow"
            >
              <p className="text-emerald-300 font-semibold">{q}</p>
            </motion.div>
          ))}

          {started && (
            <div className="absolute top-3 right-3 bg-gray-800/70 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          {!started && timeLeft === TOTAL_TIME && (
            <button
              onClick={handleStart}
              className="flex-1 py-3 rounded-xl font-semibold text-white 
                         bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 
                         shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] 
                         transition-all duration-300"
            >
              Begin 30-Second Test
            </button>
          )}

          {!started && timeLeft <= 0 && (
            <>
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-xl text-gray-300 bg-gray-800/70 border border-gray-700/50 hover:bg-gray-700/70 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" /> Retry
              </button>

              <button
                onClick={onComplete}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 
                           shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300"
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
