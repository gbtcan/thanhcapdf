import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
  autoFocus?: boolean;
  isLoading?: boolean;
  debounceMs?: number;
}

/**
 * Reusable search input component with debounce capability
 */
const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search...',
  initialValue = '',
  className = '',
  autoFocus = false,
  isLoading = false,
  debounceMs = 300
}) => {
  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set up debouncing for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Trigger search on debounced query change
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Clear search input
  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-gray-400 dark:text-gray-500 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
      />

      {query && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          onClick={handleClear}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
