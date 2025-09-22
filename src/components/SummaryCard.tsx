import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface SummaryCardProps {
  title: string;
  time: string;
  stats?: { label: string; value: string }[];
  icon?: React.ReactNode;
  gradientLight: string;
  gradientDark: string;
  className?: string;
}

const SummaryCard = ({
  title,
  time,
  stats = [],
  icon,
  gradientLight,
  gradientDark,
  className,
}: SummaryCardProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.97, y: 2 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className={className}
    >
      <Card
        className={`p-4 rounded-2xl 
          bg-gradient-to-br ${gradientLight} dark:${gradientDark}
          shadow-lg hover:shadow-2xl transition-shadow duration-300
          border border-white/20 dark:border-white/10
          text-gray-800 dark:text-white`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && <div className="p-2 bg-white/30 dark:bg-white/10 rounded-xl">{icon}</div>}
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <p className="text-xs opacity-70">{time}</p>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          {stats.map((s, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="opacity-80">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default SummaryCard;
