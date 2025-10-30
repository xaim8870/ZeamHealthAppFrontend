import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";
import { motion } from "framer-motion";

const DailyJournal = () => {
  const [entry, setEntry] = useState("");

  const handleSave = () => {
    console.log("Saved Journal:", entry);
    setEntry("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative p-6 rounded-2xl mt-6 mb-4 
                 bg-gradient-to-br from-white/20 via-gray-200/10 to-gray-300/20 
                 dark:from-gray-800/40 dark:via-gray-700/40 dark:to-gray-900/40
                 backdrop-blur-2xl border border-white/30 dark:border-gray-600/30 
                 shadow-[0_0_25px_rgba(255,255,255,0.05)] 
                 hover:shadow-[0_0_35px_rgba(255,255,255,0.15)]
                 transition-all duration-500"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold text-lg tracking-wide 
                     text-gray-800 dark:text-gray-100"
        >
          Daily Journal
        </h3>

        {/* 🖋️ Glassy Icon */}
        <div
          className="p-2 rounded-full 
                     backdrop-blur-xl 
                     bg-gradient-to-br from-white/20 via-gray-400/20 to-gray-500/30
                     border border-white/30 dark:border-gray-500/40
                     shadow-inner shadow-white/10
                     flex items-center justify-center"
        >
          <PenLine
            className="w-4 h-4 text-white"
            stroke="white"
            strokeWidth={2.2}
          />
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Reflect on your day..."
        className="w-full p-3 text-sm rounded-xl border 
                   border-white/20 dark:border-gray-900
                   bg-gradient-to-br from-white/20 via-gray-200/10 to-gray-300/20 
                   dark: bg-gray-900
                   backdrop-blur-lg text-gray-800 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-white/40 
                   transition-all resize-none"
        rows={4}
      />

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="mt-4 w-full rounded-xl py-2.5 font-medium text-white
                   bg-gradient-to-r from-gray-500 via-gray-400 to-gray-600
                   hover:from-gray-400 hover:via-gray-300 hover:to-gray-500
                   shadow-[0_0_15px_rgba(255,255,255,0.15)] 
                   hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]
                   transition-all duration-300 backdrop-blur-lg border border-white/20"
      >
        Save Entry
      </Button>
    </motion.div>
  );
};

export default DailyJournal;
