import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Wind } from "lucide-react";
import { playBeep } from "../../utils/playBeep";

interface Props {
  onComplete: () => void;
}

type Phase = "subtract" | "breathing";

const PHASE_DURATION = 30; // seconds

const MentalSubtractionScreen: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>("subtract");
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATION);

  const [startNumber] = useState(
    () => Math.floor(Math.random() * 21) + 100
  );

  const hasBeepedRef = useRef(false);
  const completedRef = useRef(false); // ✅ HARD GUARD

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasBeepedRef.current) {
        hasBeepedRef.current = true;
        playBeep();
      }

      if (phase === "subtract") {
        setPhase("breathing");
        setTimeLeft(PHASE_DURATION);
        hasBeepedRef.current = false;
      } else {
        if (!completedRef.current) {
          completedRef.current = true; // ✅ ensure one-time call
          onComplete();
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, phase, onComplete]);

  const isSubtract = phase === "subtract";

  const phaseColor = isSubtract ? "#ef4444" : "#22d3ee";
  const PhaseIcon = isSubtract ? Minus : Wind;

  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          animate={{ backgroundColor: `${phaseColor}22` }}
        >
          <PhaseIcon className="w-5 h-5" style={{ color: phaseColor }} />
        </motion.div>

        <div>
          <h2 className="text-lg font-semibold">
            {isSubtract ? "Mental Subtraction" : "Recovery"}
          </h2>
          <p className="text-xs text-gray-400">
            {isSubtract
              ? "Cognitive load task"
              : "Breathing & stabilization"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSubtract ? (
          <motion.div
            key="subtract"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-gray-300">
              Subtract 7 repeatedly in your mind.
            </p>

            <div className="flex justify-center">
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center border"
                style={{ borderColor: phaseColor }}
              >
                <span className="text-4xl font-semibold">
                  {startNumber}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <p className="text-sm text-gray-300">
              Breathe slowly and deeply.
            </p>

            <motion.div
              className="w-28 h-28 rounded-full"
              style={{ border: `2px solid ${phaseColor}` }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentalSubtractionScreen;
