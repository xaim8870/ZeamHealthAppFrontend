
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
    <div className="w-full flex flex-col items-center">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full max-w-md mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Insights
        </h3>

        {/* Time Period Selector */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
          {(["daily", "weekly", "monthly"] as const).map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                ${
                  selectedPeriod === period
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
            >
              {periodConfig[period].label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Radial Chart */}
        <RadialBarChart
          width={320}
          height={280}
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="95%"
          barSize={8}   // ✅ thinner arcs
          data={data}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            className="drop-shadow-lg"
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
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round(overallScore * 0.9)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            +{Math.round(overallScore * 0.05)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.reduce((sum, item) => sum + item.value, 0).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2">
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Based on your {selectedPeriod} activity •{" "}
          <span className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
            View detailed report
          </span>
        </p>
      </div>
    </div>
  );
};

export default InsightsChart;