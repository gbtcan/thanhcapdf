/**
 * Utility functions for search functionality
 */

import { supabase } from '../lib/supabase';
import type { HymnWithRelations, Author, Category, ForumPost } from '../types';

/**
 * Search hymns by title
 * @param query Search query
 * @returns Promise with hymns array
 */
export async function searchByTitle(query: string): Promise<HymnWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(authors(*)),
        hymn_categories(categories(*))
      `)
      .ilike('title', `%${query}%`)
      .order('title');
    
    if (error) throw error;
    
    return data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
    }));
  } catch (error) {
    console.error('Error searching by title:', error);
    throw error;
  }
}

/**
 * Search hymns by lyrics content
 * @param query Search query
 * @returns Promise with hymns array
 */
export async function searchByLyrics(query: string): Promise<HymnWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(authors(*)),
        hymn_categories(categories(*))
      `)
      .ilike('lyrics', `%${query}%`)
      .order('title');
    
    if (error) throw error;
    
    return data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
    }));
  } catch (error) {
    console.error('Error searching by lyrics:', error);
    throw error;
  }
}

/**
 * Search hymns by author name
 * @param query Search query
 * @returns Promise with hymns array
 */
export async function searchByAuthor(query: string): Promise<HymnWithRelations[]> {
  try {
    // First find authors matching the query
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .select('id')
      .ilike('name', `%${query}%`);
    
    if (authorsError) throw authorsError;
    
    if (!authors.length) return [];
    
    // Then find hymns with these authors
    const authorIds = authors.map(author => author.id);
    
    // Get hymn IDs from junction table
    const { data: hymnAuthorJunction, error: junctionError } = await supabase
      .from('hymn_authors')
      .select('hymn_id')
      .in('author_id', authorIds);
      
    if (junctionError) throw junctionError;
    
    const hymnIds = hymnAuthorJunction.map(item => item.hymn_id);
    
    if (!hymnIds.length) return [];
    
    // Get the hymns with all their relations
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(authors(*)),
        hymn_categories(categories(*))
      `)
      .in('id', hymnIds)
      .order('title');
    
    if (error) throw error;
    
    return data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
    }));
  } catch (error) {
    console.error('Error searching by author:', error);
    throw error;
  }
}

/**
 * Filter hymns by category
 * @param categoryId Category ID
 * @returns Promise with hymns array
 */
export async function filterByCategory(categoryId: number): Promise<HymnWithRelations[]> {
  try {
    // Get hymn IDs from junction table
    const { data: hymnCategoryJunction, error: junctionError } = await supabase
      .from('hymn_categories')
      .select('hymn_id')
      .eq('category_id', categoryId);
      
    if (junctionError) throw junctionError;
    
    const hymnIds = hymnCategoryJunction.map(item => item.hymn_id);
    
    if (!hymnIds.length) return [];
    
    // Get the hymns with all their relations
    const { data, error } = await supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(authors(*)),
        hymn_categories(categories(*))
      `)
      .in('id', hymnIds)
      .order('title');
    
    if (error) throw error;
    
    return data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
    }));
  } catch (error) {
    console.error('Error filtering by category:', error);
    throw error;
  }
}

/**
 * Combined search function for hymns
 * @param query Search query
 * @returns Promise with hymns array without duplicates
 */
