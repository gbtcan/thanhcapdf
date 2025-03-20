import { supabase } from '../lib/supabase';
import { HymnWithRelations, Author, Category, Tag } from '../types';
import { safeQuery } from '../lib/supabase';
import { handleSupabaseError } from './errorHandler';

/**
 * Updates RLS policies to allow anonymous access for public data tables
 * This should be run in a migration script or manually by an admin
 */
export const setupPublicDataAccess = async () => {
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) {
    console.error('No admin token found. Cannot setup public data access.');
    return false;
  }
  
  try {
    // Create admin client with service_role key
    const { error } = await supabase.rpc('setup_public_access', {
      tables: ['hymns', 'authors', 'categories', 'hymn_authors', 'hymn_categories']
    });
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to setup public data access:', err);
    return false;
  }
};

/**
 * Utility to handle 401 errors by converting them to readable messages
 */
export const handle401Error = (error: any) => {
  if (error?.status === 401 || error?.code === 'PGRST301') {
    return {
      message: 'You need to log in to access this data. Try signing in first.',
      suggestion: 'If this is public data, the administrator needs to enable anonymous access.'
    };
  }
  
  return {
    message: error?.message || 'An unknown error occurred',
    suggestion: 'Please try again or contact support.'
  };
};

/**
 * Utility functions for accessing public data from Supabase
 * These functions don't require authentication and can be used for SSR or public pages
 */

/**
 * Get a list of featured hymns for the homepage
 */
export async function getFeaturedHymns(limit = 5): Promise<HymnWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        id,
        title,
        lyrics,
        view_count,
        created_at,
        hymn_authors:hymn_authors(authors(*)),
        hymn_categories:hymn_categories(categories(*)),
        pdf_files(id, file_url)
      `)
      .eq('featured', true)
      .eq('status', 'approved')
      .order('view_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || [],
      pdfUrl: hymn.pdf_files && hymn.pdf_files.length > 0 ? hymn.pdf_files[0].file_url : null
    }));
  } catch (error) {
    console.error('Error fetching featured hymns:', error);
    return [];
  }
}

/**
 * Get most popular hymns based on view count
 */
export async function getPopularHymns(limit = 10): Promise<HymnWithRelations[]> {
  return safeQuery(async () => {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        id,
        title,
        lyrics,
        view_count,
        created_at,
        hymn_authors:hymn_authors(authors(*)),
        hymn_categories:hymn_categories(categories(*))
      `)
      .eq('status', 'approved')
      .order('view_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return {
      data: data.map(hymn => ({
        ...hymn,
        authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
        categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
      })),
      error: null
    };
  }, []);
}

/**
 * Get recently added hymns
 */
export async function getRecentHymns(limit = 10): Promise<HymnWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        id,
        title,
        lyrics,
        view_count,
        created_at,
        hymn_authors:hymn_authors(authors(*)),
        hymn_categories:hymn_categories(categories(*))
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
    }));
  } catch (error) {
    console.error('Error fetching recent hymns:', error);
    return [];
  }
}

/**
 * Get all categories with hymn counts
 */
export async function getAllCategories(): Promise<(Category & { hymn_count: number })[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_categories_with_hymn_count');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching categories with hymn count:', error);
    return [];
  }
}

/**
 * Get authors with highest hymn counts
 */
export async function getPopularAuthors(limit = 10): Promise<(Author & { hymn_count: number })[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_authors_with_hymn_count')
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching popular authors:', error);
    return [];
  }
}

/**
 * Get all available tags
 */
export async function getAllTags(): Promise<Tag[]> {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Get recent forum posts for the home page
 */
export async function getRecentForumPosts(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        id,
        title,
        created_at,
        comment_count,
        like_count,
        user_id,
        users:user_id (display_name)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching recent forum posts:', error);
    return [];
  }
}

/**
 * Get application stats
 */
export async function getAppStats() {
  try {
    const { data, error } = await supabase.rpc('get_app_stats');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching app stats:', error);
    return {
      hymn_count: 0,
      author_count: 0,
      category_count: 0,
      user_count: 0,
      post_count: 0
    };
  }
}

/**
 * Fetch public data that doesn't require authentication
 * These functions provide a safe way to access data from public routes
 */

/**
 * Fetch all available categories
 */
export async function fetchPublicCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return [];
  }
}

/**
 * Fetch all available authors
 */
export async function fetchPublicAuthors() {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public authors:', error);
    return [];
  }
}

/**
 * Fetch public hymns list (only approved hymns)
 */
