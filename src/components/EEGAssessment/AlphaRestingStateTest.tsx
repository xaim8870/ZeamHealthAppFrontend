import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Brain } from "lucide-react";

interface AlphaRestingProps {
  onComplete: () => void;
}

const generateMathQuestions = (count: number) => {
  const operations = ["+", "-", "×"];
  const questions: { question: string; answer: number }[] = [];

  for (let i = 0; i < count; i++) {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let question: string;
    let answer: number;

    switch (operation) {
      case "+":
        question = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
        break;
      case "-":
        question = `${num1} - ${num2} = ?`;
        answer = num1 - num2;
        break;
      case "×":
        question = `${num1} × ${num2} = ?`;
        answer = num1 * num2;
        break;
      default:
        question = `${num1} + ${num2} = ?`;
        answer = num1 + num2;
    }

    questions.push({ question, answer });
  }

  return questions;
};

const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"math" | "breathing" | "done">("math");
  const [timeLeft, setTimeLeft] = useState(45);
  const [started, setStarted] = useState(false);
  const [breathIn, setBreathIn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<{ question: string; answer: number }[]>([]);

  // 🧩 Initialize Questions
  useEffect(() => {
    setQuestions(generateMathQuestions(15));
  }, []);

  // ⏱ Timer Logic
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

  // 🧮 Question Cycling
  useEffect(() => {
    let questionTimer: NodeJS.Timeout;
    if (started && phase === "math") {
      questionTimer = setInterval(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          setPhase("breathing");
          setTimeLeft(15);
        }
      }, 3000);
    }
    return () => clearInterval(questionTimer);
  }, [started, phase, currentQuestionIndex, questions.length]);

  // 🌬️ Breathing Animation
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (phase === "breathing" && started) {
      breathTimer = setInterval(() => setBreathIn((b) => !b), 3000);
    }
    return () => clearInterval(breathTimer);
  }, [phase, started]);

  // 🎞️ Animations
  const questionVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
  };

  const breathVariants = {
    inhale: { scale: 1.4, y: -10, transition: { duration: 1.5, ease: "easeInOut" } },
    exhale: { scale: 1, y: 0, transition: { duration: 1.5, ease: "easeInOut" } },
  };

  return (
    <div className="w-full max-w-md relative">
      {/* 🌌 Background */}
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

      {/* 🌿 Card */}
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
          <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            Alpha Resting State Test
          </h2>
        </div>

        {/* Display Box */}
        <div className="relative h-52 rounded-xl bg-[#08121c]/60 border border-emerald-700/30 shadow-inner flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === "math" && (
              <motion.div
                key={currentQuestionIndex}
                variants={questionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center px-4"
              >
                <p className="text-2xl font-semibold text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  {questions[currentQuestionIndex]?.question || "Loading..."}
                </p>
                <motion.p
                  className="text-sm text-gray-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Think of the answer mentally
                </motion.p>
              </motion.div>
            )}

            {phase === "breathing" && (
              <motion.div
                key="breathing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-3"
              >
                <motion.div
                  className="text-6xl"
                  variants={breathVariants}
                  animate={breathIn ? "inhale" : "exhale"}
                >
                  {breathIn ? "😮‍💨" : "😌"}
                </motion.div>
                <p className="text-emerald-300 text-lg font-medium">
                  {breathIn ? "Inhale Deeply" : "Exhale Slowly"}
                </p>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-emerald-400 text-lg font-semibold">
                  Resting Test Complete!
                </p>
                <p className="text-sm text-gray-400">Great job relaxing your mind.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timer / Question Info */}
          {started && phase !== "done" && (
            <div className="absolute top-3 right-3 bg-gray-800/70 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
              {timeLeft}s
            </div>
          )}
          {phase === "math" && (
            <div className="absolute bottom-3 left-3 bg-gray-800/70 border border-emerald-600/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
              Q {currentQuestionIndex + 1}/{questions.length}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          {!started && phase !== "done" && (
            <button
              onClick={() => {
                setStarted(true);
                setQuestions(generateMathQuestions(15));
                setCurrentQuestionIndex(0);
              }}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 
                         shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300"
            >
              Begin Test
            </button>
          )}

          {phase === "done" && (
            <>
              <button
                onClick={() => {
                  setPhase("math");
                  setTimeLeft(45);
                  setStarted(false);
                  setCurrentQuestionIndex(0);
                  setQuestions(generateMathQuestions(15));
                }}
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
