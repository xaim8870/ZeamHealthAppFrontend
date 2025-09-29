import React from "react";

interface TriangleChartProps {
  label: string;
  value: number; // percentage (0–100)
  color: string;
}

const TriangleChart = ({ label, value, color }: TriangleChartProps) => {
  // Triangle points (equilateral inside a 100×100 viewBox)
  const points = "50,5 5,95 95,95";

  // Perimeter of equilateral triangle ≈ 3 * side length
  const side = 90; // ~90 units side
  const perimeter = 3 * side; // ~270

  // Stroke offset for progress
  const progressLength = (value / 100) * perimeter;
  const dashArray = `${progressLength} ${perimeter}`;

  return (
    <div className="flex flex-col items-center w-28">
      <svg
        viewBox="0 0 100 100"
        className="w-18 h-18" // rotate so progress starts at top
      >
        {/* Background (gray triangle) */}
        <polygon
          points={points}
          fill="none"
          stroke="#e5e7eb  "
          strokeWidth="8"
        />
        {/* Progress (colored stroke) */}
        <polygon
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      </svg>

      {/* % Value */}
      <p className="mt-2 font-bold text-lg text-gray-800 dark:text-gray-200">
        {value}%
      </p>

      {/* Label */}
      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
        {label}
      </p>
    </div>
  );
};

export default TriangleChart;