export async function fetchPublicHymns(
  options: {
    limit?: number,
    page?: number,
    sortBy?: 'title' | 'newest' | 'popular'
  } = {}
) {
  const {
    limit = 10,
    page = 1,
    sortBy = 'title'
  } = options;
  
  try {
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Create query
    let query = supabase
      .from('hymns')
      .select('id, title, view_count, created_at', { count: 'exact' })
      .eq('status', 'approved') // Only return approved hymns
      .range(from, to);
    
    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else {
      // Default sort by title
      query = query.order('title', { ascending: true });
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      hymns: data,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching public hymns:', error);
    return { hymns: [], totalCount: 0 };
  }
}

/**
 * Fetch a single public hymn
 */
export async function fetchPublicHymnById(id: string) {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(authors(*)),
        hymn_categories(categories(*)),
        pdf_files(*)
      `)
      .eq('id', id)
      .eq('status', 'approved') // Only return approved hymns
      .single();
    
    if (error) throw error;
    
    // Format data structure
    return {
      ...data,
      authors: data.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: data.hymn_categories?.map((hc: any) => hc.categories) || []
    };
  } catch (error) {
    console.error(`Error fetching public hymn ${id}:`, error);
    return null;
  }
}

/**
 * Fetch recent forum posts
 */
export async function fetchPublicForumPosts(
  options: {
    limit?: number,
    page?: number
  } = {}
) {
  const {
    limit = 5,
    page = 1
  } = options;
  
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        id, 
        title, 
        created_at,
        comment_count,
        users (display_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public forum posts:', error);
    return [];
  }
}

/**
 * Public data access helpers
 * Functions that don't require authentication to access public data
 */

/**
 * Fetch hymn by ID (public version)
 * @param id - The hymn ID
 * @returns The hymn data
 */
export async function fetchPublicHymn(id: string) {
  try {
    const { data, error } = await supabase
      .from('hymns_new')
      .select(`
        *,
        authors:hymn_authors(authors(*)),
        themes:hymn_themes(themes(*)),
        tags:hymn_tags(tags(*))
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Process nested relations
    return {
      ...data,
      authors: data.authors?.map((a: any) => a.authors) || [],
      themes: data.themes?.map((t: any) => t.themes) || [],
      tags: data.tags?.map((t: any) => t.tags) || []
    };
  } catch (error) {
    console.error(`Error fetching public hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch available PDF files for a hymn (public)
 * @param hymnId - The hymn ID
 * @returns The PDF files
 */
export async function fetchPublicPdfFiles(hymnId: string) {
  try {
    const { data, error } = await supabase
      .from('hymn_pdf_files')
      .select('*')
      .eq('hymn_id', hymnId)
      .order('created_at');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching public PDF files for hymn ${hymnId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch available audio files for a hymn (public)
 * @param hymnId - The hymn ID
 * @returns The audio files
 */
export async function fetchPublicAudioFiles(hymnId: string) {
  try {
    const { data, error } = await supabase
      .from('hymn_audio_files')
      .select('*')
      .eq('hymn_id', hymnId)
      .order('created_at');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching public audio files for hymn ${hymnId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Increment hymn view count (for analytics)
 * @param hymnId - The hymn ID
 */
export async function incrementPublicHymnView(hymnId: string) {
  try {
    // Call the RPC function to increment the view count
    const { error } = await supabase.rpc('increment_hymn_view', {
      hymn_id: hymnId
    });
    
    if (error) throw error;
  } catch (error) {
    // Don't throw on view count errors, just log
    console.error(`Error incrementing view count for hymn ${hymnId}:`, error);
  }
}

/**
 * Fetch public authors list
 * @returns List of authors
 */
export async function fetchPublicAuthors() {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public authors:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch public themes list
 * @returns List of themes
 */
export async function fetchPublicThemes() {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public themes:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Search hymns by text query (public)
 * @param query - Search query
 * @param limit - Result limit
 * @returns Search results
 */
export async function searchPublicHymns(query: string, limit = 10) {
  try {
    if (!query.trim()) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('hymns_new')
      .select(`
        id,
        title,
        authors:hymn_authors(authors(id, name))
      `)
      .or(`title.ilike.%${query}%,lyrics.ilike.%${query}%`)
      .limit(limit);
      
    if (error) throw error;
    
    // Process nested authors
    return data.map((hymn: any) => ({
      ...hymn,
      authors: hymn.authors?.map((a: any) => a.authors) || []
    }));
  } catch (error) {
    console.error(`Error searching public hymns for "${query}":`, error);
    throw handleSupabaseError(error);
  }
}
