import React from "react";

interface CircularChartProps {
  label: string;
  value: number; // percentage (0–100)
  color: string; // gradient or solid stroke color
}

const CircularChart = ({ label, value, color }: CircularChartProps) => {
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-28">
      <div className="relative p-3 rounded-2xl ">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-300 dark:text-gray-700"
          />

          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out "
          />
        </svg>

        {/* Value Centered Inside Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {value}%
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </p>
    </div>
  );
};

export default CircularChart;
