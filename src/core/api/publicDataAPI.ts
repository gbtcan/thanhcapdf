import { supabase } from '../../lib/supabase/client';
import { HymnWithRelations } from '../../features/catalog/types';
import { config } from '../../config';

/**
 * API functions for accessing public data without authentication
 */

interface HymnsQueryParams {
  search?: string;
  authorId?: number | string;
  themeId?: number | string;
  categoryId?: number | string;
  tagId?: number | string;
  sortBy?: 'title' | 'created_at' | 'view_count';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Fetch public hymns with optional filtering and sorting
 */
export async function fetchPublicHymns(
  page: number = 0,
  pageSize: number = 10,
  params: HymnsQueryParams = {}
): Promise<{ hymns: HymnWithRelations[]; total: number }> {
  try {
    // Start building the query
    let query = supabase
      .from('hymns')
      .select(
        `
        *,
        hymn_authors(authors(*)),
        hymn_themes(themes(*)),
        hymn_tags(tags(*)),
        pdf_files(*),
        audio_files(*)
      `,
        { count: 'exact' }
      )
      .eq('published', true);

    // Apply filters
    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    // Apply sorting
    const sortField = params.sortBy || 'title';
    const sortOrder = { ascending: params.sortDirection !== 'desc' };
    query = query.order(sortField, sortOrder);

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Process the nested data
    const processedHymns = data.map((hymn) => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      themes: hymn.hymn_themes?.map((ht: any) => ht.themes) || [],
      tags: hymn.hymn_tags?.map((ht: any) => ht.tags) || [],
    }));

    return {
      hymns: processedHymns,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching public hymns:', error);
    throw error;
  }
}

/**
 * Fetch a single public hymn by ID
 */
export async function fetchPublicHymn(hymnId: string | number): Promise<HymnWithRelations | null> {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(
        `
        *,
        hymn_authors(authors(*)),
        hymn_themes(themes(*)),
        hymn_tags(tags(*)),
        pdf_files(*),
        audio_files(*),
        video_links(*)
      `
      )
      .eq('id', hymnId)
      .eq('published', true)
      .single();

    if (error) throw error;

    if (!data) return null;

    // Process the nested data
    const processedHymn = {
      ...data,
      authors: data.hymn_authors?.map((ha: any) => ha.authors) || [],
      themes: data.hymn_themes?.map((ht: any) => ht.themes) || [],
      tags: data.hymn_tags?.map((ht: any) => ht.tags) || [],
    };

    return processedHymn;
  } catch (error) {
    console.error(`Error fetching hymn ID ${hymnId}:`, error);
    throw error;
  }
}

/**
 * Increment the view count for a hymn
 */
export async function incrementHymnView(hymnId: string | number): Promise<void> {
  try {
    // Check if this is a development environment
    if (config.isDevelopment && !config.trackViewsInDevelopment) {
      console.log(`[DEV] Would increment view count for hymn ID ${hymnId}`);
      return;
    }

    // Use RPC function if available, otherwise fall back to standard update
    if (config.useRpcFunctions) {
      const { error } = await supabase.rpc('increment_hymn_view', {
        hymn_id: hymnId,
      });

      if (error) throw error;
    } else {
      // Get current view count
      const { data, error: fetchError } = await supabase
        .from('hymns')
        .select('view_count')
        .eq('id', hymnId)
        .single();

      if (fetchError) throw fetchError;

      // Increment view count
      const currentViewCount = data?.view_count || 0;
      const { error: updateError } = await supabase
        .from('hymns')
        .update({ view_count: currentViewCount + 1 })
        .eq('id', hymnId);

      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error(`Error incrementing view count for hymn ID ${hymnId}:`, error);
    // Don't throw the error - view count isn't critical functionality
  }
}

/**
 * Fetch featured or popular hymns for the homepage
 */
export async function fetchFeaturedHymns(limit: number = 6): Promise<HymnWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(
        `
        *,
        hymn_authors(authors(*)),
        hymn_themes(themes(*))
      `
      )
      .eq('published', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Process the nested data
    const processedHymns = data.map((hymn) => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      themes: hymn.hymn_themes?.map((ht: any) => ht.themes) || [],
    }));

    return processedHymns;
  } catch (error) {
    console.error('Error fetching featured hymns:', error);
    throw error;
  }
}
