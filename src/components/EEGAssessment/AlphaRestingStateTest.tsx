import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AlphaRestingProps {
  onComplete: () => void;
}

/* ===================== UTIL ===================== */
const generateMathQuestions = (count: number) => {
  const ops = ["+", "-", "×"];
  return Array.from({ length: count }, () => {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const op = ops[Math.floor(Math.random() * ops.length)];
    return `${a} ${op} ${b}`;
  });
};

const DURATION = 30; // seconds (HIDDEN)

/* ===================== COMPONENT ===================== */
const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(DURATION);

  /* ===================== INIT ===================== */
  useEffect(() => {
    setQuestions(generateMathQuestions(12));
  }, []);

  /* ===================== HIDDEN TIMER ===================== */
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  /* ===================== UI ===================== */
  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8
      shadow-[0_0_60px_rgba(139,92,246,0.06)]"
    >
      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-gray-300 leading-relaxed"
      >
        Solve as many problems as you can, after the time is up follow the instructions and see how relax you can get yourself. 
        Try to stay as still as possible while calculating.
      </motion.p>

      {/* Questions */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="text-center text-lg font-medium tracking-wide text-gray-200"
          >
            {q}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AlphaRestingStateTest;
