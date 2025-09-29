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
      transition={{ duration: 0.5 }}
      className="relative p-5 rounded-2xl mt-6 mb-4 
        bg-white/30 dark:bg-gray-900/40 
        backdrop-blur-lg border border-white/20 dark:border-gray-700/50 
        shadow-lg hover:shadow-[0_0_16px_rgba(56,189,248,0.4)] 
        transition-all"
    >
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
          Daily Journal
        </h3>
        <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
          <PenLine className="w-4 h-4" />
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Reflect on your day..."
        className="w-full p-3 text-sm rounded-xl border 
          border-gray-300 dark:border-gray-600 
          bg-white/60 dark:bg-gray-800/70 
          text-gray-800 dark:text-gray-100 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-cyan-400 
          transition-all resize-none"
        rows={4}
      />

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="mt-4 w-full rounded-xl 
          bg-gradient-to-r from-indigo-500 to-cyan-500 
          hover:from-indigo-600 hover:to-cyan-600 
          text-white font-medium shadow-md hover:shadow-lg 
          transition-all"
      >
        Save Entry
      </Button>
    </motion.div>
  );
};

export default DailyJournal;
