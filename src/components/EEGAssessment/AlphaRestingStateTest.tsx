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
    const num1 = Math.floor(Math.random() * 20) + 1; // Numbers between 1 and 20
    const num2 = Math.floor(Math.random() * 10) + 1; // Numbers between 1 and 10
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
  const [timeLeft, setTimeLeft] = useState(45); // 45s for 15 questions (3s each)
  const [started, setStarted] = useState(false);
  const [breathIn, setBreathIn] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<{ question: string; answer: number }[]>([]);

  // Initialize questions when component mounts
  useEffect(() => {
    setQuestions(generateMathQuestions(15)); // Generate 15 questions
  }, []);

  // Main timer for phase progression
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

  // Question cycling during math phase
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
      }, 3000); // 3 seconds per question
    }
    return () => clearInterval(questionTimer);
  }, [started, phase, currentQuestionIndex, questions.length]);

  // Breathing phase toggle every 3 seconds
  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (phase === "breathing" && started) {
      breathTimer = setInterval(() => setBreathIn((b) => !b), 3000);
    }
    return () => clearInterval(breathTimer);
  }, [phase, started]);

  // Animation variants for questions
  const questionVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 },
  };

  // Animation variants for breathing emoji
  const breathVariants = {
    inhale: { scale: 1.4, y: -10, transition: { duration: 1.5, ease: "easeInOut" } },
    exhale: { scale: 1, y: 0, transition: { duration: 1.5, ease: "easeInOut" } },
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Resting State Test</h2>
        </div>

        {/* Content Box */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-inner">
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
                <p className="text-xl font-semibold text-gray-800">
                  {questions[currentQuestionIndex]?.question || "Loading..."}
                </p>
                <motion.p
                  className="text-sm text-gray-600 mt-2"
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
                className="relative w-full h-full flex flex-col items-center justify-center"
              >
                <motion.div
                  className="text-6xl"
                  variants={breathVariants}
                  animate={breathIn ? "inhale" : "exhale"}
                >
                  {breathIn ? "😮‍💨" : "😌"}
                </motion.div>
                <div className="absolute bottom-4 text-gray-700 text-lg font-medium">
                  {breathIn ? "Inhale Deeply" : "Exhale Slowly"}
                </div>
              </motion.div>
            )}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-green-600 font-semibold"
              >
                <p className="text-lg">Resting Test Complete!</p>
                <p className="text-sm text-gray-600">Great job relaxing your mind.</p>
              </motion.div>
            )}
          </AnimatePresence>
          {started && phase !== "done" && (
            <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {timeLeft}s left
            </div>
          )}
          {phase === "math" && (
            <div className="absolute bottom-3 left-3 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          {!started && phase !== "done" && (
            <button
              onClick={() => {
                setStarted(true);
                setQuestions(generateMathQuestions(15));
                setCurrentQuestionIndex(0);
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
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
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition"
              >
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button
                onClick={onComplete}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
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