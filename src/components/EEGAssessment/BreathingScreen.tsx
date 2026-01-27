import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BreathingScreenProps {
  onComplete: () => void;
}

const TOTAL_DURATION = 30; // seconds

// Only inhale & exhale
const PHASES = [
  { label: "Inhale", duration: 4 },
  { label: "Exhale", duration: 6 },
];

const BreathingScreen: React.FC<BreathingScreenProps> = ({ onComplete }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  /* ================= AUTO COMPLETE ================= */
  useEffect(() => {
    const timer = setTimeout(onComplete, TOTAL_DURATION * 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  /* ================= PHASE CYCLING ================= */
  useEffect(() => {
    const phase = PHASES[phaseIndex];
    const timer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, phase.duration * 1000);

    return () => clearTimeout(timer);
  }, [phaseIndex]);

  const phase = PHASES[phaseIndex];
  const isInhale = phase.label === "Inhale";
  const isExhale = phase.label === "Exhale";

  return (
    <div
      className="
        w-full max-w-md h-[420px]
        rounded-3xl p-6
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        shadow-[0_0_60px_rgba(34,211,238,0.08)]
        flex flex-col items-center justify-center
        space-y-10
      "
    >
      {/* Single-line instruction */}
      <p className="text-center text-sm text-cyan-200/80 tracking-wide">
        Breathe slowly through your nose and remain still
      </p>

      {/* Phase label */}
      <motion.p
        key={phase.label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-2xl font-medium tracking-wide text-cyan-300"
      >
        {phase.label}
      </motion.p>

      {/* Breathing Orb */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer pulse */}
          <motion.div
            className="absolute inset-0 rounded-full border border-cyan-400/30"
            animate={{
              scale: isInhale ? 1.15 : 0.9,
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: phase.duration,
              ease: "easeInOut",
            }}
          />

          {/* Glow */}
          <motion.div
            className="absolute inset-6 rounded-full bg-cyan-400/10 blur-xl"
            animate={{
              scale: isInhale ? 1.3 : 0.8,
            }}
            transition={{
              duration: phase.duration,
              ease: "easeInOut",
            }}
          />

          {/* Core orb */}
          <motion.div
            className="
              w-24 h-24 rounded-full
              bg-gradient-to-br from-cyan-300/40 to-cyan-500/20
            "
            animate={{
              scale: isInhale ? 1.4 : 0.7,
            }}
            transition={{
              duration: phase.duration,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BreathingScreen;
