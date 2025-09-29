import { Button } from "@/components/ui/button";
import { Smile, Calendar, Activity, Brain } from "lucide-react";

const ActionButtons = () => {
  const actions = [
    { label: "Update Mood/Anxiety", icon: <Smile className="w-4 h-4" /> },
    { label: "Log Event", icon: <Calendar className="w-4 h-4" /> },
    { label: "Log Activity", icon: <Activity className="w-4 h-4" /> },
    { label: "Track Brainwaves", icon: <Brain className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="ghost"
          className={`
            relative flex flex-col items-center justify-center gap-2
            rounded-2xl py-6 px-4 text-sm font-semibold
            
          
            
            text-gray-900 dark:text-gray-100
            hover:scale-105 hover:shadow-[0_0_12px_rgba(56,189,248,0.6)]
            hover:bg-gradient-to-br hover:from-indigo-500/30 hover:to-cyan-500/30
            transition-all duration-300
          `}
        >
          <div className="p-2 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500 text-white shadow-md">
            {action.icon}
          </div>
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
