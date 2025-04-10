import { supabase } from './supabase';
import { getSupabasePdfUrl } from '../utils/pdf/pdfConfig';
import { HymnWithRelations, HymnDetails, Author, Category, Theme, Tag, PdfFile } from '../types';
import { handleSupabaseError } from '../utils/errorHandler';
import { HymnSearchParams, HymnSearchResults } from '../types/hymns';
import { getTableName } from '../utils/tableMapper';
import { createSafeQuery } from '../utils/queryErrorHandler';

/**
 * Fetch hymn details by ID
 */
export async function fetchHymnDetails(hymnId: string): Promise<HymnDetails | null> {
  try {
    // First check if the hymn exists with a basic query
    const { data: hymnData, error: hymnError } = await supabase
      .from('hymns_new')
      .select('*')
      .eq('id', hymnId)
      .single();
      
    if (hymnError) {
      if (hymnError.code === 'PGRST116') {
        return null; // Hymn not found
      }
      throw hymnError;
    }
    
    // If the hymn exists, try to fetch all the related data
    try {
      // Fetch authors separately
      const { data: authors, error: authorsError } = await supabase
        .from('hymn_authors')
        .select('authors(*)')
        .eq('hymn_id', hymnId);
        
      if (authorsError && authorsError.code !== '42P01') {
        console.error('Error fetching hymn authors:', authorsError);
      }
      
      // Fetch themes separately
      const { data: themes, error: themesError } = await supabase
        .from('hymn_themes')
        .select('themes(*)')
        .eq('hymn_id', hymnId);
        
      if (themesError && themesError.code !== '42P01') {
        console.error('Error fetching hymn themes:', themesError);
      }
      
      // Fetch PDF files separately
      const { data: pdfFiles, error: pdfFilesError } = await supabase
        .from('pdf_files')
        .select('*')
        .eq('hymn_id', hymnId);
        
      if (pdfFilesError && pdfFilesError.code !== '42P01') {
        console.error('Error fetching hymn PDF files:', pdfFilesError);
      }
      
      // Combine all data into a hymn details object
      const hymnDetails: HymnDetails = {
        ...hymnData,
        authors: authors?.map(item => item.authors) || [],
        themes: themes?.map(item => item.themes) || [],
        pdf_files: pdfFiles || []
      };
      
      return hymnDetails;
    } catch (relationError) {
      console.error('Error fetching hymn relations:', relationError);
      
      // Return basic hymn data if relations fail
      return {
        ...hymnData,
        authors: [],
        themes: [],
        pdf_files: []
      };
    }
  } catch (error) {
    console.error('Error fetching hymn details:', error);
    return null;
  }
}

/**
 * Fetch popular hymns
 */
