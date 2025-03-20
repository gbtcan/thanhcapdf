import { supabase } from '../supabase';
import { Hymn, HymnWithDetails, HymnSearchParams } from '../../types/hymns';

/**
 * Fetch all hymns with optional filtering
 */
export async function fetchHymns(params: HymnSearchParams = {}): Promise<{
  hymns: HymnWithDetails[];
  totalCount: number;
}> {
  try {
    const {
      query,
      authorId,
      themeId,
      tagId,
      page = 1,
      limit = 10,
      sortBy = 'title'
    } = params;

    // Calculate offset for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Start building the query
    let query = supabase
      .from('hymns')
      .select(`
        *,
        pdf_files(*),
        authors:hymn_authors(authors(*)),
        themes:hymn_themes(themes(*)),
        tags:hymn_tags(tags(*)),
        view_count:hymn_views(count)
      `, { count: 'exact' });

    // Apply text search if provided
    if (query) {
      query = query.textSearch('search_vector', query);
    }

    // Apply author filter if provided
    if (authorId) {
      query = query.eq('hymn_authors.author_id', authorId);
    }

    // Apply theme filter if provided
    if (themeId) {
      query = query.eq('hymn_themes.theme_id', themeId);
    }

    // Apply tag filter if provided
    if (tagId) {
      query = query.eq('hymn_tags.tag_id', tagId);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('title', { ascending: true });
    }

    // Apply pagination
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data to match our HymnWithDetails type
    const hymns = data.map(hymn => ({
      ...hymn,
      authors: hymn.authors?.map((ha: any) => ha.authors) || [],
      themes: hymn.themes?.map((ht: any) => ht.themes) || [],
      tags: hymn.tags?.map((ht: any) => ht.tags) || [],
      view_count: hymn.view_count?.[0]?.count || 0
    }));

    return {
      hymns,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching hymns:', error);
    throw error;
  }
}

// ... other hymn-related API functions
