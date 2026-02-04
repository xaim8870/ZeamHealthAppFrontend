import React from "react";
import { motion } from "framer-motion";

interface Props {
  /** If you pass progress (0..1), bar becomes controlled (recommended). */
  progress?: number;

  /** Legacy: if you pass durationMs, it will animate 0→100%. */
  durationMs?: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const ProgressBar: React.FC<Props> = ({ progress, durationMs }) => {
  // Controlled mode (overall progress)
  if (typeof progress === "number") {
    return (
      <div className="w-full h-1 bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-cyan-500 transition-[width] duration-200"
          style={{ width: `${clamp01(progress) * 100}%` }}
        />
      </div>
    );
  }

  // Fallback animated mode (old behavior)
  const ms = durationMs ?? 1000;
  return (
    <div className="w-full h-1 bg-gray-800 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: ms / 1000, ease: "linear" }}
        className="h-full bg-cyan-500"
      />
    </div>
  );
};

export default ProgressBar;
