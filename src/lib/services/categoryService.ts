import { supabase } from '../supabase';
import type { Category } from '../../types';

/**
 * Fetch all categories
 * @param options Query options like sorting and limits
 * @returns Promise with categories array
 */
export async function fetchCategories(options: { 
  sort?: string; 
  order?: 'asc' | 'desc';
  limit?: number;
  featured?: boolean;
} = {}): Promise<Category[]> {
  try {
    const {
      sort = 'name',
      order = 'asc',
      limit = 100,
      featured
    } = options;

    let query = supabase
      .from('categories')
      .select('*')
      .order(sort, { ascending: order === 'asc' });
      
    // Filter by featured if specified
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    // Apply limit
    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') {
        console.warn('Categories table not found, returning empty array');
        return [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}

/**
 * Fetch a single category by ID
 * @param id Category ID
 * @returns Promise with category object
 */
export async function fetchCategoryById(id: string | number): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') {
        console.warn('Categories table not found, returning null');
        return null;
      }
      
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new category
 * @param categoryData Category data to create
 * @returns Promise with the created category
 */
export async function createCategory(categoryData: Partial<Category>): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') {
        console.warn('Categories table not found, cannot create category');
        throw new Error('Categories table not found');
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * Update an existing category
 * @param id Category ID to update
 * @param updates Category data updates
 * @returns Promise with the updated category
 */
export async function updateCategory(id: string | number, updates: Partial<Category>): Promise<Category> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') {
        console.warn('Categories table not found, cannot update category');
        throw new Error('Categories table not found');
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a category
 * @param id Category ID to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteCategory(id: string | number): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01') {
        console.warn('Categories table not found, cannot delete category');
        throw new Error('Categories table not found');
      }
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
}
