import React from "react";
import { motion } from "framer-motion";

interface Props {
  /** Controlled: pass progress (0..1). */
  progress?: number;
  /** Legacy: animate 0→100% over durationMs. */
  durationMs?: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const ProgressBar: React.FC<Props> = ({ progress, durationMs }) => {
  const controlled = typeof progress === "number";
  const p = controlled ? clamp01(progress!) : 0;

  return (
    <div className="w-full mt-5">
      {/* Track */}
      <div className="relative w-full h-3 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:12px_12px]" />

        {/* Fill */}
        {controlled ? (
          <div
            className="relative h-full rounded-full transition-[width] duration-200"
            style={{ width: `${p * 100}%` }}
          >
            {/* Gradient fill */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500" />

            {/* Inner highlight */}
            <div className="absolute inset-0 rounded-full opacity-60 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),rgba(255,255,255,0))]" />

            {/* Glow */}
            <div className="absolute inset-0 rounded-full blur-md opacity-60 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500" />

            {/* Animated sheen */}
            <motion.div
              className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full opacity-40"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              }}
              animate={{ x: ["-40%", "140%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />

            {/* Leading edge pulse */}
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)] "
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        ) : (
          // Legacy animated mode
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: (durationMs ?? 1000) / 1000, ease: "linear" }}
            className="relative h-full rounded-full"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500" />
            <div className="absolute inset-0 rounded-full opacity-60 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 rounded-full blur-md opacity-60 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500" />
            <motion.div
              className="absolute inset-y-0 -left-1/3 w-1/3 rounded-full opacity-40"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              }}
              animate={{ x: ["-40%", "140%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </div>

      {/* Optional: tiny percentage label (remove if you don’t want text) */}
      {controlled && (
        <div className="mt-2 flex justify-end">
          <span className="text-[11px] text-white/50 tabular-nums">
            {Math.round(p * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
