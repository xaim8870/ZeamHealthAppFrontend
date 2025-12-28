import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Brain } from "lucide-react";
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

const PHASE_DURATION = 30; // seconds (hidden)

const phaseOrder: Phase[] = [
  "eyesClosed",
  "eyesOpen",
  "eyesClosed2",
  "eyesOpen2",
  "imageBreathing",
];

const phaseInstruction: Record<Phase, string> = {
  eyesClosed: "Keep your eyes closed",
  eyesOpen: "Keep your eyes open",
  eyesClosed2: "Keep your eyes closed",
  eyesOpen2: "Keep your eyes open",
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
      playBeep();

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

  /* ================= PROGRESS RING ================= */
  const progress = 1 - timeLeft / PHASE_DURATION;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  /* ================= PHASE VISUALS ================= */
  const isEyesClosed = currentPhase.includes("Closed");
  const isBreathing = currentPhase === "imageBreathing";

  const PhaseIcon = isBreathing
    ? Brain
    : isEyesClosed
    ? EyeOff
    : Eye;

  const ringColor = isBreathing
    ? "#22d3ee" // calm cyan
    : isEyesClosed
    ? "#8b5cf6" // violet (alpha dominant)
    : "#facc15"; // amber (visual alert)

  /* ================= UI ================= */
  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8
      shadow-[0_0_60px_rgba(139,92,246,0.08)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${ringColor}22` }}
        >
          <PhaseIcon className="w-5 h-5" style={{ color: ringColor }} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Alpha Reactivity</h2>
          <p className="text-xs text-gray-400">
            Visual activation & suppression task
          </p>
        </div>

        <span
          className="ml-auto text-xs px-3 py-1 rounded-full
          tracking-widest"
          style={{
            backgroundColor: `${ringColor}22`,
            color: ringColor,
          }}
        >
          EEG TASK
        </span>
      </div>

      {/* Instruction */}
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentPhase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-center text-xl font-medium tracking-wide"
        >
          {phaseInstruction[currentPhase]}
        </motion.h3>
      </AnimatePresence>

      {/* Image + Breathing */}
      {isBreathing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6"
        >
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
            alt="Calming visual stimulus"
            className="w-44 h-44 rounded-xl object-cover
              border border-gray-700 shadow-lg"
          />

          {/* Breathing Orb */}
          <motion.div
            className="w-28 h-28 rounded-full border"
            style={{ borderColor: ringColor }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Progress Ring */}
      <div className="flex justify-center mt-2">
        <svg
          width="140"
          height="140"
          viewBox="0 0 120 120"
          className="-rotate-90"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#1f2937"
            strokeWidth="6"
            fill="none"
          />

          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 tracking-widest uppercase">
        Alpha reactivity recording in progress
      </div>
    </div>
  );
};

export default AlphaReactiveStateTest;
