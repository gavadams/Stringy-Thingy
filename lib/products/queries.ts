import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export async function getAllProducts() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getProductsByType(kitType: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('kit_type', kitType)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by type:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// Admin functions
export async function createProduct(productData: ProductInsert) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateProduct(id: string, productData: ProductUpdate) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return { error: error.message };
  }

  return { error: null };
}

export async function updateStock(id: string, quantity: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .update({ stock: quantity })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating stock:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getAllProductsForAdmin() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all products for admin:', error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
