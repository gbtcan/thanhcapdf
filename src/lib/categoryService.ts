import { supabase } from './supabase';
import type { Category } from '../types/categories';

/**
 * Fetch categories with robust error handling
 * @returns Array of categories or empty array if table doesn't exist
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    // First check if the categories table exists
    const tableExists = await checkCategoriesTableExists();
    
    // If table doesn't exist, return empty array
    if (!tableExists) {
      console.warn('Categories table does not exist yet');
      return [];
    }
    
    // If table exists, fetch categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      // Special handling for specific error codes
      if (error.code === '42P01') { // undefined_table
        console.warn('Categories table does not exist yet');
        return [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Check if categories table exists in the database
 */
export async function checkCategoriesTableExists(): Promise<boolean> {
  try {
    // Try to use our custom function if it exists
    try {
      const { data, error } = await supabase
        .rpc('check_table_exists', { table_name: 'categories' });
      
      if (!error && data !== null) {
        return !!data;
      }
    } catch (rpcError) {
      console.warn('check_table_exists RPC not available:', rpcError);
    }
    
    // Fallback: Check by trying to fetch with limit 0
    const { error } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .limit(0);
    
    // If no error, table exists
    if (!error) {
      return true;
    }
    
    // If error code is related to table not found, table doesn't exist
    if (error && (error.code === '42P01' || error.code === 'PGRST301')) {
      return false;
    }
    
    // For any other error, log and assume table doesn't exist
    console.error('Error checking categories table:', error);
    return false;
  } catch (error) {
    console.error('Error checking if categories table exists:', error);
    return false;
  }
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  try {
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    
    return newCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}