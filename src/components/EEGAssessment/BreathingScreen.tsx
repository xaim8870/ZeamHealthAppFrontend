import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind } from "lucide-react";

interface Props {
  mode: "instruction" | "breathing";
  breathLabel: "Inhale" | "Exhale";
}

const BreathingScreen: React.FC<Props> = ({
  mode,
  breathLabel,
}) => {
  const isInhale = breathLabel === "Inhale";

  return (
    <div
      className="
        relative w-full max-w-md h-[380px]
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        rounded-b-3xl
        flex flex-col items-center justify-center
        px-6 text-center
      "
    >
      <AnimatePresence mode="wait">
        {mode === "instruction" && (
          <motion.div
            key="instruction"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <Wind className="w-8 h-8 mx-auto text-cyan-400" />
            <h3 className="text-xl font-semibold">
              Guided Breathing
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Breathe slowly through your nose and remain still.
            </p>
          </motion.div>
        )}

        {mode === "breathing" && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-10"
          >
            <motion.p
              key={breathLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-medium text-cyan-300"
            >
              {breathLabel}
            </motion.p>

            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-cyan-400/30"
                animate={{
                  scale: isInhale ? 1.15 : 0.9,
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute inset-6 rounded-full bg-cyan-400/10 blur-xl"
                animate={{
                  scale: isInhale ? 1.3 : 0.8,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />

              <motion.div
                className="
                  w-24 h-24 rounded-full
                  bg-gradient-to-br from-cyan-300/40 to-cyan-500/20
                "
                animate={{
                  scale: isInhale ? 1.4 : 0.7,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BreathingScreen;
