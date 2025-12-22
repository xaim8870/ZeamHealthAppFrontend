import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playBeep } from "../../utils/playBeep";

interface AlphaReactiveProps {
  onComplete: () => void;
}

type Phase =
  | "eyesClosed"
  | "eyesOpen"
  | "eyesClosed2"
  | "eyesOpen2"
  | "imageBreathing";

const PHASE_DURATION = 30; // seconds

const phaseOrder: Phase[] = [
  "eyesClosed",
  "eyesOpen",
  "eyesClosed2",
  "eyesOpen2",
  "imageBreathing",
];

const phaseText: Record<Phase, string> = {
  eyesClosed: "Please close your eyes",
  eyesOpen: "Please open your eyes",
  eyesClosed2: "Please close your eyes",
  eyesOpen2: "Please open your eyes",
  imageBreathing: "Focus on the image and breathe slowly",
};

const AlphaReactiveStateTest: React.FC<AlphaReactiveProps> = ({
  onComplete,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATION);

  const currentPhase = phaseOrder[phaseIndex];

  /* ================= TIMER (HIDDEN) ================= */
  useEffect(() => {
    if (timeLeft <= 0) {
      playBeep(); // 🔔 auditory cue

      if (phaseIndex < phaseOrder.length - 1) {
        setPhaseIndex((i) => i + 1);
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
  }, [timeLeft, phaseIndex, onComplete]);

  /* ================= CIRCULAR PROGRESS ================= */
  const progress = 1 - timeLeft / PHASE_DURATION;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-md bg-[#0c0f14] border border-gray-700 rounded-2xl p-6 text-gray-100 shadow-xl space-y-8">
      {/* Instruction */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentPhase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-center text-sm text-gray-300 tracking-wide"
        >
          {phaseText[currentPhase]}
        </motion.p>
      </AnimatePresence>

      {/* Image + Breathing Phase */}
      {currentPhase === "imageBreathing" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
            alt="Calming visual"
            className="w-40 h-40 rounded-xl object-cover border border-gray-600"
          />

          {/* Breathing Animation */}
          <motion.div
            className="w-24 h-24 rounded-full border border-gray-400"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 10, // inhale + exhale
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Circular Progress Ring */}
      <div className="flex justify-center mt-2">
        <svg
          width="140"
          height="140"
          viewBox="0 0 120 120"
          className="-rotate-90"
        >
          {/* Background Ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#2a2f3a"
            strokeWidth="6"
            fill="none"
          />

          {/* Progress Ring */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Phase Indicator */}
      <div className="text-center text-xs text-gray-500 tracking-widest uppercase">
        {currentPhase === "imageBreathing"
          ? "Relaxation"
          : "Visual Cue"}
      </div>
    </div>
  );
};

export default AlphaReactiveStateTest;
