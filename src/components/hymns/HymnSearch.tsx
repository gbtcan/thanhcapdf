import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, X, ArrowDownAZ, SlidersHorizontal } from 'lucide-react';
import { fetchAuthors, fetchThemes, fetchTags } from '../../lib/hymnService';
import { HymnSearchParams } from '../../types';

interface HymnSearchProps {
  onSearch: (params: HymnSearchParams) => void;
  initialSearchParams?: HymnSearchParams;
  showFilterToggle?: boolean;
}

const HymnSearch: React.FC<HymnSearchProps> = ({
  onSearch,
  initialSearchParams = {},
  showFilterToggle = true
}) => {
  // State
  const [query, setQuery] = useState(initialSearchParams.query || '');
  const [authorId, setAuthorId] = useState(initialSearchParams.authorId || '');
  const [themeId, setThemeId] = useState(initialSearchParams.themeId || '');
  const [tagId, setTagId] = useState(initialSearchParams.tagId || '');
  const [sortBy, setSortBy] = useState<'title' | 'newest' | 'popular'>(
    initialSearchParams.sortBy || 'title'
  );
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize with existing filters if provided
  useEffect(() => {
    if (initialSearchParams.authorId || initialSearchParams.themeId || initialSearchParams.tagId) {
      setShowFilters(true);
    }
  }, [initialSearchParams]);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((params: HymnSearchParams) => {
      onSearch(params);
    }, 500),
    [onSearch]
  );
  
  // Effect to handle debounced search for text input
  useEffect(() => {
    if (query !== undefined && query !== (initialSearchParams.query || '')) {
      debouncedSearch({
        query: query || undefined,
        authorId: authorId || undefined,
        themeId: themeId || undefined,
        tagId: tagId || undefined,
        sortBy
      });
    }
  }, [query, debouncedSearch]);

  // Load filter options from API
  const { data: authors } = useQuery({
    queryKey: ['authors'],
    queryFn: fetchAuthors
  });
  
  const { data: themes } = useQuery({
    queryKey: ['themes'],
    queryFn: fetchThemes
  });
  
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags
  });
  
  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSearch({
      query: query || undefined,
      authorId: authorId || undefined,
      themeId: themeId || undefined,
      tagId: tagId || undefined,
      sortBy
    });
  };
  
  // Reset filters
  const clearFilters = () => {
    setAuthorId('');
    setThemeId('');
    setTagId('');
    setSortBy('title');
    
    onSearch({
      query,
      sortBy: 'title'
    });
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Handle filter changes
  const handleFilterChange = (
    type: 'author' | 'theme' | 'tag' | 'sort', 
    value: string
  ) => {
    switch (type) {
      case 'author':
        setAuthorId(value);
        break;
      case 'theme':
        setThemeId(value);
        break;
      case 'tag':
        setTagId(value);
        break;
      case 'sort':
        setSortBy(value as 'title' | 'newest' | 'popular');
        break;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search input */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hymns by title, lyrics, or author..."
              className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="submit"
                className="p-2 rounded-r-md bg-indigo-600 hover:bg-indigo-700 text-white h-full"
              >
                Search
              </button>
            </div>
          </div>
          
          {/* Search filters toggle */}
          {showFilterToggle && (
            <div className="flex justify-between mt-3">
              <button
                type="button"
                onClick={toggleFilters}
                className="text-sm flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
              
              <button
                type="button"
                onClick={clearFilters}
                className={`text-sm flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                  authorId || themeId || tagId || sortBy !== 'title' ? '' : 'invisible'
                }`}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </button>
            </div>
          )}
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Author filter */}
            <div>
              <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <select
                id="author-filter"
                value={authorId}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Authors</option>
                {authors?.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Theme filter */}
            <div>
              <label htmlFor="theme-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme
              </label>
              <select
                id="theme-filter"
                value={themeId}
                onChange={(e) => handleFilterChange('theme', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Themes</option>
                {themes?.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tag filter */}
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag
              </label>
              <select
                id="tag-filter"
                value={tagId}
                onChange={(e) => handleFilterChange('tag', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Tags</option>
                {tags?.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort filter */}
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort By
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="title">Title (A-Z)</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Current sort indicator if filters are hidden */}
        {!showFilters && sortBy !== 'title' && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ArrowDownAZ className="h-4 w-4 mr-1" />
            <span>Sorted by: {sortBy === 'newest' ? 'Newest First' : sortBy === 'popular' ? 'Most Popular' : 'Title'}</span>
          </div>
        )}
        
        {/* Submit and clear buttons for larger screens */}
        {showFilters && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

export default HymnSearch;