export async function fetchPopularHymns(limit: number = 5): Promise<HymnWithRelations[]> {
  try {
    // Get hymns with most views
    const { data, error } = await supabase.rpc('get_most_viewed_hymns', { limit_count: limit });
      
    if (error) throw error;
    
    // Get full details for these hymns
    if (data && data.length > 0) {
      const hymnIds = data.map(item => item.hymn_id);
      
      const { data: hymns, error: hymnsError } = await supabase
        .from('hymns_new')
        .select(`
          id,
          title,
          hymn_authors(author_id, authors(id, name)),
          hymn_pdf_files(id)
        `)
        .in('id', hymnIds);
      
      if (hymnsError) throw hymnsError;
      
      // Transform and return data
      return hymns.map(hymn => ({
        ...hymn,
        authors: hymn.hymn_authors?.map(ha => ha.authors) || []
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching popular hymns:', error);
    return [];
  }
}

/**
 * Fetch hymns with pagination and search
 */
export async function fetchHymns(params: HymnSearchParams = {}): Promise<HymnSearchResults> {
  try {
    const {
      query,
      authorId,
      themeId,
      tagId,
      sortBy = 'title',
      page = 1,
      limit = 10
    } = params;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query - Fix the relationship naming to be explicit
    let hymnQuery = supabase
      .from('hymns_new')
      .select(`
        *,
        authors:hymn_authors(authors!hymn_authors_author_id_fkey(*)),
        themes:hymn_themes(themes!hymn_themes_theme_id_fkey(*)),
        tags:hymn_tags(tags!hymn_tags_tag_id_fkey(*)),
        pdf_files:hymn_pdf_files(*),
        audio_files:hymn_audio_files(*),
        video_links:hymn_video_links(*)
      `, { count: 'exact' });

    // Apply text search if query is provided
    if (query) {
      hymnQuery = hymnQuery.or(`title.ilike.%${query}%, lyrics.ilike.%${query}%`);
    }

    // Apply author filter
    if (authorId) {
      hymnQuery = hymnQuery.filter('hymn_authors.authors.id', 'eq', authorId);
    }

    // Apply theme filter
    if (themeId) {
      hymnQuery = hymnQuery.filter('hymn_themes.themes.id', 'eq', themeId);
    }

    // Apply tag filter
    if (tagId) {
      hymnQuery = hymnQuery.filter('hymn_tags.tags.id', 'eq', tagId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        hymnQuery = hymnQuery.order('created_at', { ascending: false });
        break;
      case 'popular':
        hymnQuery = hymnQuery.order('view_count', { ascending: false });
        break;
      case 'title':
      default:
        hymnQuery = hymnQuery.order('title', { ascending: true });
        break;
    }

    // Apply pagination
    hymnQuery = hymnQuery.range(from, to);

    // Execute query
    const { data, error, count } = await hymnQuery;

    if (error) throw error;

    // Process results to match expected structure
    const hymns = data.map(processHymnRelations);

    return {
      hymns,
      totalCount: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching hymns:', error);
    throw handleSupabaseError(error);
  }
}

export async function recordHymnView(hymnId: string, userId?: string): Promise<void> {
  try {
    await supabase.rpc('increment_hymn_view', { hymn_id: hymnId, user_id: userId || null });
  } catch (error) {
    console.error('Error recording hymn view:', error);
  }
}

/**
 * Delete a hymn and all its relationships
 */
export async function deleteHymn(hymnId: string): Promise<void> {
  try {
    // Delete will cascade to related tables through database constraints
    const { error } = await supabase
      .from('hymns_new')
      .delete()
      .eq('id', hymnId);
    
    if (error) throw error;
    return { success: true } as any;
  } catch (error) {
    console.error('Error deleting hymn:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Toggle a hymn as favorite for the current user
 */
export async function toggleHymnFavorite(hymnId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to favorite hymns');
    }
    
    // Kiểm tra xem bảng hymn_likes đã tồn tại chưa
    const tableExists = await checkTableExists('hymn_likes');
    
    if (tableExists) {
      // Sử dụng bảng hymn_likes (cấu trúc mới)
      const { data: existingFavorite, error: checkError } = await supabase
        .from('hymn_likes')
        .select('id')
        .eq('hymn_id', hymnId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingFavorite) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('hymn_likes')
          .delete()
          .eq('id', existingFavorite.id);
          
        if (deleteError) throw deleteError;
        return false; // Not favorited anymore
      } else {
        // Add favorite
        const { error: insertError } = await supabase
          .from('hymn_likes')
          .insert({ 
            hymn_id: hymnId,
            user_id: user.id 
          });
          
        if (insertError) throw insertError;
        return true; // Now favorited
      }
    } else {
      // Sử dụng bảng likes (cấu trúc cũ)
      const { data: existingFavorite, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('hymn_id', hymnId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingFavorite) {
        // Remove favorite
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingFavorite.id);
          
        if (deleteError) throw deleteError;
        return false; // Not favorited anymore
      } else {
        // Add favorite
        const { error: insertError } = await supabase
          .from('likes')
          .insert({ 
            hymn_id: hymnId,
            user_id: user.id,
            post_id: null,
            comment_id: null
          });
          
        if (insertError) throw insertError;
        return true; // Now favorited
      }
    }
  } catch (error) {
    console.error(`Error toggling favorite for hymn ${hymnId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Check if a hymn is favorited by the current user
 */
export async function checkHymnFavorite(hymnId: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if hymn is favorited
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('hymn_id', hymnId)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking hymn favorite status:', error);
    return false;
  }
}

/**
 * Fetch a hymn by ID with relations
 */
export async function fetchHymnById(id: string): Promise<HymnWithRelations | null> {
  try {
    const { data, error } = await supabase
      .from('hymns_new')
      .select(`
        *,
        authors:hymn_authors(authors!hymn_authors_author_id_fkey(*)),
        themes:hymn_themes(themes!hymn_themes_theme_id_fkey(*)),
        tags:hymn_tags(tags!hymn_tags_tag_id_fkey(*)),
        pdf_files:hymn_pdf_files(*),
        audio_files:hymn_audio_files(*),
        video_links:hymn_video_links(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;
    
    return processHymnRelations(data);
  } catch (error) {
    console.error(`Error fetching hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Search hymns
 */
export async function searchHymns(query, options = {}) {
  const { 
    limit = 10, 
    page = 1,
    themeId = null,
    authorId = null,
    sortBy = 'title' 
  } = options;
  
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let queryBuilder = supabase
      .from('hymns_new')
      .select(`
        id,
        title,
        lyrics,
        created_at,
        updated_at,
        hymn_authors(author_id, authors(id, name)),
        hymn_themes(theme_id, themes(id, name)),
        hymn_pdf_files(id, pdf_path)
      `, { count: 'exact' });
    
    // Apply text search if provided
    if (query) {
      queryBuilder = queryBuilder.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english'
      });
    }
    
    // Apply filters if provided
    if (themeId) {
      queryBuilder = queryBuilder.eq('hymn_themes.theme_id', themeId);
    }
    
    if (authorId) {
      queryBuilder = queryBuilder.eq('hymn_authors.author_id', authorId);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
        break;
      case 'popular':
        // Use a subquery to count views
        queryBuilder = queryBuilder.order('id', { foreignTable: 'hymn_views', ascending: false });
        break;
      case 'title':
      default:
        queryBuilder = queryBuilder.order('title');
        break;
    }
    
    // Apply pagination
    queryBuilder = queryBuilder.range(from, to);
    
    // Execute query
    const { data, error, count } = await queryBuilder;
    
    if (error) throw error;
    
    // Transform data
    const hymns = data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map(ha => ha.authors) || [],
      themes: hymn.hymn_themes?.map(ht => ht.themes) || [],
      // Process PDF URLs
      pdf_files: hymn.hymn_pdf_files?.map(pdf => ({
        ...pdf,
        file_url: getSupabasePdfUrl(pdf.pdf_path)
      })) || []
    }));
    
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    return { data: hymns, count, totalPages };
  } catch (error) {
    console.error('Error searching hymns:', error);
    throw error;
  }
}

/**
 * Create a new hymn
 */
export async function createHymn(hymnData: Partial<Hymn>) {
  try {
    // Extract related items before inserting
    const { authors, themes, tags, ...hymn } = hymnData;
    
    // Insert the main hymn record
    const { data: newHymn, error } = await supabase
      .from('hymns_new')
      .insert({
        title: hymn.title,
        lyrics: hymn.lyrics,
        status: hymn.status || 'pending',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Insert author relationships
    if (authors && authors.length > 0) {
      const authorRelations = authors.map(authorId => ({
        hymn_id: newHymn.id,
        author_id: authorId
      }));
      
      const { error: authorError } = await supabase
        .from('hymn_authors')
        .insert(authorRelations);
      
      if (authorError) throw authorError;
    }
    
    // Insert theme relationships
    if (themes && themes.length > 0) {
      const themeRelations = themes.map(themeId => ({
        hymn_id: newHymn.id,
        theme_id: themeId
      }));
      
      const { error: themeError } = await supabase
        .from('hymn_themes')
        .insert(themeRelations);
      
      if (themeError) throw themeError;
    }

    // Insert tag relationships
    if (tags && tags.length > 0) {
      const tagRelations = tags.map(tagId => ({
        hymn_id: newHymn.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('hymn_tags')
        .insert(tagRelations);
      
      if (tagError) throw tagError;
    }
    
    return newHymn;
  } catch (error) {
    console.error('Error creating hymn:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update a hymn
 */
export async function updateHymn(hymnId: string, hymnData: Partial<HymnWithRelations>) {
  try {
    // Extract related items before updating
    const { authors, themes, tags, ...hymn } = hymnData;
    
    // Update the main hymn record
    const { error } = await supabase
      .from('hymns_new')
      .update({
        title: hymn.title,
        lyrics: hymn.lyrics,
        status: hymn.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', hymnId);
    
    if (error) throw error;
    
    // Update author relationships
    if (authors) {
      // First, remove existing relationships
      const { error: deleteError } = await supabase
        .from('hymn_authors')
        .delete()
        .eq('hymn_id', hymnId);
      
      if (deleteError) throw deleteError;
      
      // Then, insert new ones
      if (authors.length > 0) {
        const authorRelations = authors.map(author => ({
          hymn_id: hymnId,
          author_id: typeof author === 'object' ? author.id : author
        }));
        
        const { error: insertError } = await supabase
          .from('hymn_authors')
          .insert(authorRelations);
        
        if (insertError) throw insertError;
      }
    }
    
    // Update theme relationships
    if (themes) {
      // First, remove existing relationships
      const { error: deleteError } = await supabase
        .from('hymn_themes')
        .delete()
        .eq('hymn_id', hymnId);
      
      if (deleteError) throw deleteError;
      
      // Then, insert new ones
      if (themes.length > 0) {
        const themeRelations = themes.map(theme => ({
          hymn_id: hymnId,
          theme_id: typeof theme === 'object' ? theme.id : theme
        }));
        
        const { error: insertError } = await supabase
          .from('hymn_themes')
          .insert(themeRelations);
        
        if (insertError) throw insertError;
      }
    }

    // Update tag relationships
    if (tags) {
      // First, remove existing relationships
      const { error: deleteError } = await supabase
        .from('hymn_tags')
        .delete()
        .eq('hymn_id', hymnId);
      
      if (deleteError) throw deleteError;
      
      // Then, insert new ones
      if (tags.length > 0) {
        const tagRelations = tags.map(tag => ({
          hymn_id: hymnId,
          tag_id: typeof tag === 'object' ? tag.id : tag
        }));
        
        const { error: insertError } = await supabase
          .from('hymn_tags')
          .insert(tagRelations);
        
        if (insertError) throw insertError;
      }
    }
    
    return { id: hymnId };
  } catch (error) {
    console.error('Error updating hymn:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch related hymns based on themes and authors
 */
export async function fetchRelatedHymns(
  hymnId: string,
  options: { themeIds?: string[]; authorIds?: string[]; limit?: number } = {}
): Promise<HymnWithRelations[]> {
  try {
    const { themeIds = [], authorIds = [], limit = 5 } = options;
    
    if (themeIds.length === 0 && authorIds.length === 0) {
      return [];
    }

    let query = supabase
      .from('hymns_new')
      .select(`
        *,
        authors:hymn_authors(authors!hymn_authors_author_id_fkey(*)),
        themes:hymn_themes(themes!hymn_themes_theme_id_fkey(*))
      `)
      .neq('id', hymnId) // Exclude current hymn
      .limit(limit);

    // Apply theme filter if themes are provided
    if (themeIds.length > 0) {
      query = query.filter('hymn_themes.themes.id', 'in', `(${themeIds.join(',')})`);
    }
    
    // Apply author filter if authors are provided
    if (authorIds.length > 0) {
      query = query.filter('hymn_authors.authors.id', 'in', `(${authorIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(processHymnRelations);
  } catch (error) {
    console.error(`Error fetching related hymns for ${hymnId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Increment hymn view count with RLS-compatible approach
 */
export async function incrementHymnView(id: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // First approach: Use a dedicated RPC function specially designed for anonymous users
    try {
      // Try without specifying user ID first (if allowed by RLS)
      const { error } = await supabase.rpc('public_increment_hymn_view', { 
        hymn_id: id
      });
      
      if (!error) return; // Success!
    } catch (e) {
      // Silently continue to next approach if this fails
    }

    // Second approach: Update only the hymn view_count without creating a view record
    try {
      const { error } = await supabase
        .from('hymns_new')
        .update({ 
          view_count: supabase.rpc('get_view_count', { hymn_id: id }) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (!error) return; // Success!
    } catch (e) {
      // Silently continue to next approach
    }

    // Third approach: If logged in and the other methods failed, try with the user ID
    if (userId) {
      try {
        await supabase
          .from('hymn_views')
          .insert({ 
            hymn_id: id,
            user_id: userId,
            viewed_at: new Date().toISOString(),
            // Add any other fields that might be required
            source: 'web_app'
          });
      } catch (userViewError) {
        // Just log error - view tracking is not critical
        console.warn('User view tracking failed:', userViewError);
      }
    }
    
    // If we got here, none of the approaches worked, but we don't want to disrupt UX
    // Just log a warning in development
    if (import.meta.env.DEV) {
      console.warn(`Unable to track view for hymn ${id}. RLS policies might be too restrictive.`);
    }
  } catch (error) {
    // Don't throw, just log - this isn't critical functionality
    console.error(`Error incrementing view count for hymn ${id}:`, error);
  }
}

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
    throw handleSupabaseError(error);
  }
}

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
    throw handleSupabaseError(error);
  }
}

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
    throw handleSupabaseError(error);
  }
}

/**
 * Kiểm tra xem một bảng có tồn tại không
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Thực hiện truy vấn đơn giản
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(0);
      
    return !error || !error.message.includes(`relation "${tableName}" does not exist`);
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Helper function to process hymn relations from Supabase response
 */
function processHymnRelations(hymn: any): HymnWithRelations {
  return {
    ...hymn,
    authors: hymn.authors?.map((a: any) => a.authors) || [],
    themes: hymn.themes?.map((t: any) => t.themes) || [],
    tags: hymn.tags?.map((t: any) => t.tags) || []
  };
}

/**
 * Fetch hymns with filters and pagination
 */
export async function fetchHymnsWithExplicitRelations(options: FetchHymnsOptions = {}): Promise<HymnQueryResult> {
  try {
    const {
      page = 1,
      pageSize = 20,
      search = '',
      category = '',
      filters = {},
      sortBy = 'title',
      sortDirection = 'asc',
      includeAuthors = true,
      includeCategories = true,
      includeAudio = false
    } = options;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    // Start building the query
    let query = supabase
      .from('hymns_new')
      .select(`
        *,
        // Explicitly specify the foreign key relationship for authors
        hymn_authors!inner(
          authors!hymn_authors_author_id_fkey(*)
        ),
        ${includeCategories ? 'hymn_categories(categories(*))' : ''}
        ${includeAudio ? ', audio_files(*)' : ''}
      `, 
      { count: 'exact' });

    // Apply search if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%, number.ilike.%${search}%, content.ilike.%${search}%`);
    }

    // Apply additional filters
    if (category) {
      // Filter by category requires special handling with inner joins
      query = query.eq('hymn_categories.categories.slug', category);
    }

    // Apply any custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });

    // Apply pagination
    query = query.range(startIndex, endIndex);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching hymns:', error);
      throw error;
    }

    // Format the results
    const hymns = data ? formatHymns(data) : [];
    
    return {
      hymns,
      totalCount: count || 0,
      currentPage: page,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    };
  } catch (error) {
    console.error('Error fetching hymns:', error);
    throw error;
  }
}

/**
 * Get information about PDF files in hymn_pdf_files
 */
export async function checkHymnPdfFiles(hymnId: string): Promise<Array<{
  id: string;
  pdf_path: string;
  exists: boolean;
  url?: string;
}>> {
  try {
    // Get the correct PDF files table name
    const pdfFilesTable = await getTableName('pdf_files');
    
    // Use safe query to handle potential 404 errors
    const { data: pdfFiles, error } = await createSafeQuery(
      () => supabase
        .from(pdfFilesTable)
        .select('*')
        .eq('hymn_id', hymnId),
      'PDF files',
      { data: [], error: null }
    );
    
    if (error || !pdfFiles) {
      return [];
    }
    
    // ... rest of the function remains the same
  } catch (e) {
    console.error('Error checking hymn PDF files:', e);
    return [];
  }
}

export default {
  fetchHymnById,
  fetchHymns,
  fetchHymnsWithExplicitRelations, // Add the renamed function
  searchHymns,
  fetchPopularHymns,
  toggleHymnFavorite,
  fetchAuthors,
  fetchThemes,
  fetchTags,
  deleteHymn,
  createHymn,
  updateHymn,
  fetchRelatedHymns,
  incrementHymnView
};
