import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Minus, Wind } from "lucide-react";
import { playBeep } from "../../utils/playBeep";

interface Props {
  onComplete: () => void;
}

type Phase = "subtract" | "breathing";

const PHASE_DURATION = 30; // seconds (hidden)

const MentalSubtractionScreen: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>("subtract");
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATION);

  const [startNumber] = useState(
    () => Math.floor(Math.random() * 21) + 100
  );

  // 🔒 Guard to prevent repeated beeps
  const hasBeepedRef = useRef(false);

  useEffect(() => {
    hasBeepedRef.current = false;
  }, []);

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
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, phase, onComplete]);

  /* ================= PHASE VISUALS ================= */
  const isSubtract = phase === "subtract";

  const phaseColor = isSubtract
    ? "#ef4444" // red – cognitive load
    : "#22d3ee"; // cyan – recovery

  const PhaseIcon = isSubtract ? Minus : Wind;

  /* ================= UI ================= */
  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8
      shadow-[0_0_60px_rgba(239,68,68,0.12)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          animate={{ backgroundColor: `${phaseColor}22` }}
          transition={{ duration: 0.6 }}
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

        <motion.span
          className="ml-auto text-xs px-3 py-1 rounded-full tracking-widest"
          animate={{
            backgroundColor: `${phaseColor}22`,
            color: phaseColor,
          }}
          transition={{ duration: 0.6 }}
        >
          EEG TASK
        </motion.span>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isSubtract && (
          <motion.div
            key="subtract"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <p className="text-sm text-gray-300 max-w-xs mx-auto">
              Keep your eyes closed.  
              Starting from the number below, subtract 7 repeatedly in your mind.
            </p>

            <div className="flex justify-center">
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center
                border"
                style={{
                  borderColor: phaseColor,
                  boxShadow: `0 0 25px ${phaseColor}33`,
                }}
              >
                <span className="text-4xl font-semibold tracking-wide text-gray-100">
                  {startNumber}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {!isSubtract && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-6"
          >
            <p className="text-sm text-gray-300 text-center">
              Breathe slowly and deeply. Stay relaxed and still.
            </p>

            {/* Breathing Orb */}
            <motion.div
              className="w-28 h-28 rounded-full"
              style={{
                border: `2px solid ${phaseColor}`,
                boxShadow: `0 0 20px ${phaseColor}33`,
              }}
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Progress Indicator */}
      <div className="flex justify-center">
        <div className="w-24 h-[3px] bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            key={phase}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: PHASE_DURATION, ease: "linear" }}
            className="h-full"
            style={{ backgroundColor: phaseColor }}
          />
        </div>
      </div>
    </div>
  );
};

export default MentalSubtractionScreen;
