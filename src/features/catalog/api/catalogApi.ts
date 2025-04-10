/**
 * API functions for the Catalog feature: Authors, Themes, Tags
 */
import { supabaseClient } from '../../../lib/supabase/client';
import { Author, Theme, Tag, CategoryWithHymns } from '../types';
import { HymnWithRelations } from '../../hymns/types';
import { handleSupabaseError } from '../../../core/utils/error-handler';
import { apiConfig, mockUtils } from '../../../config/apiConfig';

// Mock imports for development
import { 
  mockFetchAuthors, 
  mockFetchAuthorDetail,
  mockFetchAuthorHymns,
  mockFetchThemes,
  mockFetchThemeDetail,
  mockFetchThemeHymns,
  mockFetchTags,
  mockFetchTagDetail,
  mockFetchTagHymns,
  mockFetchPopularThemes
} from './mockCatalogApi';

// =========== AUTHORS API ===========

interface AuthorsParams {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Fetch authors with pagination and filtering 
 */
export async function fetchAuthors(params: AuthorsParams = {}) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchAuthors(params);
  }
  
  // Real API implementation
  try {
    const { 
      search = '', 
      sortBy = 'name', 
      sortDirection = 'asc', 
      page = 0,
      pageSize = apiConfig.defaultPageSize
    } = params;
    
    const start = page * pageSize;
    const end = start + pageSize - 1;
    
    let query = supabaseClient
      .from('authors')
      .select(`
        *,
        hymn_authors!hymn_authors_author_id_fkey(count)
      `, { count: 'exact' });
      
    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const { data, error, count } = await query.range(start, end);
    
    if (error) throw error;
    
    // Transform and prepare result
    const authors = data?.map(author => ({
      ...author,
      hymn_count: author.hymn_authors?.[0]?.count || 0
    })) || [];
    
    return {
      authors,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single author by ID
 */
export async function fetchAuthorDetail(authorId: string | number) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchAuthorDetail(authorId);
  }

  try {
    const { data, error } = await supabaseClient
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching author ${authorId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch hymns by a specific author
 */
export async function fetchAuthorHymns(
  authorId: string | number,
  {
    page = 0,
    pageSize = apiConfig.defaultPageSize,
    sortBy = 'title',
    sortDirection = 'asc'
  } = {}
) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchAuthorHymns(authorId);
  }

  try {
    const start = page * pageSize;
    const end = start + pageSize - 1;
    
    const { data, error, count } = await supabaseClient
      .from('hymns')
      .select(`
        *,
        hymn_authors(
          authors(id, name)
        ),
        hymn_themes(
          themes(id, name)
        )
      `, { count: 'exact' })
      .eq('hymn_authors.author_id', authorId)
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .range(start, end);
    
    if (error) throw error;
    
    // Định dạng lại kết quả
    const processedHymns = data?.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map(item => item.authors) || [],
      themes: hymn.hymn_themes?.map(item => item.themes) || []
    })) || [];
    
    return {
      hymns: processedHymns,
      total: count || 0
    };
  } catch (error) {
    console.error(`Error fetching hymns for author ${authorId}:`, error);
    throw handleSupabaseError(error);
  }
}

// =========== THEMES API ===========

