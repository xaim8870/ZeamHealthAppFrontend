import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { playBeep } from "../../utils/playBeep";

interface Props {
  onComplete: () => void;
}

const STAGE_DURATION = 60; // seconds

const EyesClosedOpen: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState<"closed" | "open">("closed");
  const [timeLeft, setTimeLeft] = useState(STAGE_DURATION);

  /* ================= TIMER ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ================= STAGE TRANSITION ================= */
  useEffect(() => {
    if (timeLeft > 0) return;

    playBeep();

    if (stage === "closed") {
      setStage("open");
      setTimeLeft(STAGE_DURATION);
    } else {
      onComplete();
    }
  }, [timeLeft, stage, onComplete]);

  /* ================= PROGRESS RING ================= */
  const progress = 1 - timeLeft / STAGE_DURATION;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const StageIcon = stage === "closed" ? EyeOff : Eye;

  const instruction =
    stage === "closed"
      ? "Keep your eyes closed"
      : "Keep your eyes open";

  const ringColor =
    stage === "closed"
      ? "#22d3ee" // cyan – calm baseline
      : "#facc15"; // amber – alert visual

  /* ================= UI ================= */
  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-8
      shadow-[0_0_60px_rgba(0,255,255,0.05)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <StageIcon className="w-5 h-5 text-cyan-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Visual Baseline</h2>
          <p className="text-xs text-gray-400">
            Eyes open & closed EEG measurement
          </p>
        </div>

        <span
          className="ml-auto text-xs px-3 py-1 rounded-full
          bg-cyan-500/10 text-cyan-400 tracking-widest"
        >
          EEG TASK
        </span>
      </div>

      {/* Instruction */}
      <motion.h3
        key={stage}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-xl font-medium tracking-wide"
      >
        {instruction}
      </motion.h3>

      <p className="text-center text-sm text-gray-400 max-w-xs mx-auto">
        Stay relaxed and still. You will hear a sound when it’s time to switch.
      </p>

      {/* Progress Ring */}
      <div className="flex justify-center mt-6">
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
        Visual baseline recording in progress
      </div>
    </div>
  );
};

export default EyesClosedOpen;
