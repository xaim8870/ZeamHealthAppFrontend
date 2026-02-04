import React from "react";
import { motion } from "framer-motion";

const GetReady: React.FC = () => {
  return (
    <div
      className="
        w-full max-w-md h-[380px]
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800 mt-[-30px]
        rounded-b-3xl
        flex flex-col items-center justify-center
        px-4 text-center
      "
    >
      {/* DOT LOADER */}
      <div className="flex items-center gap-2 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2,
            }}
            className="w-2.5 h-2.5 rounded-full bg-cyan-400"
          />
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">
        Prepare for EEG Recording
      </h2>

      <p className="text-sm text-gray-400 max-w-xs">
        Sit comfortably, remain still, and minimize movement.
      </p>

      <p className="text-xs text-gray-500 mt-4">
        Recording will begin shortly…
      </p>
    </div>
  );
};

export default GetReady;
