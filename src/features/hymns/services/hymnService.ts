/**
 * Service for hymn operations
 */
import { supabase } from '../../../lib/supabase';
import { Hymn, HymnWithRelations, HymnFilterOptions } from '../types';

/**
 * Fetch a single hymn with related data by ID
 */
export async function fetchHymnById(id: string) {
  try {
    // 1. Fetch the hymn base data
    const { data: hymn, error: hymnError } = await supabase
      .from('hymns_new')
      .select('id, title, lyrics, view_count, created_at, updated_at, created_by')
      .eq('id', id)
      .single();
      
    if (hymnError) throw hymnError;
    if (!hymn) throw new Error('Hymn not found');
    
    // 2. Fetch authors for the hymn
    const { data: authorRelations, error: authorRelError } = await supabase
      .from('hymn_authors')
      .select('author_id')
      .eq('hymn_id', id);
      
    if (authorRelError) throw authorRelError;
    
    let authors = [];
    if (authorRelations?.length > 0) {
      const authorIds = authorRelations.map(rel => rel.author_id);
      
      const { data: authorsData, error: authorsError } = await supabase
        .from('authors')
        .select('id, name, biography')
        .in('id', authorIds);
        
      if (authorsError) throw authorsError;
      authors = authorsData || [];
    }
    
    // 3. Fetch themes for the hymn
    const { data: themeRelations, error: themeRelError } = await supabase
      .from('hymn_themes')
      .select('theme_id')
      .eq('hymn_id', id);
      
    if (themeRelError) throw themeRelError;
    
    let themes = [];
    if (themeRelations?.length > 0) {
      const themeIds = themeRelations.map(rel => rel.theme_id);
      
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('id, name, description')
        .in('id', themeIds);
        
      if (themesError) throw themesError;
      themes = themesData || [];
    }
    
    // 4. Increment view count
    await incrementHymnViewCount(id);
    
    // 5. Return the hymn with related data
    return {
      ...hymn,
      authors,
      themes
    };
  } catch (error) {
    console.error('Error fetching hymn:', error);
    throw error;
  }
}

/**
 * Increment the view count for a hymn
 */
