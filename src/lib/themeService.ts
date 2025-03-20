import { supabase } from './supabase';
import type { Theme } from '../types/hymns';

/**
 * Fetch all themes
 */
export async function fetchThemes(): Promise<Theme[]> {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
}

/**
 * Fetch a single theme by ID with related hymns
 */
export async function fetchThemeById(themeId: string): Promise<Theme & { hymns: any[] }> {
  try {
    // First get the theme details
    const { data: theme, error: themeError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
      
    if (themeError) throw themeError;
    
    // Then get related hymns
    const { data: hymns, error: hymnsError } = await supabase
      .from('hymn_themes')
      .select(`
        hymn:hymns(
          id,
          title,
          created_at,
          view_count:hymn_views(count)
        )
      `)
      .eq('theme_id', themeId)
      .order('hymn(title)');
      
    if (hymnsError) throw hymnsError;
    
    // Format the result
    return {
      ...theme,
      hymns: hymns.map(item => ({
        ...item.hymn,
        view_count: item.hymn.view_count?.[0]?.count || 0
      }))
    };
  } catch (error) {
    console.error(`Error fetching theme ${themeId}:`, error);
    throw error;
  }
}

/**
 * Create a new theme
 */
export async function createTheme(data: { name: string; description?: string }): Promise<Theme> {
  try {
    const { name, description } = data;
    
    const { data: theme, error } = await supabase
      .from('themes')
      .insert([{ name, description }])
      .select()
      .single();
      
    if (error) throw error;
    
    return theme;
  } catch (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
}

/**
 * Update a theme
 */
export async function updateTheme(
  themeId: string, 
  data: { name?: string; description?: string }
): Promise<Theme> {
  try {
    const { name, description } = data;
    const updates: Record<string, any> = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    const { data: theme, error } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', themeId)
      .select()
      .single();
      
    if (error) throw error;
    
    return theme;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
}

/**
 * Delete a theme
 */
export async function deleteTheme(themeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', themeId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
}

/**
 * Get popular themes based on hymn views
 */
export async function getPopularThemes(limit: number = 5): Promise<Theme[]> {
  try {
    const { data, error } = await supabase.rpc(
      'get_popular_themes',
      { limit_count: limit }
    );
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching popular themes:', error);
    throw error;
  }
}
