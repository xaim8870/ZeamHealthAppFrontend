import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface BreathingScreenProps {
  onComplete: () => void;
}

const DURATION = 30; // seconds

const BreathingScreen: React.FC<BreathingScreenProps> = ({ onComplete }) => {
  /* ================= AUTO COMPLETE ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, DURATION * 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-md bg-[#0c0f14] border border-gray-700 rounded-2xl p-6 text-gray-100 shadow-xl space-y-8">
      {/* Instruction */}
      <p className="text-center text-sm text-gray-300 leading-relaxed">
        Breathe slowly and deeply. Follow the rhythm on the screen.
      </p>

      {/* Breathing Circle */}
      <div className="flex justify-center">
        <motion.div
          className="w-40 h-40 rounded-full border border-gray-400"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 10, // 4s inhale + 6s exhale
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>

      {/* Subtle cue text */}
      <div className="text-center text-xs text-gray-500 tracking-widest uppercase">
        Relax
      </div>
    </div>
  );
};

export default BreathingScreen;
