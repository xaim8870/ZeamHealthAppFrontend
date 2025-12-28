import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

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

const DURATION = 30; // seconds (hidden)

/* ===================== COMPONENT ===================== */
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
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-6
      shadow-[0_0_60px_rgba(139,92,246,0.08)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-500/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-violet-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Cognitive Load Task</h2>
          <p className="text-xs text-gray-400">
            Mental arithmetic assessment
          </p>
        </div>

        <span
          className="ml-auto text-xs px-3 py-1 rounded-full
          bg-violet-500/10 text-violet-400 tracking-widest"
        >
          EEG TASK
        </span>
      </div>

      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm text-gray-300 leading-relaxed"
      >
        Solve as many problems as you can.  
        Do not speak or move while calculating.
      </motion.p>

      {/* Questions */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className=" py-1 text-center
              text-lg font-medium tracking-wide text-gray-200"
          >
            {q}
          </motion.div>
        ))}
      </div>

      {/* Subtle Progress Indicator */}
      <div className="mt-6 flex justify-center">
        <div className="w-24 h-[3px] bg-gray-700 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: DURATION, ease: "linear" }}
            className="h-full bg-violet-400"
          />
        </div>
      </div>
    </div>
  );
};

export default AlphaRestingStateTest;
