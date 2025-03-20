import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Tag, ChevronDown, ChevronUp, X,
  Music, SlidersHorizontal
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingIndicator from '../LoadingIndicator';

interface ForumFiltersProps {
  onFilterChange: (filters: {
    searchQuery: string;
    tagId?: string;
    hymnId?: string;
    sortBy: 'latest' | 'popular' | 'comments';
  }) => void;
  initialFilters?: {
    searchQuery?: string;
    tagId?: string;
    hymnId?: string;
    sortBy?: 'latest' | 'popular' | 'comments';
  };
}

const ForumFilters: React.FC<ForumFiltersProps> = ({
  onFilterChange,
  initialFilters = {}
}) => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedTagId, setSelectedTagId] = useState(initialFilters.tagId);
  const [selectedHymnId, setSelectedHymnId] = useState(initialFilters.hymnId);
  const [selectedHymnTitle, setSelectedHymnTitle] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'comments'>(initialFilters.sortBy || 'latest');
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showHymnDropdown, setShowHymnDropdown] = useState(false);
  const [hymnSearchQuery, setHymnSearchQuery] = useState('');
  const [hymnSearchResults, setHymnSearchResults] = useState<any[]>([]);
  
  // Fetch tags
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      searchQuery,
      tagId: selectedTagId,
      hymnId: selectedHymnId,
      sortBy
    });
  };
  
  // Apply filters when selection changes
  useEffect(() => {
    applyFilters();
  }, [sortBy, selectedTagId, selectedHymnId]);
  
  // Load hymn title if hymnId is provided
  useEffect(() => {
    const loadHymnTitle = async () => {
      if (!selectedHymnId) {
        setSelectedHymnTitle('');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('hymns')
          .select('title')
          .eq('id', selectedHymnId)
          .single();
          
        if (error) throw error;
        setSelectedHymnTitle(data.title);
      } catch (error) {
        console.error('Error loading hymn title:', error);
        setSelectedHymnTitle('');
      }
    };
    
    loadHymnTitle();
  }, [selectedHymnId]);
  
  // Search hymns
  useEffect(() => {
    const searchHymns = async () => {
      if (hymnSearchQuery.length < 2) {
        setHymnSearchResults([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('hymns')
          .select('id, title')
          .ilike('title', `%${hymnSearchQuery}%`)
          .limit(5);
          
        if (error) throw error;
        setHymnSearchResults(data || []);
      } catch (error) {
        console.error('Error searching hymns:', error);
        setHymnSearchResults([]);
      }
    };
    
    const debounceTimer = setTimeout(searchHymns, 300);
    return () => clearTimeout(debounceTimer);
  }, [hymnSearchQuery]);
  
  // Handle hymn selection
  const selectHymn = (hymn: any) => {
    setSelectedHymnId(hymn.id);
    setSelectedHymnTitle(hymn.title);
    setHymnSearchQuery('');
    setShowHymnDropdown(false);
  };
  
  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTagId(undefined);
    setSelectedHymnId(undefined);
    setSelectedHymnTitle('');
    setSortBy('latest');
    onFilterChange({
      searchQuery: '',
      tagId: undefined,
      hymnId: undefined,
      sortBy: 'latest'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Search input */}
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Filters toggle and sort options */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-1.5" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1.5" />
            )}
          </button>
          
          {(searchQuery || selectedTagId || selectedHymnId || sortBy !== 'latest') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-1.5" />
              Reset
            </button>
          )}
        </div>
        
        {/* Sort options */}
        <div className="flex items-center space-x-1">
          <span className="mr-2 text-sm text-gray-500">Sort:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 ${
                sortBy === 'latest'
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 border-l border-gray-300 ${
                sortBy === 'popular'
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setSortBy('comments')}
              className={`px-3 py-1.5 border-l border-gray-300 ${
                sortBy === 'comments'
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Most Comments
            </button>
          </div>
        </div>
      </div>
      
      {/* Extended filters */}
      {showFilters && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Tags filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Tag
            </label>
            {tagsLoading ? (
              <LoadingIndicator size="small" />
            ) : tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTagId(
                      selectedTagId === tag.id ? undefined : tag.id
                    )}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedTagId === tag.id
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tags available</p>
            )}
          </div>
          
          {/* Hymn filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Hymn
            </label>
            
            {selectedHymnId && selectedHymnTitle ? (
              <div className="flex items-center">
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-blue-700">
                  <div className="flex items-center">
                    <Music className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{selectedHymnTitle}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedHymnId(undefined);
                    setSelectedHymnTitle('');
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={hymnSearchQuery}
                    onChange={(e) => {
                      setHymnSearchQuery(e.target.value);
                      setShowHymnDropdown(true);
                    }}
                    placeholder="Search for a hymn..."
                    className="pl-10 w-full border border-gray-300 rounded-md py-2"
                  />
                </div>
                
                {/* Dropdown for hymn results */}
                {showHymnDropdown && hymnSearchResults.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {hymnSearchResults.map((hymn) => (
                      <li
                        key={hymn.id}
                        className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-50"
                        onClick={() => selectHymn(hymn)}
                      >
                        <div className="flex items-center">
                          <Music className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="truncate">{hymn.title}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                {showHymnDropdown && hymnSearchResults.length === 0 && hymnSearchQuery.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5">
                    <p className="text-sm text-gray-500 text-center">No hymns found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Applied filters summary */}
      {(selectedTagId || selectedHymnId) && (
        <div className="pt-2">
          <div className="text-xs text-gray-500">Active filters:</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedTagId && tags && (
              <div className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800">
                <span className="mr-1">Tag:</span>
                <span className="font-medium">
                  {tags.find(t => t.id === selectedTagId)?.name || 'Unknown tag'}
                </span>
                <button
                  onClick={() => setSelectedTagId(undefined)}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {selectedHymnId && selectedHymnTitle && (
              <div className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                <span className="mr-1">Hymn:</span>
                <span className="font-medium">
                  {selectedHymnTitle}
                </span>
                <button
                  onClick={() => {
                    setSelectedHymnId(undefined);
                    setSelectedHymnTitle('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumFilters;