export async function searchHymns(
  query: string, 
  options: {
    searchField?: 'title' | 'lyrics' | 'all';
    authorId?: string | number;
    categoryId?: string | number;
    limit?: number;
    page?: number;
  } = {}
): Promise<{ hymns: HymnWithRelations[], totalCount: number }> {
  const {
    searchField = 'all',
    authorId,
    categoryId,
    limit = 10,
    page = 1
  } = options;
  
  try {
    // Calculate pagination parameters
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Base query
    let queryBuilder = supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(authors(*)),
        hymn_categories(categories(*)),
        pdf_files(*)
      `, { count: 'exact' });
    
    // Apply search criteria
    if (query && query.trim()) {
      if (searchField === 'title' || searchField === 'all') {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      } else if (searchField === 'lyrics') {
        queryBuilder = queryBuilder.ilike('lyrics', `%${query}%`);
      }
    }
    
    // Filter by author if provided
    if (authorId) {
      queryBuilder = queryBuilder.eq('hymn_authors.author_id', authorId);
    }
    
    // Filter by category if provided
    if (categoryId) {
      queryBuilder = queryBuilder.eq('hymn_categories.category_id', categoryId);
    }
    
    // Apply pagination
    queryBuilder = queryBuilder.range(from, to);
    
    // Execute query
    const { data, error, count } = await queryBuilder;
    
    if (error) throw error;
    
    // Transform data to expected format
    const hymns = data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
      categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || [],
      pdf_files: hymn.pdf_files || []
    }));
    
    return {
      hymns,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Search error:', error);
    return { hymns: [], totalCount: 0 };
  }
}

/**
 * Search for forum posts
 * @param query Search query string
 * @param options Search options
 * @returns Array of matching posts
 */
export async function searchForumPosts(
  query: string,
  options: {
    hymnId?: string;
    userId?: string;
    limit?: number;
    page?: number;
  } = {}
): Promise<{ posts: ForumPost[], totalCount: number }> {
  const {
    hymnId,
    userId,
    limit = 10,
    page = 1
  } = options;
  
  try {
    // Calculate pagination parameters
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Base query
    let queryBuilder = supabase
      .from('forum_posts')
      .select(`
        *,
        users (
          display_name,
          email
        ),
        hymns (
          id,
          title
        )
      `, { count: 'exact' });
    
    // Apply search criteria
    if (query && query.trim()) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }
    
    // Filter by hymn if provided
    if (hymnId) {
      queryBuilder = queryBuilder.eq('hymn_id', hymnId);
    }
    
    // Filter by user if provided
    if (userId) {
      queryBuilder = queryBuilder.eq('user_id', userId);
    }
    
    // Apply pagination
    queryBuilder = queryBuilder.range(from, to).order('created_at', { ascending: false });
    
    // Execute query
    const { data, error, count } = await queryBuilder;
    
    if (error) throw error;
    
    return {
      posts: data as ForumPost[],
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Forum search error:', error);
    return { posts: [], totalCount: 0 };
  }
}

/**
 * Format search results for display
 * @param hymns Array of hymns to format
 * @param searchQuery Original search query for highlighting
 * @returns Formatted hymns array
 */
export function formatSearchResults(hymns: HymnWithRelations[], searchQuery: string): HymnWithRelations[] {
  if (!searchQuery) return hymns;
  
  const query = searchQuery.toLowerCase();
  
  return hymns.map(hymn => {
    // Create a copy to avoid modifying the original
    const formattedHymn = { ...hymn };
    
    // Highlight match in lyrics excerpt for display
    if (hymn.lyrics && hymn.lyrics.toLowerCase().includes(query)) {
      const index = hymn.lyrics.toLowerCase().indexOf(query);
      const start = Math.max(0, index - 40);
      const end = Math.min(hymn.lyrics.length, index + searchQuery.length + 40);
      
      let excerpt = hymn.lyrics.substring(start, end);
      
      // Add ellipsis if we're not showing the beginning or end
      if (start > 0) excerpt = '...' + excerpt;
      if (end < hymn.lyrics.length) excerpt = excerpt + '...';
      
      formattedHymn.lyrics = excerpt;
    }
    
    return formattedHymn;
  });
}

/**
 * Utilities for search functionality
 */

/**
 * Highlight search terms in a given text
 * @param text - The text to search within
 * @param searchTerm - The term to highlight
 * @returns Text with highlighted search terms
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters in a string
 * @param string - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Split search query into individual terms for better matching
 * @param query - Raw search query string
 * @returns Array of search terms
 */
export function parseSearchQuery(query: string): string[] {
  if (!query) return [];
  
  // Remove excess whitespace and split by spaces, ignoring quoted phrases
  const terms: string[] = [];
  let inQuotes = false;
  let currentTerm = '';
  
  // Process each character
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
      
      // If we just exited quotes, add the term
      if (!inQuotes && currentTerm) {
        terms.push(currentTerm.trim());
        currentTerm = '';
      }
    } else if (char === ' ' && !inQuotes) {
      // Space outside quotes means end of term
      if (currentTerm) {
        terms.push(currentTerm.trim());
        currentTerm = '';
      }
    } else {
      // Add character to current term
      currentTerm += char;
    }
  }
  
  // Add the last term if there is one
  if (currentTerm) {
    terms.push(currentTerm.trim());
  }
  
  // Filter out empty terms and return
  return terms.filter(term => term.length > 0);
}

/**
 * Generate search vector text for database full-text search
 * @param texts - Array of text fields to include in search vector
 * @returns Concatenated text optimized for search
 */
export function generateSearchVector(...texts: (string | null | undefined)[]): string {
  return texts
    .filter(text => !!text)
    .map(text => text!.trim())
    .join(' ');
}

/**
 * Create SQL LIKE pattern for partial matching
 * @param term - Search term
 * @returns SQL LIKE pattern string
 */
export function createLikePattern(term: string): string {
  return `%${term}%`;
}

/**
 * Weight different fields for full-text search
 * @param fields - Object containing field names and their weights
 * @returns Formatted weight string for PostgreSQL
 */
export function weightFields(fields: Record<string, 'A' | 'B' | 'C' | 'D'>): string {
  return Object.entries(fields)
    .map(([field, weight]) => `setweight(to_tsvector('english', coalesce(${field},'')), '${weight}')`)
    .join(' || ');
}

import { supabase } from '../lib/supabase';
import { HymnWithRelations, ForumPost } from '../types';

/**
 * Search for hymns with various filter options
 */
export async function searchHymns({
  query = '',
  categoryId,
  authorId,
  sortBy = 'title',
  page = 1,
  limit = 10
}: {
  query?: string;
  categoryId?: number | string;
  authorId?: number | string;
  sortBy?: 'title' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}) {
  try {
    // Calculate pagination ranges
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Start building the query
    let dbQuery = supabase
      .from('hymns')
      .select(`
        id,
        title,
        lyrics,
        view_count,
        created_at,
        updated_at,
        hymn_authors!inner(authors(*)),
        hymn_categories!inner(categories(*)),
        pdf_files(id, file_url)
      `, { count: 'exact' });
      
    // Add text search if query provided
    if (query) {
      dbQuery = dbQuery.textSearch('search_vector', query, {
        config: 'english',
        type: 'websearch'
      });
    }
    
    // Add category filter if provided
    if (categoryId) {
      dbQuery = dbQuery.eq('hymn_categories.category_id', categoryId);
    }
    
    // Add author filter if provided
    if (authorId) {
      dbQuery = dbQuery.eq('hymn_authors.author_id', authorId);
    }
    
    // Add sorting
    switch (sortBy) {
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false });
        break;
      case 'popular':
        dbQuery = dbQuery.order('view_count', { ascending: false });
        break;
      case 'title':
      default:
        dbQuery = dbQuery.order('title');
        break;
    }
    
    // Apply pagination
    dbQuery = dbQuery.range(from, to);
    
    // Execute the query
    const { data, error, count } = await dbQuery;
    
    if (error) throw error;
    
    // Transform data to proper format with nested relations
    const hymns = data.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors.map((ha: any) => ha.authors),
      categories: hymn.hymn_categories.map((hc: any) => hc.categories),
      pdfUrl: hymn.pdf_files && hymn.pdf_files.length > 0 ? hymn.pdf_files[0].file_url : null
    })) as HymnWithRelations[];
    
    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    return { 
      hymns, 
      count, 
      totalPages, 
      currentPage: page 
    };
  } catch (error) {
    console.error('Error searching hymns:', error);
    throw error;
  }
}

/**
 * Search forum posts with various filter options
 */
export async function searchForumPosts({
  query = '',
  hymnId,
  tagId,
  sortBy = 'latest',
  page = 1,
  limit = 10
}: {
  query?: string;
  hymnId?: string;
  tagId?: string;
  sortBy?: 'latest' | 'popular' | 'comments';
  page?: number;
  limit?: number;
}) {
  try {
    // Calculate pagination ranges
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Start building the query
    let dbQuery = supabase
      .from('forum_posts')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        user_id,
        hymn_id,
        comment_count,
        like_count,
        users:user_id (display_name, email, avatar_url),
        hymns:hymn_id (id, title),
        post_tags!inner(tags(*))
      `, { count: 'exact' });
      
    // Add text search if query provided
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }
    
    // Add hymn filter if provided
    if (hymnId) {
      dbQuery = dbQuery.eq('hymn_id', hymnId);
    }
    
    // Add tag filter if provided
    if (tagId) {
      dbQuery = dbQuery.eq('post_tags.tag_id', tagId);
    }
    
    // Add sorting
    switch (sortBy) {
      case 'popular':
        dbQuery = dbQuery.order('like_count', { ascending: false });
        break;
      case 'comments':
        dbQuery = dbQuery.order('comment_count', { ascending: false });
        break;
      case 'latest':
      default:
        dbQuery = dbQuery.order('created_at', { ascending: false });
        break;
    }
    
    // Apply pagination
    dbQuery = dbQuery.range(from, to);
    
    // Execute the query
    const { data, error, count } = await dbQuery;
    
    if (error) throw error;
    
    // Transform data to proper format
    const posts = data.map(post => ({
      ...post,
      tags: post.post_tags.map((pt: any) => pt.tags)
    })) as ForumPost[];
    
    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;
    
    return { 
      posts, 
      count, 
      totalPages, 
      currentPage: page 
    };
  } catch (error) {
    console.error('Error searching forum posts:', error);
    throw error;
  }
}

