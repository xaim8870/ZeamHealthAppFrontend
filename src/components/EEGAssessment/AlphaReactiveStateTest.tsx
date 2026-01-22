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
  const isBreathing = currentPhase === "imageBreathing";

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

  const ringColor = isBreathing
    ? "#22d3ee"
    : currentPhase.includes("Closed")
    ? "#8b5cf6"
    : "#facc15";

  /* ================= UI ================= */
  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8
      shadow-[0_0_60px_rgba(139,92,246,0.08)]"
    >
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

      {/* Image ONLY (no circle, no wheel) */}
      {isBreathing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
            alt="Calming visual stimulus"
            className="w-44 h-44 rounded-xl object-cover
              border border-gray-700 shadow-lg"
          />
        </motion.div>
      )}

      {/* Progress Ring (NOT shown during image phase) */}
      {!isBreathing && (
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
      )}
    </div>
  );
};

export default AlphaReactiveStateTest;
