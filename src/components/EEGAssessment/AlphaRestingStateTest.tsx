import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCog } from "lucide-react";

interface Props {
  phase: "instruction" | "questions";
}

/* ===================== UTIL ===================== */
const generateMathQuestions = (count: number) => {
  const ops = ["×", "×", "÷", "+", "-"];

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
        a = b * (Math.floor(Math.random() * 12) + 2);
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

const QUESTIONS = generateMathQuestions(18);

/* ===================== COMPONENT ===================== */
const AlphaRestingStateTest: React.FC<Props> = ({ phase }) => {
  return (
    <div
      className="
        relative w-full max-w-md h-[380px]
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        rounded-b-3xl
        flex items-center justify-center
        px-6 text-center
      "
    >
      <AnimatePresence mode="wait">
        {phase === "instruction" && (
          <motion.div
            key="instruction"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <BrainCog className="w-8 h-8 mx-auto text-purple-400" />

            <h3 className="text-xl font-semibold">
              Mental Calculation Task
            </h3>

            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              You will be shown math problems. Solve as many as you can in your head until you hear the tone. After the tone, take slow deep breaths.
            </p>
          </motion.div>
        )}

        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div className="grid grid-cols-3 gap-4">
              {QUESTIONS.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="text-lg font-medium text-gray-200"
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
