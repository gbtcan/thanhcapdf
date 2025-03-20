import { supabase } from './supabase';
import type { Author } from '../types/hymns';

/**
 * Fetch all authors
 */
export async function fetchAuthors(): Promise<Author[]> {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
}

/**
 * Fetch a single author by ID with related hymns
 */
export async function fetchAuthorById(authorId: string): Promise<Author & { hymns: any[] }> {
  try {
    // First get the author details
    const { data: author, error: authorError } = await supabase
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .single();
      
    if (authorError) throw authorError;
    
    // Then get related hymns
    const { data: hymns, error: hymnsError } = await supabase
      .from('hymn_authors')
      .select(`
        hymn:hymns(
          id,
          title,
          created_at,
          view_count:hymn_views(count)
        )
      `)
      .eq('author_id', authorId)
      .order('hymn(title)');
      
    if (hymnsError) throw hymnsError;
    
    // Format the result
    return {
      ...author,
      hymns: hymns.map(item => ({
        ...item.hymn,
        view_count: item.hymn.view_count?.[0]?.count || 0
      }))
    };
  } catch (error) {
    console.error(`Error fetching author ${authorId}:`, error);
    throw error;
  }
}

/**
 * Create a new author
 */
export async function createAuthor(data: { name: string; biography?: string }): Promise<Author> {
  try {
    const { name, biography } = data;
    
    const { data: author, error } = await supabase
      .from('authors')
      .insert([{ name, biography }])
      .select()
      .single();
      
    if (error) throw error;
    
    return author;
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
}

/**
 * Update an author
 */
export async function updateAuthor(
  authorId: string, 
  data: { name?: string; biography?: string }
): Promise<Author> {
  try {
    const { name, biography } = data;
    const updates: Record<string, any> = {};
    
    if (name !== undefined) updates.name = name;
    if (biography !== undefined) updates.biography = biography;
    
    const { data: author, error } = await supabase
      .from('authors')
      .update(updates)
      .eq('id', authorId)
      .select()
      .single();
      
    if (error) throw error;
    
    return author;
  } catch (error) {
    console.error('Error updating author:', error);
    throw error;
  }
}

/**
 * Delete an author
 */
export async function deleteAuthor(authorId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', authorId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting author:', error);
    throw error;
  }
}

/**
 * Get popular authors based on hymn views
 */
export async function getPopularAuthors(limit: number = 5): Promise<Author[]> {
  try {
    const { data, error } = await supabase.rpc(
      'get_popular_authors',
      { limit_count: limit }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching popular authors:', error);
    throw error;
  }
}
