import { useState, useEffect } from "react";
import { 
  AddButton,
  AddWeightModal, 
  Header,
  WeightChart, 
  WeightEntriesList, 
  WeightStatsComponent 
} from "../components";
import { fetchWeights, addWeightEntry, fetchMinWeight, fetchMaxWeight, fetchAvgWeight } from "../../../api/weight/api";
import type { WeightEntry, NewWeightEntry } from "../../../api/weight/types";

export default function WeightDashboard() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalChange: number;
    minWeight: number;
    maxWeight: number;
    avgWeight: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const weightsData = await fetchWeights();
      setWeights(weightsData);
      
      if (weightsData.length > 1) {
        const [minWeight, maxWeight, avgWeight] = await Promise.all([
          fetchMinWeight(),
          fetchMaxWeight(),
          fetchAvgWeight()
        ]);
        
        setStats({
          totalChange: weightsData[weightsData.length - 1].weight_kg - weightsData[0].weight_kg,
          minWeight,
          maxWeight,
          avgWeight
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (entry: NewWeightEntry): Promise<void> => {
    const newEntry = await addWeightEntry(entry);
    const updatedWeights = [...weights, newEntry];
    setWeights(updatedWeights);
    
    if (updatedWeights.length > 1) {
      const [minWeight, maxWeight, avgWeight] = await Promise.all([
        fetchMinWeight(),
        fetchMaxWeight(),
        fetchAvgWeight()
      ]);
      
      setStats({
        totalChange: updatedWeights[updatedWeights.length - 1].weight_kg - updatedWeights[0].weight_kg,
        minWeight,
        maxWeight,
        avgWeight
      });
    }
    
    setShowModal(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading weight data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Header 
        totalEntries={weights.length}
        latestEntryDate={weights.length > 0 ? weights[weights.length - 1].recorded_at : undefined}
        formatDate={formatDate}
      />

      <WeightChart weights={weights} />

      <WeightStatsComponent stats={stats} />

      <AddButton onClick={() => setShowModal(true)} />

      <WeightEntriesList weights={weights} formatDate={formatDate} />

      {showModal && (
        <AddWeightModal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          defaultWeight={
            weights.length > 0 ? weights[weights.length - 1].weight_kg : 83.0
          }
        />
      )}
    </>
  );
}
