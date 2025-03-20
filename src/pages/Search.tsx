import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Music, User, ChevronDown, ChevronUp, Filter, Tag, Loader2, XCircle } from 'lucide-react';
import { useDebounce } from '../utils/hooks';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import type { HymnWithRelations, Category, Author } from '../types';

const Search = () => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'author' | 'lyrics'>('title');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');
  
  // Debounce search query to avoid too many requests
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Track if this is the initial page load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (debouncedQuery) {
      setIsInitialLoad(false);
    }
  }, [debouncedQuery]);

  // Fetch hymns based on search query and filters
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError 
  } = useQuery({
    queryKey: ['search', debouncedQuery, searchType, categoryFilter, sortBy],
    queryFn: async () => {
      if (!debouncedQuery && isInitialLoad) return [];
      
      try {
        let query;
        
        // Build query based on search type
        if (searchType === 'title') {
          query = supabase
            .from('hymns')
            .select(`
              *,
              hymn_authors(authors(*)),
              hymn_categories(categories(*))
            `)
            .ilike('title', `%${debouncedQuery}%`);
        } else if (searchType === 'lyrics') {
          query = supabase
            .from('hymns')
            .select(`
              *,
              hymn_authors(authors(*)),
              hymn_categories(categories(*))
            `)
            .ilike('lyrics', `%${debouncedQuery}%`);
        } else if (searchType === 'author') {
          // First find authors matching the query
          const { data: authors, error: authorsError } = await supabase
            .from('authors')
            .select('id')
            .ilike('name', `%${debouncedQuery}%`);
          
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
          
          query = supabase
            .from('hymns')
            .select(`
              *,
              hymn_authors(authors(*)),
              hymn_categories(categories(*))
            `)
            .in('id', hymnIds);
        } else {
          throw new Error('Invalid search type');
        }
        
        // Apply category filter if selected
        if (categoryFilter) {
          // First get hymn IDs for the category
          const { data: hymnCategories, error: categoryError } = await supabase
            .from('hymn_categories')
            .select('hymn_id')
            .eq('category_id', categoryFilter);
            
          if (categoryError) throw categoryError;
          
          if (!hymnCategories || hymnCategories.length === 0) {
            return [];
          }
          
          const hymnIds = hymnCategories.map(item => item.hymn_id);
          query = query.in('id', hymnIds);
        }
        
        // Apply sorting
        if (sortBy === 'title_asc') {
          query = query.order('title', { ascending: true });
        } else if (sortBy === 'title_desc') {
          query = query.order('title', { ascending: false });
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true });
        }
        // Default is relevance which is handled by the database order
        
        // Execute query
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data for frontend use
        return data.map(hymn => ({
          ...hymn,
          authors: hymn.hymn_authors?.map((ha: any) => ha.authors) || [],
          categories: hymn.hymn_categories?.map((hc: any) => hc.categories) || []
        }));
      } catch (error) {
        console.error('Search error:', error);
        throw error;
      }
    },
    enabled: !isInitialLoad || debouncedQuery.length > 0
  });

  // Fetch all categories for filters
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories-for-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Extract a short excerpt of lyrics for preview
  const getLyricExcerpt = (lyrics: string, maxLength = 100) => {
    if (!lyrics) return '';
    
    const plainText = lyrics.replace(/<[^>]+>/g, '');
    if (plainText.length <= maxLength) return plainText;
    
    return plainText.substring(0, maxLength) + '...';
  };
  
  // Reset filters
  const resetFilters = () => {
    setCategoryFilter(null);
    setSortBy('relevance');
    if (showFilters) setShowFilters(false);
  };
  
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Search header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Search Hymns</h1>
          
          {/* Search type toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
            <button 
              onClick={() => setSearchType('title')}
              className={`px-3 py-1 rounded text-sm ${
                searchType === 'title' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Title
            </button>
            <button 
              onClick={() => setSearchType('author')}
              className={`px-3 py-1 rounded text-sm ${
                searchType === 'author' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Author
            </button>
            <button 
              onClick={() => setSearchType('lyrics')}
              className={`px-3 py-1 rounded text-sm ${
                searchType === 'lyrics' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Lyrics
            </button>
          </div>
        </div>
        
        {/* Search input and filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search by ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                autoFocus
              />
            </div>
            
            {/* Filter button */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg ${
                  showFilters || categoryFilter !== null 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </button>
              
              {/* Reset filters button */}
              {(categoryFilter !== null || sortBy !== 'relevance') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reset
                </button>
              )}
            </div>
          </div>
          
          {/* Expanded filter options */}
          {showFilters && (
            <div className="mt-4 space-y-4">
              {/* Category filter */}
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <select
                  id="category-filter"
                  value={categoryFilter || ''}
                  onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : null)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort options */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  <option value="relevance">Relevance</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Initial state prompt */}
        {isInitialLoad && !debouncedQuery && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Search for Hymns</h3>
            <p className="mt-1 text-gray-500">
              Enter keywords to search by {searchType}
            </p>
          </div>
        )}
        
        {/* Loading state */}
        {searchLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          </div>
        )}
        
        {/* Error state */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Search Error</p>
              <p className="text-sm">{(searchError as Error).message}</p>
            </div>
          </div>
        )}
        
        {/* No results */}
        {!searchLoading && !searchError && !isInitialLoad && searchResults?.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <XCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Results Found</h3>
            <p className="mt-1 text-gray-500">
              Try different keywords or adjust your filters
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* Search results */}
        {!searchLoading && !searchError && searchResults && searchResults.length > 0 && (
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'} Found
                </h2>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {searchResults.map((hymn) => (
                  <li key={hymn.id}>
                    <Link
                      to={`/songs/${hymn.id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                            <Music className="h-5 w-5 text-indigo-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900">{hymn.title}</h3>
                        </div>
                        
                        {/* Authors */}
                        {hymn.authors && hymn.authors.length > 0 && (
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            By: {hymn.authors.map(author => author.name).join(', ')}
                          </div>
                        )}
                        
                        {/* Categories */}
                        {hymn.categories && hymn.categories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {hymn.categories.map(category => (
                              <span
                                key={category.id}
                                className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Lyrics excerpt */}
                        {hymn.lyrics && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="line-clamp-2">{getLyricExcerpt(hymn.lyrics)}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Search;