interface ThemesParams {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Fetch themes with pagination and filtering
 */
export async function fetchThemes(params: ThemesParams = {}) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchThemes(params);
  }
  
  try {
    const { 
      search = '', 
      sortBy = 'name', 
      sortDirection = 'asc', 
      page = 0,
      pageSize = apiConfig.defaultPageSize
    } = params;
    
    const start = page * pageSize;
    const end = start + pageSize - 1;
    
    let query = supabaseClient
      .from('themes')
      .select(`
        *,
        hymn_themes!hymn_themes_theme_id_fkey(count)
      `, { count: 'exact' });
      
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const { data, error, count } = await query.range(start, end);
    
    if (error) throw error;
    
    // Transform and prepare result
    const themes = data?.map(theme => ({
      ...theme,
      hymn_count: theme.hymn_themes?.[0]?.count || 0
    })) || [];
    
    return {
      themes,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single theme by ID
 */
export async function fetchThemeDetail(themeId: string | number) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchThemeDetail(themeId);
  }

  try {
    const { data, error } = await supabaseClient
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching theme ${themeId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch hymns by a specific theme
 */
export async function fetchThemeHymns(
  themeId: string | number,
  {
    page = 0,
    pageSize = apiConfig.defaultPageSize,
    sortBy = 'title',
    sortDirection = 'asc'
  } = {}
) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchThemeHymns(themeId, { page, pageSize, sortBy, sortDirection });
  }

  try {
    const start = page * pageSize;
    const end = start + pageSize - 1;
    
    const { data, error, count } = await supabaseClient
      .from('hymns')
      .select(`
        *,
        hymn_authors(
          authors(id, name)
        ),
        hymn_themes(
          themes(id, name)
        )
      `, { count: 'exact' })
      .eq('hymn_themes.theme_id', themeId)
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .range(start, end);
    
    if (error) throw error;
    
    // Định dạng lại kết quả
    const processedHymns = data?.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map(item => item.authors) || [],
      themes: hymn.hymn_themes?.map(item => item.themes) || []
    })) || [];
    
    return {
      hymns: processedHymns,
      total: count || 0
    };
  } catch (error) {
    console.error(`Error fetching hymns for theme ${themeId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch popular themes for display on homepage
 */
export async function fetchPopularThemes(limit: number = 6) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchPopularThemes(limit);
  }

  try {
    const { data, error } = await supabaseClient
      .from('themes')
      .select(`
        *,
        hymn_themes!hymn_themes_theme_id_fkey(count)
      `)
      .limit(limit);
    
    if (error) throw error;
    
    // Transform and prepare result
    const themes = data?.map(theme => ({
      ...theme,
      hymn_count: theme.hymn_themes?.[0]?.count || 0
    })) || [];
    
    // Sort by hymn_count
    return themes.sort((a, b) => b.hymn_count - a.hymn_count);
  } catch (error) {
    console.error('Error fetching popular themes:', error);
    throw handleSupabaseError(error);
  }
}

// =========== TAGS API ===========

/**
 * Fetch all tags with optional search filter
 */
export async function fetchTags(search: string = '') {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchTags(search);
  }

  try {
    let query = supabaseClient
      .from('tags')
      .select('*, hymn_count:hymn_tags!tag_id(count)');
      
    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    // Order by name
    query = query.order('name');
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform and prepare result
    return data?.map(tag => ({
      ...tag,
      hymn_count: tag.hymn_count?.[0]?.count || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single tag by ID
 */
export async function fetchTagDetail(tagId: string | number) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchTagDetail(tagId);
  }

  try {
    const { data, error } = await supabaseClient
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching tag ${tagId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch hymns by a specific tag
 */
export async function fetchTagHymns(
  tagId: string | number,
  {
    page = 0,
    pageSize = apiConfig.defaultPageSize,
    sortBy = 'title',
    sortDirection = 'asc'
  } = {}
) {
  // Use mock API in development if configured
  if (apiConfig.useMockApi) {
    await mockUtils.delay();
    if (mockUtils.shouldError()) {
      throw mockUtils.createRandomError();
    }
    return mockFetchTagHymns(tagId, { page, pageSize, sortBy, sortDirection });
  }

  try {
    const start = page * pageSize;
    const end = start + pageSize - 1;
    
    const { data, error, count } = await supabaseClient
      .from('hymns')
      .select(`
        *,
        authors:hymn_authors!hymn_authors_hymn_id_fkey(
          author:authors!hymn_authors_author_id_fkey(id, name)
        ),
        themes:hymn_themes!hymn_themes_hymn_id_fkey(
          theme:themes!hymn_themes_theme_id_fkey(id, name)
        )
      `, { count: 'exact' })
      .eq('hymn_tags!hymn_id.tag_id', tagId)
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .range(start, end);
    
    if (error) throw error;
    
    return {
      hymns: data as HymnWithRelations[] || [],
      total: count || 0
    };
  } catch (error) {
    console.error(`Error fetching hymns for tag ${tagId}:`, error);
    throw handleSupabaseError(error);
  }
}

// =========== CATEGORIES API ===========

/**
 * Fetch a category with its hymns
 */
export async function fetchCategoryWithHymns(categoryId: string | number): Promise<CategoryWithHymns> {
  try {
    // First fetch the category
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (categoryError) throw categoryError;
    
    // Then fetch hymns in this category
    const { data: hymnsData, error: hymnsError } = await supabaseClient
      .from('hymn_categories')
      .select(`
        hymn:hymn_id!hymn_id(
          id,
          title
        )
      `)
      .eq('category_id', categoryId);
    
    if (hymnsError) throw hymnsError;
    
    // Count hymns
    const hymnCount = hymnsData?.length || 0;
    
    // Transform hymn data
    const hymns = hymnsData?.map(item => ({
      id: item.hymn.id,
      title: item.hymn.title
    })) || [];
    
    return {
      ...category,
      hymns,
      hymn_count: hymnCount
    };
  } catch (error) {
    console.error(`Error fetching category ${categoryId} with hymns:`, error);
    throw handleSupabaseError(error);
  }
}
