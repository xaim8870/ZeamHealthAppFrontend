import { motion } from "framer-motion";
import { Smile, Calendar, Activity, Brain } from "lucide-react";

const ActionButtons = () => {
  const actions = [
    { label: "Update Mood", icon: <Smile className="w-5 h-5" stroke="white" strokeWidth={2} /> },
    { label: "Log Event", icon: <Calendar className="w-5 h-5" stroke="white" strokeWidth={2} /> },
    { label: "Log Activity", icon: <Activity className="w-5 h-5" stroke="white" strokeWidth={2} /> },
    { label: "Track Brainwaves", icon: <Brain className="w-5 h-5" stroke="white" strokeWidth={2} /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 my-8">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className={`
            flex flex-col items-center justify-center gap-3
            rounded-2xl py-6 px-4
            text-sm font-medium tracking-wide
            text-gray-800 dark:text-gray-100
            backdrop-blur-sm
            bg-gradient-to-br from-white/20 via-gray-300/10 to-gray-400/20
            dark:from-gray-800/40 dark:via-gray-700/40 dark:to-gray-900/40
            border border-white/20 dark:border-gray-600/30
            shadow-[inset_1px_1px_3px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.25)]
            hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]
            transition-all duration-500
          `}
        >
          {/* Icon container */}
          <div
            className="p-3 rounded-xl 
                       bg-gradient-to-br from-white/10 via-gray-400/10 to-gray-500/20
                       border border-white/30 shadow-inner shadow-white/10"
          >
            {action.icon}
          </div>

          {/* Label */}
          <span className="text-[13px] font-semibold text-white/90 dark:text-gray-100 text-center">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default ActionButtons;
