import { useState } from "react";
import { RadialBarChart, RadialBar, Legend } from "recharts";

interface InsightsChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
  overallScore: number;
  onPeriodChange?: (period: "daily" | "weekly" | "monthly") => void;
}

const InsightsChart = ({ data, overallScore, onPeriodChange }: InsightsChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  const handlePeriodChange = (period: "daily" | "weekly" | "monthly") => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const periodConfig = {
    daily: { label: "Daily" },
    weekly: { label: "Weekly" },
    monthly: { label: "Monthly" },
  };

  return (
    <div
      className="w-full flex flex-col items-center rounded-2xl p-6 
                 bg-gradient-to-br from-white/20 via-gray-200/10 to-gray-400/20
                 dark:from-gray-800/40 dark:via-gray-700/40 dark:to-gray-900/40
                 backdrop-blur-2xl border border-white/20 dark:border-gray-600/20
                 shadow-[0_0_25px_rgba(255,255,255,0.05)]
                 transition-all duration-500"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center w-full max-w-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Your Insights
        </h3>

        {/* Time Period Selector */}
        <div className="flex space-x-1 bg-gradient-to-br from-white/10 to-gray-400/20
                        dark:from-gray-700/40 dark:to-gray-800/40
                        backdrop-blur-md border border-white/20 dark:border-gray-600/30
                        rounded-full p-1 shadow-inner">
          {(["daily", "weekly", "monthly"] as const).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                ${
                  selectedPeriod === period
                    ? "bg-white/30 text-gray-900 dark:text-white shadow-[0_0_10px_rgba(255,255,255,0.25)] backdrop-blur-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-white/90"
                }`}
            >
              {periodConfig[period].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative flex flex-col items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 
                     bg-gradient-to-br from-white to-gray-400"
        />
        <RadialBarChart
          width={320}
          height={280}
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="95%"
          barSize={8}
          data={data}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            className="drop-shadow-md"
          />
          <Legend
            iconType="circle"
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              padding: "12px 0",
              fontSize: "12px",
              lineHeight: "1.4",
            }}
            formatter={(value) => (
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {value}
              </span>
            )}
          />
        </RadialBarChart>
      </div>

      {/* Additional Stats */}
      <div className="w-full grid grid-cols-3 gap-4 pt-4 max-w-md">
        <div className="text-center">
          <p className="text-sm font-semibold text-white dark:text-gray-100">
            {Math.round(overallScore * 0.9)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white dark:text-green-300">
            +{Math.round(overallScore * 0.05)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white dark:text-gray-100">
            {data.reduce((sum, item) => sum + item.value, 0).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Based on your {selectedPeriod} activity •{" "}
          <span className="text-white/90 dark:text-gray-100 hover:underline cursor-pointer">
            View detailed report
          </span>
        </p>
      </div>
    </div>
  );
};

export default InsightsChart;
