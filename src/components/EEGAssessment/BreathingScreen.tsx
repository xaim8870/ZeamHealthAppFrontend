import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wind } from "lucide-react";

interface BreathingScreenProps {
  onComplete: () => void;
}

const TOTAL_DURATION = 30; // seconds

// Breathing phases (seconds)
const PHASES = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 2 },
  { label: "Exhale", duration: 6 },
  { label: "Pause", duration: 2 },
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

  /* ================= ANIMATION LOGIC ================= */
  const isInhale = phase.label === "Inhale";
  const isExhale = phase.label === "Exhale";

  return (
    <div
      className="w-full max-w-md rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 p-6 space-y-10
      shadow-[0_0_60px_rgba(34,211,238,0.08)]"
    >
      {/* Header 
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <Wind className="w-5 h-5 text-cyan-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Guided Breathing</h2>
          <p className="text-xs text-gray-400">
            Relaxation & EEG stabilization
          </p>
        </div>

        <span className="ml-auto text-xs px-3 py-1 rounded-full
          bg-cyan-500/10 text-cyan-400 tracking-widest">
          CALIBRATION
        </span>
      </div>
 */}
      {/* Instruction */}
      <motion.p
        key={phase.label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-xl font-medium tracking-wide"
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
              scale: isInhale ? 1.15 : isExhale ? 0.9 : 1,
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
              scale: isInhale ? 1.3 : isExhale ? 0.8 : 1,
            }}
            transition={{
              duration: phase.duration,
              ease: "easeInOut",
            }}
          />

          {/* Core orb */}
          <motion.div
            className="w-24 h-24 rounded-full
              bg-gradient-to-br from-cyan-300/40 to-cyan-500/20"
            animate={{
              scale: isInhale ? 1.4 : isExhale ? 0.7 : 1,
            }}
            transition={{
              duration: phase.duration,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 tracking-widest uppercase">
        Breathe through your nose · stay still
      </div>
    </div>
  );
};

export default BreathingScreen;
