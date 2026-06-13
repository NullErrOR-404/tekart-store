import { supabase } from '@/lib/supabase';

// Types (reuse from supabase.ts)
export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  short_description?: string;
  description?: string;
  category_id: string;
  price: number;
  old_price?: number;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  badge?: string;
  brand?: string;
  gallery: string[];
  cover_image: string;
  tags: string[];
  priority: number;
  seo_title?: string;
  seo_description?: string;
  buying_price?: number;
  selling_price?: number;
  created_at: string;
  updated_at: string;
}

export const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data as Product[];
};

export const fetchInventory = async () => {
  const { data, error } = await supabase.from('products').select('id, name, stock, price, selling_price, buying_price');
  if (error) throw error;
  return data as Product[];
};

export const createTransaction = async (payload: any) => {
  const { data, error } = await supabase.from('transactions').insert(payload);
  if (error) throw error;
  return data;
};

export const addCashier = async (email: string, password: string) => {
  const { data, error } = await supabase.from('cashiers').insert({ email, password, role: 'cashier' });
  if (error) throw error;
  return data;
};