/**
 * Process a search query for better matches
 */
export function processSearchQuery(query: string): string {
  if (!query) return '';
  
  // Convert to lowercase
  let processed = query.toLowerCase();
  
  // Remove extra spaces
  processed = processed.replace(/\s+/g, ' ').trim();
  
  // Add wildcards for partial matching if query is at least 3 characters
  if (processed.length >= 3) {
    processed = processed
      .split(' ')
      .map(word => word.length >= 3 ? `${word}:*` : word)
      .join(' & ');
  }
  
  return processed;
}

/**
 * Generate search suggestions based on a query
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 3) return [];
  
  try {
    // Search hymn titles
    const { data: hymnSuggestions, error: hymnError } = await supabase
      .from('hymns')
      .select('title')
      .ilike('title', `%${query}%`)
      .limit(5);
    
    if (hymnError) throw hymnError;
    
    // Search author names
    const { data: authorSuggestions, error: authorError } = await supabase
      .from('authors')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(3);
    
    if (authorError) throw authorError;
    
    // Combine suggestions
    const suggestions = [
      ...hymnSuggestions.map(h => h.title),
      ...authorSuggestions.map(a => a.name)
    ];
    
    // Remove duplicates and limit results
    return [...new Set(suggestions)].slice(0, 6);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}
