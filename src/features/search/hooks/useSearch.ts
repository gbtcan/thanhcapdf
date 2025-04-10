import { useState, useCallback, useEffect } from 'react';
import { searchAPI } from '../api/searchApi';
import { SearchResult } from '../types';
import { getStorageItem, setStorageItem } from '../../../core/utils/storage';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Load search history from storage
  useEffect(() => {
    const history = getStorageItem<string[]>(SEARCH_HISTORY_KEY, []);
    setSearchHistory(history);
  }, []);
  
  // Save search term to history
  const saveToHistory = useCallback((term: string) => {
    if (!term.trim()) return;
    
    setSearchHistory(prev => {
      // Remove if already exists and add to front
      const filtered = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      const newHistory = [term, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to storage
      setStorageItem(SEARCH_HISTORY_KEY, newHistory);
      
      return newHistory;
    });
  }, []);
  
  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    setStorageItem(SEARCH_HISTORY_KEY, []);
  }, []);
  
  // Perform search
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchAPI({ query });
      
      setResults(response.results);
      setTotalResults(response.totalResults);
      
      // Save search term to history
      saveToHistory(query);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [saveToHistory]);
  
  return {
    results,
    totalResults,
    isLoading,
    error,
    search,
    searchHistory,
    clearHistory
  };
}
