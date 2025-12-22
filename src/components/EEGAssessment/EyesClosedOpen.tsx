import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

    playBeep(); // 🔔 auditory cue

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

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-md bg-[#0c0f14] border border-gray-700 rounded-2xl p-6 text-gray-100 shadow-xl space-y-8">
      {/* Instruction */}
      <motion.h2
        key={stage}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-lg font-medium tracking-wide"
      >
        {stage === "closed"
          ? "Please close your eyes"
          : "Please open your eyes"}
      </motion.h2>

      <p className="text-center text-sm text-gray-400 max-w-xs mx-auto">
        Remain still and relaxed. Follow the auditory cue.
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
            stroke="#2a2f3a"
            strokeWidth="6"
            fill="none"
          />

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

      {/* Stage Label */}
      <div className="text-center text-xs text-gray-500 tracking-widest uppercase">
        {stage === "closed" ? "Eyes Closed" : "Eyes Open"}
      </div>
    </div>
  );
};

export default EyesClosedOpen;
