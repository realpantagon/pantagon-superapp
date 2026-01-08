import { supabase } from '../../shared/utils/supabase';
import type { PantagonItem } from './types';

export async function fetchItems(): Promise<PantagonItem[]> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .select('*')
    .order('buy_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchItemById(id: string): Promise<PantagonItem> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createItem(item: Omit<PantagonItem, 'id' | 'created_at' | 'updated_at'>): Promise<PantagonItem> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id: string, updates: Partial<PantagonItem>): Promise<PantagonItem> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('pantagon_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchUniqueGroups(): Promise<string[]> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .select('group_name')
    .not('group_name', 'is', null);

  if (error) throw error;
  
  const uniqueGroups = Array.from(new Set(data.map(item => item.group_name).filter(Boolean))) as string[];
  return uniqueGroups;
}

export async function fetchUniqueCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .select('category')
    .not('category', 'is', null);

  if (error) throw error;
  
  const uniqueCategories = Array.from(new Set(data.map(item => item.category).filter(Boolean))) as string[];
  return uniqueCategories;
}

export async function fetchUniquePurchaseSources(): Promise<string[]> {
  const { data, error } = await supabase
    .from('pantagon_items')
    .select('purchase_source')
    .not('purchase_source', 'is', null);

  if (error) throw error;
  
  const uniqueSources = Array.from(new Set(data.map(item => item.purchase_source).filter(Boolean))) as string[];
  return uniqueSources;
}
