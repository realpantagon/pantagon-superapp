interface WeightStatsProps {
  stats: {
    totalChange: number;
    minWeight: number;
    maxWeight: number;
    avgWeight: number;
  } | null;
}

export default function WeightStatsComponent({ stats }: WeightStatsProps) {
  if (!stats) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3">
      <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
        <div className="text-xs text-gray-400 mb-1">Total Change</div>
        <div className={`text-lg font-bold ${stats.totalChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
          {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange.toFixed(1)}kg
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
        <div className="text-xs text-gray-400 mb-1">Average</div>
        <div className="text-lg font-bold text-white">
          {stats.avgWeight.toFixed(1)}kg
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
        <div className="text-xs text-gray-400 mb-1">Minimum</div>
        <div className="text-lg font-bold text-green-400">
          {stats.minWeight.toFixed(1)}kg
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
        <div className="text-xs text-gray-400 mb-1">Maximum</div>
        <div className="text-lg font-bold text-red-400">
          {stats.maxWeight.toFixed(1)}kg
        </div>
      </div>
    </div>
  );
}
