import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

const GetReady: React.FC<Props> = ({ onComplete }) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 2000);
    const completeTimer = setTimeout(onComplete, 5000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="w-full max-w-md h-[380px] rounded-3xl
      bg-gradient-to-br from-[#0b0f17] to-[#05070b]
      border border-gray-800 flex items-center justify-center">

      {showText && (
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xl font-semibold tracking-wide"
        >
          Get Ready for EEG
        </motion.h2>
      )}
    </div>
  );
};

export default GetReady;
