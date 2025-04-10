import React from 'react';
import { Clock, Search, Trash, X } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';

interface SearchHistoryProps {
  history: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          Tìm kiếm gần đây
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-xs">
          <Trash className="h-3 w-3 mr-1" />
          Xóa lịch sử
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {history.map((term, index) => (
          <div 
            key={`${term}-${index}`}
            className="group flex items-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full pl-3 pr-1 py-1 text-sm"
          >
            <button 
              className="flex items-center focus:outline-none"
              onClick={() => onSelect(term)}
            >
              <Search className="h-3 w-3 mr-1.5 text-gray-500 dark:text-gray-400" />
              <span>{term}</span>
            </button>
            <button 
              className="ml-1 p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                // Remove this term from history
                // This would need implementation in the parent component
              }}
            >
              <X className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
