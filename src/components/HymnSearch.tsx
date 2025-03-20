import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Search, SlidersHorizontal, X, Filter, ArrowDownAZ } from 'lucide-react';
import { useDebounce } from '../utils/hooks';
import { Hymn } from '../types';
import SearchInput from './SearchInput';
import HymnCard from './HymnCard';
import LoadingIndicator from './LoadingIndicator';
import Pagination from './Pagination';

interface HymnSearchProps {
  initialQuery?: string;
  showFilters?: boolean;
}

const HymnSearch: React.FC<HymnSearchProps> = ({
  initialQuery = '',
  showFilters = true
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'title' | 'lyrics' | 'author'>('title');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [sortBy, setSortBy] = useState<'title' | 'newest' | 'popular'>('title');
  const [page, setPage] = useState(1);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Reset to page 1 when search/filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, selectedTheme, selectedAuthor, sortBy]);
  
  // Fetch themes for filter
  const { data: themes } = useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch authors for filter
  const { data: authors } = useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });
  
  // Search hymns
  const {
    data: searchResults,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['hymn-search', debouncedQuery, searchType, selectedTheme, selectedAuthor, sortBy, page],
    queryFn: async () => {
      // Build search options
      const searchOptions = {
        page,
        limit: 10,
        authorId: selectedAuthor || null,
        themeId: selectedTheme || null,
        sortBy
      };
      
      // Determine search field based on searchType
      let query = supabase.from('hymns_new').select(`
        id,
        title,
        lyrics,
        created_at,
        updated_at,
        hymn_authors(author_id, authors(id, name)),
        hymn_themes(theme_id, themes(id, name)),
        hymn_pdf_files(id, pdf_path)
      `, { count: 'exact' });
      
      // Apply search if provided
      if (debouncedQuery) {
        if (searchType === 'title') {
          query = query.ilike('title', `%${debouncedQuery}%`);
        } else if (searchType === 'lyrics') {
          query = query.ilike('lyrics', `%${debouncedQuery}%`);
        } else if (searchType === 'author') {
          query = query.textSearch('author_names', debouncedQuery, { 
            type: 'websearch',
            config: 'english'
          });
        }
      }
      
      // Apply filters
      if (selectedAuthor) {
        query = query.eq('hymn_authors.author_id', selectedAuthor);
      }
      
      if (selectedTheme) {
        query = query.eq('hymn_themes.theme_id', selectedTheme);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'title':
        default:
          query = query.order('title');
          break;
      }
      
      // Apply pagination
      const from = (page - 1) * 10;
      const to = from + 10 - 1;
      query = query.range(from, to);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Transform data with proper nesting
      const hymns = data.map(hymn => ({
        ...hymn,
        authors: hymn.hymn_authors?.map(ha => ha.authors) || [],
        themes: hymn.hymn_themes?.map(ht => ht.themes) || [],
        pdf_files: hymn.hymn_pdf_files || []
      }));
      
      return {
        data: hymns,
        count: count || 0,
        totalPages: count ? Math.ceil(count / 10) : 0
      };
    },
    keepPreviousData: true
  });
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedTheme('');
    setSelectedAuthor('');
    setSearchType('title');
    setSortBy('title');
    setPage(1);
  };
  
  return (
    <div className="w-full">
      {/* Search input and filters */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search hymns by title, lyrics, or author..."
          onSearch={setSearchQuery}
          initialValue={searchQuery}
          isLoading={isLoading}
          autoFocus
        />
        
        <div className="flex flex-wrap items-center justify-between mt-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-2">
              <label className="text-gray-700 dark:text-gray-300">Search in:</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm text-sm"
              >
                <option value="title">Title</option>
                <option value="lyrics">Lyrics</option>
                <option value="author">Author</option>
              </select>
            </div>
            
            {showFilters && (
              <button
                onClick={toggleFilters}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                {filtersVisible ? 'Hide Filters' : 'Show Filters'}
              </button>
            )}
          </div>
          
          {(selectedTheme || selectedAuthor || searchType !== 'title' || sortBy !== 'title') && (
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-2 sm:mt-0"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Advanced filters */}
      {showFilters && filtersVisible && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm"
              >
                <option value="">All Themes</option>
                {themes?.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm"
              >
                <option value="">All Authors</option>
                {authors?.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm"
              >
                <option value="title">Title (A-Z)</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Search results count and sort info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {searchResults?.count !== undefined ? (
            <>
              <span className="font-medium">{searchResults.count}</span> hymns found
              {searchQuery && (
                <span> for "<span className="font-medium">{searchQuery}</span>"</span>
              )}
            </>
          ) : null}
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ArrowDownAZ className="h-4 w-4 mr-1" />
          <span>Sorted by {getSortLabel(sortBy)}</span>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Searching hymns..." />
        </div>
      )}
      
      {/* Error state */}
      {isError && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <Search className="h-6 w-6 text-red-600 dark:text-red-200" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Search failed</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            An error occurred while searching. Please try again later.
          </p>
        </div>
      )}
      
      {/* No results state */}
      {!isLoading && !isError && searchResults?.data.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <Search className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No hymns found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchQuery 
              ? `No hymns matching "${searchQuery}" were found. Try a different search term or removing some filters.` 
              : "No hymns match your current filters. Try adjusting or clearing filters."}
          </p>
          {(selectedTheme || selectedAuthor || sortBy !== 'title') && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      {/* Search results */}
      {!isLoading && !isError && searchResults?.data.length > 0 && (
        <div className="space-y-4 mb-8">
          {searchResults.data.map((hymn) => (
            <HymnCard key={hymn.id} hymn={hymn as Hymn} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {searchResults?.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={searchResults.totalPages}
          onPageChange={setPage}
          className="mt-8"
        />
      )}
    </div>
  );
};

function getSortLabel(sortBy: string): string {
  switch (sortBy) {
    case 'newest': return 'Newest First';
    case 'popular': return 'Most Popular';
    case 'title':
    default: return 'Title (A-Z)';
  }
}

export default HymnSearch;
