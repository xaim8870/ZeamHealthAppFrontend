import { RadialBarChart, RadialBar, Legend } from "recharts";

interface InsightsChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
  overallScore: number;
}

const InsightsChart = ({ data, overallScore }: InsightsChartProps) => {
  return (
    <div className="rounded-2xl p-4 shadow-md bg-white dark:bg-transparent">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">
        Insights
      </h3>
      <div className="flex justify-center">
        <RadialBarChart
          width={260}
          height={200}
          cx="50%"
          cy="50%"   // ✅ center vertically
          innerRadius="20%"
          outerRadius="90%"
          barSize={12}
          data={data}
        >
          <RadialBar background dataKey="value" cornerRadius={5} />
          <Legend
            iconSize={12}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "12px", marginTop: "12px" }}
          />
        </RadialBarChart>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">Overall Score</p>
        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          {overallScore}
        </p>
      </div>
    </div>
  );
};

export default InsightsChart;
