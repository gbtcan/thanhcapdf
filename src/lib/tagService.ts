import { supabase } from './supabase';
import type { Tag } from '../types/forum';

/**
 * Fetch all tags
 */
export async function fetchTags(): Promise<Tag[]> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

/**
 * Fetch tags with hymn count
 */
export async function fetchTagsWithCount(): Promise<(Tag & { hymn_count: number })[]> {
  try {
    // Use a custom RPC function to get tags with counts
    const { data, error } = await supabase.rpc('get_tags_with_hymn_counts');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tags with count:', error);
    throw error;
  }
}

/**
 * Create a new tag
 */
export async function createTag(name: string): Promise<Tag> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name }])
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
}

/**
 * Update a tag
 */
export async function updateTag(tagId: string, name: string): Promise<Tag> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .update({ name })
      .eq('id', tagId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
}
