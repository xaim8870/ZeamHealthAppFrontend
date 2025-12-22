import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    () => Math.floor(Math.random() * 21) + 100 // 100–120
  );

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timeLeft <= 0) {
      playBeep();

      if (phase === "subtract") {
        setPhase("breathing");
        setTimeLeft(PHASE_DURATION);
      } else {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, phase, onComplete]);

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-md bg-[#0c0f14] border border-gray-700 rounded-2xl p-6 text-gray-100 shadow-xl space-y-8">
      <AnimatePresence mode="wait">
        {phase === "subtract" && (
          <motion.div
            key="subtract"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-gray-300">
              Close your eyes. Start at the number below and subtract 7 repeatedly
              in your mind.
            </p>

            <p className="text-4xl font-semibold tracking-wide text-gray-200">
              {startNumber}
            </p>
          </motion.div>
        )}

        {phase === "breathing" && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-6"
          >
            <p className="text-sm text-gray-300 text-center">
              Breathe slowly and deeply. Follow the rhythm.
            </p>

            <motion.div
              className="w-28 h-28 rounded-full border border-gray-400"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 10, // 4s inhale + 6s exhale
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle progress indicator */}
      <div className="flex justify-center">
        <div className="w-24 h-[2px] bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: PHASE_DURATION, ease: "linear" }}
            className="h-full bg-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default MentalSubtractionScreen;
