import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AlphaRestingProps {
  onComplete: () => void;
}

/* ===================== CONFIG ===================== */
const DURATION = 30; // seconds (HIDDEN)
const INSTRUCTION_DURATION = 5;

/* ===================== UTIL ===================== */
const generateMathQuestions = (count: number) => {
  const ops = ["×", "×", "÷", "+", "-"]; // bias toward harder ops

  return Array.from({ length: count }, () => {
    const op = ops[Math.floor(Math.random() * ops.length)];

    let a: number, b: number;

    switch (op) {
      case "×":
        a = Math.floor(Math.random() * 15) + 6;
        b = Math.floor(Math.random() * 9) + 2;
        break;

      case "÷":
        b = Math.floor(Math.random() * 9) + 2;
        a = b * (Math.floor(Math.random() * 12) + 2); // clean division
        break;

      case "+":
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 40) + 5;
        break;

      case "-":
        a = Math.floor(Math.random() * 80) + 20;
        b = Math.floor(Math.random() * 40) + 5;
        if (b > a) [a, b] = [b, a];
        break;

      default:
        a = 0;
        b = 0;
    }

    return `${a} ${op} ${b}`;
  });
};

/* ===================== COMPONENT ===================== */
const AlphaRestingStateTest: React.FC<AlphaRestingProps> = ({ onComplete }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [phase, setPhase] = useState<"instruction" | "questions">("instruction");

  /* ===================== INIT ===================== */
  useEffect(() => {
    setQuestions(generateMathQuestions(18));
  }, []);

  /* ===================== INSTRUCTION PHASE ===================== */
  useEffect(() => {
    if (phase !== "instruction") return;

    const t = setTimeout(() => {
      setPhase("questions");
    }, INSTRUCTION_DURATION * 1000);

    return () => clearTimeout(t);
  }, [phase]);

  /* ===================== HIDDEN TIMER ===================== */
  useEffect(() => {
    if (phase !== "questions") return;

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, phase, onComplete]);

  /* ===================== UI ===================== */
  return (
    <div
      className="
        relative w-full max-w-md h-[420px]
        rounded-3xl p-6
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-purple-900/30
        shadow-[0_0_70px_rgba(139,92,246,0.08)]
        flex items-center justify-center
      "
    >
      <AnimatePresence mode="wait">
        {/* ===================== INSTRUCTIONS ===================== */}
        {phase === "instruction" && (
          <motion.div
            key="instruction"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center space-y-4 px-4"
          >
            <h3 className="text-xl font-semibold text-purple-300">
              Mental Calculation Task
            </h3>

            <p className="text-sm text-purple-200/70 leading-relaxed">
              Solve as many problems as you can.
              <br />
              Stay as still as possible while calculating.
            </p>

            <p className="text-xs text-purple-400/60">
              Starting in {INSTRUCTION_DURATION} seconds
            </p>
          </motion.div>
        )}

        {/* ===================== QUESTIONS ===================== */}
        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div className="grid grid-cols-3 gap-4">
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="
                    text-center text-lg font-medium
                    tracking-wide text-gray-200
                  "
                >
                  {q}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlphaRestingStateTest;
