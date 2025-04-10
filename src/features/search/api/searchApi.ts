import { supabase } from '../../../lib/supabase';
import { SearchParams, SearchResult, SearchResultItem } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../../../core/utils/storage';
import { supabaseClient } from '../../../lib/supabase/client';
import { getDB, saveSearch, getAllHymns } from '../../offline/utils/offlineStorage';
import { useNetworkStatus } from '../../../contexts/NetworkStatusContext';

/**
 * Perform a global search across multiple resources
 */
export async function searchAll(
  params: SearchParams
): Promise<SearchResult<SearchResultItem>> {
  const { query, type = 'all', page = 0, limit = 10 } = params;
  
  // Save search query to history
  saveSearchHistory(query, type);
  
  try {
    let searchResults: SearchResultItem[] = [];
    let total = 0;
    
    // Search hymns
    if (type === 'all' || type === 'hymns' || type === 'lyrics') {
      const { data: hymns, count: hymnsCount } = await searchHymns(query, page, limit);
      
      if (hymns) {
        searchResults = [
          ...searchResults,
          ...hymns.map(hymn => ({
            id: hymn.id,
            type: 'hymn',
            title: hymn.title,
            description: hymn.lyrics?.substring(0, 100) + '...',
            url: `/hymns/${hymn.id}`,
            additionalData: {
              authors: hymn.authors
            }
          }))
        ];
        
        total += hymnsCount || 0;
      }
    }
    
    // Search authors (if not searching only in hymns/lyrics)
    if ((type === 'all' || type === 'authors') && type !== 'lyrics') {
      const { data: authors, count: authorsCount } = await searchAuthors(query, page, limit);
      
      if (authors) {
        searchResults = [
          ...searchResults,
          ...authors.map(author => ({
            id: author.id,
            type: 'author',
            title: author.name,
            description: author.biography?.substring(0, 100) + '...',
            url: `/authors/${author.id}`,
            thumbnail: author.image_url
          }))
        ];
        
        total += authorsCount || 0;
      }
    }
    
    // Search themes (if not searching only in hymns/lyrics/authors)
    if ((type === 'all' || type === 'themes') && type !== 'lyrics' && type !== 'authors') {
      const { data: themes, count: themesCount } = await searchThemes(query, page, limit);
      
      if (themes) {
        searchResults = [
          ...searchResults,
          ...themes.map(theme => ({
            id: theme.id,
            type: 'theme',
            title: theme.name,
            description: theme.description,
            url: `/themes/${theme.id}`
          }))
        ];
        
        total += themesCount || 0;
      }
    }
    
    // Search forum posts if type is all or posts
    if (type === 'all' || type === 'posts') {
      const { data: posts, count: postsCount } = await searchPosts(query, page, limit);
      
      if (posts) {
        searchResults = [
          ...searchResults,
          ...posts.map(post => ({
            id: post.id,
            type: 'post',
            title: post.title,
            description: post.content.substring(0, 100) + '...',
            url: `/community/posts/${post.id}`,
            additionalData: {
              user: post.user
            }
          }))
        ];
        
        total += postsCount || 0;
      }
    }
    
    return {
      items: searchResults,
      total,
      page,
      limit,
      hasMore: (page + 1) * limit < total
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

/**
 * Search hymns by title and lyrics
 */
async function searchHymns(query: string, page = 0, limit = 10) {
  const offset = page * limit;
  
  let dbQuery = supabase.from('hymns_new')
    .select(`
      id, 
      title, 
      lyrics,
      authors:hymn_authors(
        author:author_id(
          id, 
          name
        )
      )
    `, { count: 'exact' });
  
  // Apply full-text search if available, otherwise use ILIKE
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,lyrics.ilike.%${query}%`);
  }
  
  // Apply pagination
  const { data, count, error } = await dbQuery
    .order('title')
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  
  return { data, count };
}

/**
 * Search authors by name and biography
 */
async function searchAuthors(query: string, page = 0, limit = 10) {
  const offset = page * limit;
  
  const { data, count, error } = await supabase.from('authors')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${query}%,biography.ilike.%${query}%`)
    .order('name')
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  
  return { data, count };
}

/**
 * Search themes by name and description
 */
async function searchThemes(query: string, page = 0, limit = 10) {
  const offset = page * limit;
  
  const { data, count, error } = await supabase.from('themes')
    .select('*', { count: 'exact' })
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name')
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  
  return { data, count };
}

/**
 * Search forum posts by title and content
 */
async function searchPosts(query: string, page = 0, limit = 10) {
  const offset = page * limit;
  
  const { data, count, error } = await supabase.from('forum_posts')
    .select(`
      id, 
      title, 
      content,
      user:user_id(
        id, 
        display_name
      )
    `, { count: 'exact' })
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (error) throw error;
  
  return { data, count };
}

/**
 * Save search query to history
 */
function saveSearchHistory(query: string, type: string = 'all'): void {
  if (!query.trim()) return;
  
  try {
    // Get existing history
    const history = getStorageItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
    
    // Add new item
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      type
    };
    
    // Check if query already exists
    const existingIndex = history.findIndex(item => 
      item.query.toLowerCase() === query.toLowerCase() && item.type === type
    );
    
    if (existingIndex >= 0) {
      // Update existing item's timestamp
      history[existingIndex].timestamp = newItem.timestamp;
    } else {
      // Add new item
      history.unshift(newItem);
    }
    
    // Keep only the last 10 items
    const trimmedHistory = history.slice(0, 10);
    
    // Save to storage
    setStorageItem(STORAGE_KEYS.SEARCH_HISTORY, trimmedHistory);
  } catch (error) {
    console.error('Error saving search history:', error);
  }
}

/**
 * Get search history
 */
export function getSearchHistory(): SearchHistoryItem[] {
  return getStorageItem<SearchHistoryItem[]>(STORAGE_KEYS.SEARCH_HISTORY, []);
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  setStorageItem(STORAGE_KEYS.SEARCH_HISTORY, []);
}

/**
 * API functions for the Search feature
 */
import { supabaseClient } from '../../../lib/supabase/client';
import { SearchResult } from '../types';
import { handleSupabaseError } from '../../../core/utils/error-handler';
import { SearchType } from '../../../contexts/SearchContext';

/**
 * Search hymns only
 */
export async function searchHymnsAdvanced(
  query: string,
  options: { limit?: number; fuzzy?: boolean } = {}
): Promise<{ results: SearchResult[] }> {
  try {
    const { limit = 20, fuzzy = true } = options;
    
    // Use text search with websearch operator for better results
    const { data, error } = await supabaseClient
      .from('hymns')
      .select(`
        id,
        title,
        subtitle,
        lyrics,
        authors:hymn_authors(author:author_id(id, name)),
        themes:hymn_themes(theme:theme_id(id, name))
      `)
      .textSearch(
        fuzzy ? 'title,lyrics' : 'title', 
        query, 
        { 
          type: fuzzy ? 'websearch' : 'plain',
          config: 'english' 
        }
      )
      .limit(limit);
    
    if (error) throw error;
    
    // Transform results to common format
    const results: SearchResult[] = data?.map(hymn => ({
      id: hymn.id.toString(),
      type: 'hymn',
      title: hymn.title,
      subtitle: hymn.subtitle || undefined,
      description: hymn.lyrics ? hymn.lyrics.substring(0, 100) + '...' : undefined,
      authors: hymn.authors?.map(author => author.author?.name).filter(Boolean) || [],
      tags: hymn.themes?.map(theme => theme.theme?.name).filter(Boolean) || []
    })) || [];
    
    return { results };
  } catch (error) {
    console.error('Error searching hymns:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Search across all content types (hymns, authors, themes, tags)
 */
export async function searchGlobal(
  query: string,
  type: SearchType = 'all',
  options: { limit?: number } = {}
): Promise<{ results: SearchResult[] }> {
  try {
    const { limit = 20 } = options;
    let results: SearchResult[] = [];
    
    // Search hymns
    if (type === 'all' || type === 'hymns') {
      const hymnResults = await searchHymnsAdvanced(query, { limit: type === 'all' ? 10 : limit });
      results = [...results, ...hymnResults.results];
    }
    
    // Search authors if needed
    if (type === 'all' || type === 'authors') {
      const { data: authors, error: authorsError } = await supabaseClient
        .from('authors')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(type === 'all' ? 5 : limit);
      
      if (authorsError) throw authorsError;
      
      const authorResults: SearchResult[] = authors?.map(author => ({
        id: author.id.toString(),
        type: 'author',
        title: author.name,
        description: author.biography?.substring(0, 100) + '...' || undefined,
        yearRange: author.birth_year 
          ? `${author.birth_year}${author.death_year ? ' - ' + author.death_year : ''}`
          : undefined
      })) || [];
      
      results = [...results, ...authorResults];
    }
    
    // Search themes if needed
    if (type === 'all' || type === 'themes') {
      const { data: themes, error: themesError } = await supabaseClient
        .from('themes')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(type === 'all' ? 5 : limit);
      
      if (themesError) throw themesError;
      
      const themeResults: SearchResult[] = themes?.map(theme => ({
        id: theme.id.toString(),
        type: 'theme',
        title: theme.name,
        description: theme.description?.substring(0, 100) + '...' || undefined,
        color: theme.color || undefined
      })) || [];
      
      results = [...results, ...themeResults];
    }
    
    // Search tags if needed
    if (type === 'all' || type === 'tags') {
      const { data: tags, error: tagsError } = await supabaseClient
        .from('tags')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(type === 'all' ? 5 : limit);
      
      if (tagsError) throw tagsError;
      
      const tagResults: SearchResult[] = tags?.map(tag => ({
        id: tag.id.toString(),
        type: 'tag',
        title: tag.name,
        description: tag.description || undefined
      })) || [];
      
      results = [...results, ...tagResults];
    }
    
    return { results };
  } catch (error) {
    console.error('Error performing global search:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Get trending or popular searches
 */
export async function getTrendingSearches(): Promise<string[]> {
  // Since we don't have real trending data yet, 
  // we'll just return some hardcoded examples
  return [
    'alleluia',
    'maria',
    'thánh thể',
    'mùa chay',
    'vọng',
    'kim long',
    'mẹ thiên chúa',
    'chúa thánh thần'
  ];
}

/**
 * Performs a search against the database
 */
export async function searchAPI(params: SearchParams): Promise<SearchResponse> {
  const {
    query,
    filters = {},
    page = 0,
    limit = 20,
    sortBy = 'score',
    sortOrder = 'desc'
  } = params;
  
  // Get network status
  const isOnline = navigator.onLine;
  
  try {
    // If offline, use IndexedDB search
    if (!isOnline) {
      return await searchOffline(params);
    }
    
    // Otherwise use Supabase search
    const results: SearchResult[] = [];
    let totalResults = 0;
    
    // Determine which types to search based on filters
    const searchTypes = filters.types || ['hymn', 'author', 'theme', 'post'];
    
    // Search hymns if included
    if (searchTypes.includes('hymn')) {
      let hymnQuery = supabaseClient
        .from('hymns_new')
        .select('id, title, lyrics, view_count', { count: 'exact' })
        .or(`title.ilike.%${query}%, lyrics.ilike.%${query}%`);
      
      // Apply additional filters
      if (filters.authors?.length) {
        hymnQuery = hymnQuery.in('author_id', filters.authors);
      }
      if (filters.themes?.length) {
        // Assuming a hymn_themes junction table
        hymnQuery = hymnQuery.in('id', (qb) => {
          return qb.from('hymn_themes')
            .select('hymn_id')
            .in('theme_id', filters.themes);
        });
      }
      
      // Execute query
      const { data: hymns, count, error } = await hymnQuery;
      
      if (!error && hymns) {
        hymns.forEach((hymn) => {
          // Check if match is in title or content to determine excerpt
          const matchInTitle = hymn.title.toLowerCase().includes(query.toLowerCase());
          const matchInContent = hymn.lyrics && hymn.lyrics.toLowerCase().includes(query.toLowerCase());
          
          let excerpt = '';
          if (matchInContent && hymn.lyrics) {
            // Create excerpt from the matching content
            const lowerLyrics = hymn.lyrics.toLowerCase();
            const matchIndex = lowerLyrics.indexOf(query.toLowerCase());
            const startIndex = Math.max(0, matchIndex - 50);
            const endIndex = Math.min(hymn.lyrics.length, matchIndex + query.length + 50);
            excerpt = (startIndex > 0 ? '...' : '') + 
                      hymn.lyrics.substring(startIndex, endIndex) + 
                      (endIndex < hymn.lyrics.length ? '...' : '');
          }
          
          results.push({
            id: hymn.id,
            title: hymn.title,
            type: 'hymn',
            excerpt,
            matchType: matchInTitle ? 'title' : 'content',
            score: matchInTitle ? 2 : 1, // Higher score for title matches
            data: {
              viewCount: hymn.view_count
            }
          });
        });
        
        totalResults += count || 0;
      }
    }
    
    // Search authors if included
    if (searchTypes.includes('author')) {
      const { data: authors, count, error } = await supabaseClient
        .from('authors')
        .select('id, name, bio', { count: 'exact' })
        .ilike('name', `%${query}%`)
        .range(page * limit, (page + 1) * limit - 1);
      
      if (!error && authors) {
        authors.forEach((author) => {
          results.push({
            id: author.id,
            title: author.name,
            type: 'author',
            excerpt: author.bio ? (author.bio.substring(0, 100) + (author.bio.length > 100 ? '...' : '')) : undefined,
            matchType: 'title',
            score: 1,
          });
        });
        
        totalResults += count || 0;
      }
    }
    
    // Search themes if included
    if (searchTypes.includes('theme')) {
      const { data: themes, count, error } = await supabaseClient
        .from('themes')
        .select('id, name, description', { count: 'exact' })
        .ilike('name', `%${query}%`)
        .range(page * limit, (page + 1) * limit - 1);
      
      if (!error && themes) {
        themes.forEach((theme) => {
          results.push({
            id: theme.id,
            title: theme.name,
            type: 'theme',
            excerpt: theme.description,
            matchType: 'title',
            score: 1,
          });
        });
        
        totalResults += count || 0;
      }
    }
    
    // Search forum posts if included
    if (searchTypes.includes('post')) {
      const { data: posts, count, error } = await supabaseClient
        .from('forum_posts')
        .select('id, title, content', { count: 'exact' })
        .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
        .eq('status', 'published')
        .range(page * limit, (page + 1) * limit - 1);
      
      if (!error && posts) {
        posts.forEach((post) => {
          const matchInTitle = post.title.toLowerCase().includes(query.toLowerCase());
          
          let excerpt = '';
          if (post.content) {
            // Strip HTML tags
            const content = post.content.replace(/<[^>]*>?/gm, '');
            const lowerContent = content.toLowerCase();
            const matchIndex = lowerContent.indexOf(query.toLowerCase());
            
            if (matchIndex >= 0) {
              const startIndex = Math.max(0, matchIndex - 50);
              const endIndex = Math.min(content.length, matchIndex + query.length + 50);
              excerpt = (startIndex > 0 ? '...' : '') + 
                        content.substring(startIndex, endIndex) + 
                        (endIndex < content.length ? '...' : '');
            } else {
              excerpt = content.substring(0, 100) + (content.length > 100 ? '...' : '');
            }
          }
          
          results.push({
            id: post.id,
            title: post.title,
            type: 'post',
            excerpt,
            matchType: matchInTitle ? 'title' : 'content',
            score: matchInTitle ? 2 : 1,
          });
        });
        
        totalResults += count || 0;
      }
    }
    
    // Sort results
    if (sortBy === 'score') {
      results.sort((a, b) => {
        return sortOrder === 'desc' ? 
          (b.score || 0) - (a.score || 0) : 
          (a.score || 0) - (b.score || 0);
      });
    }
    
    // Save search for analytics
    saveSearch(query, results.length).catch(console.error);
    
    return {
      results,
      totalResults,
      page,
      totalPages: Math.ceil(totalResults / limit),
      query
    };
  } catch (error) {
    console.error('Error in search API:', error);
    throw error;
  }
}

/**
 * Performs a search against the offline database
 */
async function searchOffline(params: SearchParams): Promise<SearchResponse> {
  const {
    query,
    filters = {},
    page = 0,
    limit = 20,
    sortBy = 'score',
    sortOrder = 'desc'
  } = params;
  
  try {
    const results: SearchResult[] = [];
    
    // Get all hymns from IndexedDB
    const hymns = await getAllHymns();
    
    if (hymns.length === 0) {
      return {
        results: [],
        totalResults: 0,
        page,
        totalPages: 0,
        query
      };
    }
    
    // Filter hymns by query
    const filteredHymns = hymns.filter(hymn => {
      const matchInTitle = hymn.title.toLowerCase().includes(query.toLowerCase());
      const matchInLyrics = hymn.lyrics && hymn.lyrics.toLowerCase().includes(query.toLowerCase());
      return matchInTitle || matchInLyrics;
    });
    
    // Process results
    filteredHymns.forEach(hymn => {
      const matchInTitle = hymn.title.toLowerCase().includes(query.toLowerCase());
      const matchInLyrics = hymn.lyrics && hymn.lyrics.toLowerCase().includes(query.toLowerCase());
      
      let excerpt = '';
      if (matchInLyrics && hymn.lyrics) {
        const lowerLyrics = hymn.lyrics.toLowerCase();
        const matchIndex = lowerLyrics.indexOf(query.toLowerCase());
        const startIndex = Math.max(0, matchIndex - 50);
        const endIndex = Math.min(hymn.lyrics.length, matchIndex + query.length + 50);
        excerpt = (startIndex > 0 ? '...' : '') + 
                  hymn.lyrics.substring(startIndex, endIndex) + 
                  (endIndex < hymn.lyrics.length ? '...' : '');
      }
      
      results.push({
        id: hymn.id,
        title: hymn.title,
        type: 'hymn',
        excerpt,
        matchType: matchInTitle ? 'title' : 'content',
        score: matchInTitle ? 2 : 1, // Higher score for title matches
        data: {
          viewCount: hymn.viewCount
        }
      });
    });
    
    // Sort results
    if (sortBy === 'score') {
      results.sort((a, b) => {
        return sortOrder === 'desc' ? 
          (b.score || 0) - (a.score || 0) : 
          (a.score || 0) - (b.score || 0);
      });
    }
    
    // Paginate results
    const paginatedResults = results.slice(page * limit, (page + 1) * limit);
    
    // Record search
    saveSearch(query, results.length).catch(console.error);
    
    return {
      results: paginatedResults,
      totalResults: results.length,
      page,
      totalPages: Math.ceil(results.length / limit),
      query
    };
  } catch (error) {
    console.error('Error in offline search:', error);
    throw error;
  }
}

/**
 * @file Search API functions for hymns, authors, and other content
 */

import { supabase } from '../../../lib/supabase/client';
import type { SearchParams, SearchResults } from '../types';

/**
 * Perform a search across hymns, authors, and other content
 * 
 * @param params - Search parameters
 * @returns Search results
 */
export async function searchContent(params: SearchParams): Promise<SearchResults> {
  const {
    query,
    type = 'all',
    limit = 20,
    page = 0,
    sortBy = 'relevance',
    sortOrder = 'desc',
    filters = {}
  } = params;
  
  // Default response structure
  const results: SearchResults = {
    hymns: [],
    authors: [],
    themes: [],
    total: 0,
    page,
    pageSize: limit
  };

  // If no query, return empty results
  if (!query || query.trim().length < 2) {
    return results;
  }

  try {
    // Calculate pagination
    const from = page * limit;
    const to = from + limit - 1;
    
    // Search hymns if type is 'all' or 'hymns'
    if (type === 'all' || type === 'hymns') {
      let hymnsQuery = supabase
        .from('hymns_new')
        .select(`
          *,
          pdf_files:hymn_pdf_files(id),
          authors:hymn_authors(authors(*))
        `, { count: 'exact' });
      
      // Add search term for title or lyrics
      hymnsQuery = hymnsQuery.or(`title.ilike.%${query}%,lyrics.ilike.%${query}%`);
      
      // Apply filters if any
      if (filters.theme) {
        hymnsQuery = hymnsQuery.eq('theme_id', filters.theme);
      }
      
      if (filters.author) {
        // Subquery to get hymns by author
        const { data: hymnIds } = await supabase
          .from('hymn_authors')
          .select('hymn_id')
          .eq('author_id', filters.author);
        
        if (hymnIds && hymnIds.length > 0) {
          hymnsQuery = hymnsQuery.in('id', hymnIds.map(h => h.hymn_id));
        } else {
          // No hymns by this author, return empty results
          return results;
        }
      }
      
      // Apply sorting
      if (sortBy === 'title') {
        hymnsQuery = hymnsQuery.order('title', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'created_at') {
        hymnsQuery = hymnsQuery.order('created_at', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'updated_at') {
        hymnsQuery = hymnsQuery.order('updated_at', { ascending: sortOrder === 'asc' });
      } else if (sortBy === 'views') {
        hymnsQuery = hymnsQuery.order('view_count', { ascending: sortOrder === 'asc' });
      }
      // For relevance, we rely on the database's ranking
      
      // Apply pagination
      hymnsQuery = hymnsQuery.range(from, to);
      
      // Execute query
      const { data: hymns, error, count } = await hymnsQuery;
      
      if (error) {
        console.error('Error searching hymns:', error);
      } else if (hymns) {
        results.hymns = hymns;
        results.total = count || 0;
      }
    }
    
    // Search authors if type is 'all' or 'authors'
    if (type === 'all' || type === 'authors') {
      const { data: authors, error, count } = await supabase
        .from('authors')
        .select('*', { count: 'exact' })
        .ilike('name', `%${query}%`)
        .order(sortBy === 'name' ? 'name' : 'created_at', { ascending: sortOrder === 'asc' })
        .range(from, to);
      
      if (error) {
        console.error('Error searching authors:', error);
      } else if (authors) {
        results.authors = authors;
        
        // Only update total if we're specifically searching for authors
        if (type === 'authors') {
          results.total = count || 0;
        }
      }
    }
    
    // Search themes if type is 'all' or 'themes'
    if (type === 'all' || type === 'themes') {
      const { data: themes, error, count } = await supabase
        .from('themes')
        .select('*', { count: 'exact' })
        .ilike('name', `%${query}%`)
        .order(sortBy === 'name' ? 'name' : 'created_at', { ascending: sortOrder === 'asc' })
        .range(from, to);
      
      if (error) {
        console.error('Error searching themes:', error);
      } else if (themes) {
        results.themes = themes;
        
        // Only update total if we're specifically searching for themes
        if (type === 'themes') {
          results.total = count || 0;
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to perform search. Please try again.');
  }
}

/**
 * Get search suggestions based on a partial query
 * 
 * @param partialQuery - Partial search query
 * @returns Array of search suggestions
 */
export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.trim().length < 2) {
    return [];
  }

  try {
    // Get hymn title suggestions
    const { data: hymnSuggestions, error: hymnError } = await supabase
      .from('hymns_new')
      .select('title')
      .ilike('title', `%${partialQuery}%`)
      .limit(5);
      
    if (hymnError) {
      console.error('Error getting hymn suggestions:', hymnError);
      return [];
    }
    
    // Get author name suggestions
    const { data: authorSuggestions, error: authorError } = await supabase
      .from('authors')
      .select('name')
      .ilike('name', `%${partialQuery}%`)
      .limit(5);
      
    if (authorError) {
      console.error('Error getting author suggestions:', authorError);
      return [];
    }
    
    // Combine and filter unique suggestions
    const allSuggestions = [
      ...(hymnSuggestions?.map(h => h.title) || []),
      ...(authorSuggestions?.map(a => a.name) || [])
    ];
    
    // Remove duplicates and empty values
    return [...new Set(allSuggestions)].filter(Boolean);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}
