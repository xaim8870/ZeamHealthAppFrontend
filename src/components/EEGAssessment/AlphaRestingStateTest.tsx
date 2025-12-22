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

const DURATION = 30; // seconds

const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(DURATION);

  /* ===================== INIT ===================== */
  useEffect(() => {
    setQuestions(generateMathQuestions(12));
  }, []);

  /* ===================== TIMER (HIDDEN) ===================== */
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
    <div className="w-full max-w-md bg-[#0c0f14] border border-gray-700 rounded-2xl p-6 text-gray-100 shadow-xl space-y-6">
      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-gray-300 leading-relaxed"
      >
        Complete as many problems as you can and follow the instructions on the
        screen.
      </motion.p>

      {/* Questions */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4">
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

      {/* Subtle progress indicator (no numbers) */}
      <div className="mt-6 flex justify-center">
        <div className="w-20 h-[2px] bg-gray-700 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: DURATION, ease: "linear" }}
            className="h-full bg-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default AlphaRestingStateTest;
