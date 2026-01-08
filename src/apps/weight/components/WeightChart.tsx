import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { WeightEntry } from "../../../api/weight/types";

interface WeightChartProps {
  weights: WeightEntry[];
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  timestamp: number;
}

type FilterPeriod = "all" | "3m" | "1m" | "1w";

export default function WeightChart({ weights }: WeightChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("all");

  // Sort weights chronologically (oldest to newest)
  const sortedWeights = [...weights].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  // Filter weights based on selected period
  const getFilteredWeights = () => {
    if (selectedPeriod === "all") return sortedWeights;

    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedPeriod) {
      case "3m":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "1m":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "1w":
        cutoffDate.setDate(now.getDate() - 7);
        break;
    }

    return sortedWeights.filter((w) => new Date(w.recorded_at) >= cutoffDate);
  };

  const filteredWeights = getFilteredWeights();

  // Convert to chart data
  const chartData: ChartDataPoint[] = filteredWeights.map((w) => ({
    date: new Date(w.recorded_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    fullDate: new Date(w.recorded_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    weight: w.weight_kg,
    timestamp: new Date(w.recorded_at).getTime(),
  }));

  // Calculate statistics for filtered data
  const getStats = () => {
    if (filteredWeights.length < 2) return null;

    const latest = filteredWeights[filteredWeights.length - 1].weight_kg;
    const previous = filteredWeights[filteredWeights.length - 2].weight_kg;
    const first = filteredWeights[0].weight_kg;
    const diff = latest - previous;
    const totalChange = latest - first;

    return { latest, previous, diff, totalChange };
  };

  const stats = getStats();

  // Determine line color based on weight trend
  const getLineColor = () => {
    if (filteredWeights.length < 2) return "#10b981"; // Default green
    
    const latest = filteredWeights[filteredWeights.length - 1].weight_kg;
    const previous = filteredWeights[filteredWeights.length - 2].weight_kg;
    
    return latest > previous ? "#ef4444" : "#10b981"; // Red if increased, green if decreased
  };

  const lineColor = getLineColor();

  // Filter buttons configuration
  const filterButtons: { period: FilterPeriod; label: string }[] = [
    { period: "all", label: "All" },
    { period: "3m", label: "3M" },
    { period: "1m", label: "1M" },
    { period: "1w", label: "1W" },
  ];

  // Calculate chart settings based on data density
  const getChartSettings = () => {
    const dataLength = chartData.length;
    return {
      dotRadius:
        dataLength > 100 ? 1 : dataLength > 50 ? 1.5 : dataLength > 20 ? 2 : 3,
      showLabels: dataLength <= 15,
      tickInterval: Math.max(0, Math.floor(dataLength / 6)),
    };
  };

  const chartSettings = getChartSettings();

  if (sortedWeights.length === 0) {
    return (
      <div className="mb-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
        <div className="text-center py-8">
          <p className="text-gray-400">No weight data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 backdrop-blur-sm">
      {/* Header with Title and Filters */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-emerald-400">
            Weight Progress
          </h2>

          {/* Time Period Filter Buttons */}
          <div className="flex gap-1 bg-gray-700/50 rounded-lg p-1">
            {filterButtons.map(({ period, label }) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  selectedPeriod === period
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-gray-300 hover:text-white hover:bg-gray-600/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="text-sm text-gray-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>
                Latest:{" "}
                <span className="text-white font-medium">{stats.latest}kg</span>
              </span>
              <span>
                Previous:{" "}
                <span className="text-white font-medium">
                  {stats.previous}kg
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 ${
                  stats.diff >= 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {stats.diff >= 0 ? "↗" : "↘"} {Math.abs(stats.diff).toFixed(1)}
                kg from previous
              </span>
              <span
                className={`text-xs ${
                  stats.totalChange >= 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                Total: {stats.totalChange >= 0 ? "+" : ""}
                {stats.totalChange.toFixed(1)}kg
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Showing {filteredWeights.length} of {sortedWeights.length} records
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="2 2"
            stroke="#374151"
            strokeOpacity={0.2}
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            fontSize={10}
            interval={chartSettings.tickInterval}
            tick={{
              fill: "#9CA3AF",
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            fontSize={10}
            stroke="#9CA3AF"
            tickFormatter={(value: number) => `${value}kg`}
            tick={{
              fill: "#9CA3AF",
              fontSize: 10,
            }}
            tickLine={false}
            axisLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
            labelStyle={{
              color: "#D1D5DB",
              fontWeight: "500",
              marginBottom: "4px",
            }}
            formatter={(value: number | undefined) => [
              <span style={{ color: lineColor, fontWeight: "600" }}>
                {value}kg
              </span>,
              "Weight",
            ]}
            labelFormatter={(label: string) => {
              const dataPoint = chartData.find((d) => d.date === label);
              return dataPoint ? dataPoint.fullDate : label;
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={lineColor}
            strokeWidth={2}
            dot={{
              r: chartSettings.dotRadius,
              fill: lineColor,
              strokeWidth: 1,
              stroke: lineColor === "#ef4444" ? "#dc2626" : "#065f46",
            }}
            activeDot={{
              r: 5,
              stroke: lineColor,
              strokeWidth: 2,
              fill: "#ffffff",
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
