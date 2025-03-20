import { supabase } from '../supabase/client';
import { sessionManager } from '../sessionManager';
import { clientConfig } from '../../config/clientConfig';

/**
 * Get a hymn by its ID including related data
 * @param id The hymn ID to fetch
 * @returns The hymn object or null if not found
 */
export async function getHymnById(id: string) {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        *,
        authors(*),
        categories(*),
        pdf_files(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching hymn:', error);
      return null;
    }

    // Record view if tracking is enabled
    try {
      await recordHymnView(id);
    } catch (viewError) {
      console.warn('Failed to record hymn view:', viewError);
    }

    return data;
  } catch (error) {
    console.error('Error in getHymnById:', error);
    return null;
  }
}

// ...existing code...

/**
 * Get popular hymns based on view count
 * @param limit Max number of hymns to return
 * @returns Array of popular hymns
 */
export async function getPopularHymns(limit = 10) {
  try {
    // First check if view_count column exists in hymns table
    try {
      const { data, error } = await supabase
        .from('hymns')
        .select(`
          id,
          title,
          lyrics,
          view_count,
          authors(name),
          pdf_files(id)
        `)
        .order('view_count', { ascending: false })
        .limit(limit);
        
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.log('Error fetching hymns with view count, trying without:', e);
    }
    
    // Fallback to just fetching hymns without sorting by views
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        id,
        title,
        lyrics,
        authors(name),
        pdf_files(id)
      `)
      .limit(limit);
      
    if (error) {
      console.error('Error fetching popular hymns:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPopularHymns:', error);
    return [];
  }
}

// ...existing code...