async function incrementHymnViewCount(id: string) {
  try {
    // 1. Insert a new view record
    await supabase
      .from('hymn_views')
      .insert({
        hymn_id: id,
        viewed_at: new Date().toISOString(),
        view_date: new Date().toISOString().split('T')[0]
      });
      
    // 2. Update the view count in the hymn record
    await supabase
      .from('hymns_new')
      .update({
        view_count: supabase.rpc('increment_counter', {row_id: id, table_name: 'hymns_new', counter_name: 'view_count'}),
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', id);
  } catch (error) {
    // Log error but don't throw - view counting is non-critical
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Fetch popular hymns with author information
 */
export async function fetchPopularHymns(limit = 5) {
  try {
    // 1. Fetch hymns, ordered by view_count
    const { data: hymns, error } = await supabase
      .from('hymns_new')
      .select('id, title, view_count')
      .order('view_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // 2. For each hymn, fetch authors
    const hymnsWithAuthors = await Promise.all((hymns || []).map(async (hymn) => {
      const { data: authorRels } = await supabase
        .from('hymn_authors')
        .select('authors!hymn_authors_author_id_fkey(id, name)')
        .eq('hymn_id', hymn.id);
        
      let authors = [];
      if (authorRels?.length > 0) {
        authors = authorRels.map(rel => rel.authors);
      }
      
      return {
        ...hymn,
        authors
      };
    }));
    
    return hymnsWithAuthors;
  } catch (error) {
    console.error('Error fetching popular hymns:', error);
    return [];
  }
}

/**
 * Fetch recent hymns with author information
 */
export async function fetchRecentHymns(limit = 4) {
  try {
    // 1. Fetch hymns, ordered by created_at
    const { data: hymns, error } = await supabase
      .from('hymns_new')
      .select('id, title, view_count, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // 2. For each hymn, fetch the primary author
    const hymnsWithAuthors = await Promise.all((hymns || []).map(async (hymn) => {
      const { data: authorRels } = await supabase
        .from('hymn_authors')
        .select('author_id')
        .eq('hymn_id', hymn.id)
        .limit(1);
        
      let authorName, authorId;
      
      if (authorRels?.length > 0) {
        const { data: author } = await supabase
          .from('authors')
          .select('id, name')
          .eq('id', authorRels[0].author_id)
          .single();
          
        if (author) {
          authorId = author.id;
          authorName = author.name;
        }
      }
      
      return {
        ...hymn,
        author_id: authorId,
        author_name: authorName
      };
    }));
    
    return hymnsWithAuthors;
  } catch (error) {
    console.error('Error fetching recent hymns:', error);
    throw error;
  }
}

/**
 * Search and filter hymns with pagination
 */
export async function searchHymns(options: HymnFilterOptions, page: number = 0, pageSize: number = 12) {
  try {
    // Start basic query
    let query = supabase.from('hymns_new').select('id, title, lyrics, view_count, created_at, updated_at', { count: 'exact' });
    
    // Apply search term
    if (options.searchTerm) {
      query = query.ilike('title', `%${options.searchTerm}%`);
    }
    
    // Apply sorting
    if (options.sortBy) {
      const ascending = options.sortDirection !== 'desc';
      query = query.order(options.sortBy, { ascending });
    }
    
    // Apply pagination
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Enrich hymns with basic relationship data
    const hymns = data || [];
    for (const hymn of hymns) {
      // Add authors
      const { data: authorRelations } = await supabase
        .from('hymn_authors')
        .select('author_id')
        .eq('hymn_id', hymn.id);
      
      let authors = [];
      if (authorRelations?.length > 0) {
        const authorIds = authorRelations.map(rel => rel.author_id);
        
        const { data: authorsData } = await supabase
          .from('authors')
          .select('id, name')
          .in('id', authorIds);
          
        authors = authorsData || [];
      }
      
      hymn.authors = authors;
      
      // Add PDF files count
      const { data: pdfData } = await supabase
        .from('hymn_pdf_files')
        .select('id')
        .eq('hymn_id', hymn.id);
        
      hymn.pdf_files = pdfData || [];
    }
    
    // Apply client-side filtering if needed
    let filteredHymns = hymns;
    
    if (options.hasLyrics) {
      filteredHymns = filteredHymns.filter(h => h.lyrics && h.lyrics.trim() !== '');
    }
    
    if (options.hasPdf) {
      filteredHymns = filteredHymns.filter(h => (h.pdf_files?.length || 0) > 0);
    }
    
    return {
      hymns: filteredHymns,
      totalCount: count || 0,
      hasMore: (count || 0) > (page + 1) * pageSize
    };
  } catch (error) {
    console.error('Error searching hymns:', error);
    throw error;
  }
}

/**
 * Safely increment a hymn's view count
 */
export async function incrementHymnView(hymnId: string, userId?: string): Promise<boolean> {
  try {
    if (!hymnId) return false;
    
    // Try increment_hymn_view RPC first
    try {
      const { error } = await supabase.rpc('increment_hymn_view', {
        hymn_id: hymnId
      });
      
      if (!error) {
        // Add to hymn_views table if we have a user ID
        if (userId) {
          await supabase.from('hymn_views').insert({
            hymn_id: hymnId,
            user_id: userId,
            viewed_at: new Date().toISOString(),
            view_date: new Date().toISOString().split('T')[0]
          });
        }
        
        return true;
      }
    } catch (e) {
      console.warn('RPC fallback needed:', e);
    }
    
    // Direct update fallback
    const { data: currentData } = await supabase
      .from('hymns_new')
      .select('view_count')
      .eq('id', hymnId)
      .single();
      
    if (currentData) {
      const newCount = (currentData.view_count || 0) + 1;
      const { error } = await supabase
        .from('hymns_new')
        .update({ 
          view_count: newCount,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', hymnId);
        
      if (!error) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    console.error('Error incrementing view count:', e);
    return false;
  }
}

/**
 * Toggle a hymn as favorite for a user
 */
export async function toggleHymnFavorite(hymnId: string, userId: string): Promise<boolean> {
  try {
    // Check if already favorited
    const { data } = await supabase
      .from('hymn_likes')
      .select('id')
      .eq('hymn_id', hymnId)
      .eq('user_id', userId)
      .single();
    
    if (data) {
      // Remove favorite
      const { error } = await supabase
        .from('hymn_likes')
        .delete()
        .eq('hymn_id', hymnId)
        .eq('user_id', userId);
        
      return !error;
    } else {
      // Add favorite
      const { error } = await supabase
        .from('hymn_likes')
        .insert({
          hymn_id: hymnId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        
      return !error;
    }
  } catch (e) {
    console.error('Error toggling favorite:', e);
    return false;
  }
}

/**
 * Get popular hymns for homepage or widget
 */
export async function getPopularHymns(limit: number = 8): Promise<any[]> {
  try {
    // Get hymns sorted by view count
    const { data: hymns, error } = await supabase
      .from('hymns_new')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Enrich hymns with basic relationship data
    if (hymns) {
      for (const hymn of hymns) {
        // Add authors
        const { data: authorData } = await supabase
          .from('hymn_authors')
          .select('authors!hymn_authors_author_id_fkey(id, name)')
          .eq('hymn_id', hymn.id);
          
        if (authorData) {
          hymn.authors = authorData.map(a => ({ author: a.authors }));
        }
        
        // Add PDF files count
        const { data: pdfData } = await supabase
          .from('hymn_pdf_files')
          .select('id')
          .eq('hymn_id', hymn.id);
          
        hymn.pdf_files = pdfData || [];
      }
    }
    
    return hymns || [];
  } catch (error) {
    console.error('Error fetching popular hymns:', error);
    return [];
  }
}

/**
 * Get recently added hymns
 */
export async function getRecentHymns(limit: number = 8): Promise<any[]> {
  try {
    // Get hymns sorted by creation date
    const { data: hymns, error } = await supabase
      .from('hymns_new')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Enrich hymns with basic relationship data
    if (hymns) {
      for (const hymn of hymns) {
        // Add authors
        const { data: authorData } = await supabase
          .from('hymn_authors')
          .select('authors!hymn_authors_author_id_fkey(id, name)')
          .eq('hymn_id', hymn.id);
          
        if (authorData) {
          hymn.authors = authorData.map(a => ({ author: a.authors }));
        }
        
        // Add PDF files count
        const { data: pdfData } = await supabase
          .from('hymn_pdf_files')
          .select('id')
          .eq('hymn_id', hymn.id);
          
        hymn.pdf_files = pdfData || [];
      }
    }
    
    return hymns || [];
  } catch (error) {
    console.error('Error fetching recent hymns:', error);
    return [];
  }
}
