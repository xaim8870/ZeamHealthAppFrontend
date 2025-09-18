interface HighlightItemProps {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color: string;
}

const HighlightItem = ({ label, value, goal, unit, color }: HighlightItemProps) => {
  const progress = Math.min((value / goal) * 100, 100);
  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className="text-gray-700 dark:text-gray-300">
          {value} / {goal} {unit}
        </span>
        <span className="text-gray-500">{label}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const Highlights = () => {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <h2 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Highlights
      </h2>

      <HighlightItem label="Active Calorie Burn" value={52} goal={550} unit="cal" color="#ef4444" />
      <HighlightItem label="Steps" value={8600} goal={10000} unit="steps" color="#22c55e" />
      <HighlightItem label="Active Minutes" value={68} goal={100} unit="min" color="#f59e0b" />
    </div>
  );
};

export default Highlights;
