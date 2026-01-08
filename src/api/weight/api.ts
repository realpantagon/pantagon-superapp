import { supabase } from '../../shared/utils/supabase';
import type { WeightEntry, NewWeightEntry } from './types';

export async function fetchWeights(): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('Pantagon_Weight')
    .select('*')
    .order('recorded_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function addWeightEntry(entry: NewWeightEntry): Promise<WeightEntry> {
  const { data, error } = await supabase
    .from('Pantagon_Weight')
    .insert([{
      weight_kg: entry.weight_kg,
      recorded_at: entry.recorded_at
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchMinWeight(): Promise<number> {
  const { data, error } = await supabase
    .from('Pantagon_Weight')
    .select('weight_kg')
    .order('weight_kg', { ascending: true })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data?.weight_kg ?? 0;
}

export async function fetchMaxWeight(): Promise<number> {
  const { data, error } = await supabase
    .from('Pantagon_Weight')
    .select('weight_kg')
    .order('weight_kg', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data?.weight_kg ?? 0;
}

export async function fetchAvgWeight(): Promise<number> {
  const { data, error } = await supabase
    .from('Pantagon_Weight')
    .select('weight_kg');
  
  if (error) throw error;
  if (!data || data.length === 0) return 0;
  
  const sum = data.reduce((acc, row) => acc + Number(row.weight_kg), 0);
  return sum / data.length;
}
