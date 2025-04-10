import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../../core/components/ui/input';
import { Button } from '../../../core/components/ui/button';
import { useDebounce } from '../../../core/hooks/useDebounce';

interface SearchInputProps {
  query: string;
  onSearch: (query: string) => void;
  onClear: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ query, onSearch, onClear }) => {
  const [inputValue, setInputValue] = useState(query);
  const debouncedValue = useDebounce(inputValue, 500);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };
  
  // Clear search input
  const handleClear = () => {
    setInputValue('');
    onClear();
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        
        <Input
          type="search"
          placeholder="Tìm kiếm thánh ca, tác giả, chủ đề..."
          value={inputValue}
          onChange={handleChange}
          className="pl-10 pr-16 py-6 text-lg"
        />
        
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
        
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          size="sm"
        >
          Tìm
        </Button>
      </div>
    </form>
  );
};

export default SearchInput;
