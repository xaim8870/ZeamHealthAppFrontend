import { motion } from "framer-motion";

interface BreathingOrbProps {
  inhale: boolean;
  duration: number;
}

const BreathingOrb: React.FC<BreathingOrbProps> = ({
  inhale,
  duration,
}) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer pulse */}
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan-400/30"
        animate={{
          scale: inhale ? 1.15 : 0.9,
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration,
          ease: "easeInOut",
        }}
      />

      {/* Glow */}
      <motion.div
        className="absolute inset-6 rounded-full bg-cyan-400/10 blur-xl"
        animate={{
          scale: inhale ? 1.3 : 0.8,
        }}
        transition={{
          duration,
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
          scale: inhale ? 1.4 : 0.7,
        }}
        transition={{
          duration,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default BreathingOrb;
