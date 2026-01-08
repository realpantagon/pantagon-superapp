export interface NewWeightEntry {
  weight_kg: number
  details?: string
  recorded_at: string
  exercised: boolean
}

export interface WeightEntry extends NewWeightEntry {
  id: number
}
