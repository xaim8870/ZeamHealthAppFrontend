import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playBeep } from "../../utils/playBeep";

interface Props {
  onComplete: () => void;
}

type Phase = "subtract" | "breathing";

const PHASE_DURATION = 30; // seconds
const HARD_TIMEOUT = PHASE_DURATION * 2 + 5; // ✅ absolute safety net

const MentalSubtractionScreen: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>("subtract");
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATION);

  const [startNumber] = useState(
    () => Math.floor(Math.random() * 21) + 100
  );

  const completedRef = useRef(false);
  const hasBeepedRef = useRef(false);

  /* ================= HARD FAILSAFE ================= */
  useEffect(() => {
    const hardStop = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, HARD_TIMEOUT * 1000);

    return () => clearTimeout(hardStop);
  }, [onComplete]);

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
          completedRef.current = true;
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

  /* ================= UI ================= */
  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8
      shadow-[0_0_60px_rgba(239,68,68,0.05)]"
    >
      <AnimatePresence mode="wait">
        {isSubtract ? (
          <motion.div
            key="subtract"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-center space-y-6"
          >
            <p className="text-sm text-gray-300">
              Subtract 7 repeatedly in your mind.
            </p>

            <div className="flex justify-center">
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center
                border border-red-400/40"
              >
                <span className="text-4xl font-semibold text-gray-100">
                  {startNumber}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="breathing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col items-center space-y-6"
          >
            <p className="text-sm text-gray-300">
              Breathe slowly and deeply.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentalSubtractionScreen;
