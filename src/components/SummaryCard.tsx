import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface SummaryCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  gradient: string;
  className?: string;
  children?: React.ReactNode; // <-- new
}

const SummaryCard = ({
  title,
  value,
  subtext,
  icon,
  gradient,
  className,
  children,
}: SummaryCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      <Card
        className={`p-4 rounded-2xl shadow-md text-gray-800 dark:text-white bg-gradient-to-br ${gradient}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-medium opacity-80">{title}</h3>
            <p className="text-lg font-bold">{value}</p>
            {subtext && <p className="text-xs opacity-70 mt-1">{subtext}</p>}
          </div>
          <div className="p-2 bg-white/40 dark:bg-white/20 rounded-xl">
            {icon}
          </div>
        </div>

        {/* Custom content area */}
        {children && <div className="mt-3">{children}</div>}
      </Card>
    </motion.div>
  );
};

export default SummaryCard;
