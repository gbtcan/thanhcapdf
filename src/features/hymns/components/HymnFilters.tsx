import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { HymnFilters } from '../types';
import { fetchAuthors } from '../../catalog/api/catalogApi';
import { fetchThemes } from '../../catalog/api/catalogApi';

interface HymnFiltersProps {
  filters: HymnFilters;
  onChange: (filters: Partial<HymnFilters>) => void;
  onReset: () => void;
}

const HymnFilterBar: React.FC<HymnFiltersProps> = ({ 
  filters, 
  onChange, 
  onReset 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Fetch filter options
  const { data: authors } = useQuery({
    queryKey: ['authors-list'],
    queryFn: () => fetchAuthors()
  });
  
  const { data: themes } = useQuery({
    queryKey: ['themes-list'],
    queryFn: () => fetchThemes()
  });
  
  const hasActiveFilters = 
    !!filters.search || 
    !!filters.author || 
    !!filters.theme || 
    (!!filters.sortBy && filters.sortBy !== 'title');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thánh ca..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        {/* Filter button */}
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center px-4 py-2 border rounded-md transition-colors ${
              expanded || hasActiveFilters 
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ Lọc
            {expanded ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </button>
          
          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
      
      {/* Expanded filters */}
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Author filter */}
          <div>
            <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tác giả
            </label>
            <select
              id="author-filter"
              value={filters.author || ''}
              onChange={(e) => onChange({ author: e.target.value ? e.target.value : undefined })}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả các tác giả</option>
              {authors?.map((author) => (
                <option key={author.id} value={author.id}>{author.name}</option>
              ))}
            </select>
          </div>
          
          {/* Theme filter */}
          <div>
            <label htmlFor="theme-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chủ đề
            </label>
            <select
              id="theme-filter"
              value={filters.theme || ''}
              onChange={(e) => onChange({ theme: e.target.value ? e.target.value : undefined })}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả chủ đề</option>
              {themes?.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>
          </div>
          
          {/* Sort filter */}
          <div>
            <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sắp xếp theo
            </label>
            <select
              id="sort-filter"
              value={`${filters.sortBy || 'title'}-${filters.sortDirection || 'asc'}`}
              onChange={(e) => {
                const [sortBy, sortDirection] = e.target.value.split('-');
                onChange({ sortBy: sortBy as any, sortDirection: sortDirection as any });
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="title-asc">Tên (A-Z)</option>
              <option value="title-desc">Tên (Z-A)</option>
              <option value="created_at-desc">Mới nhất</option>
              <option value="created_at-asc">Cũ nhất</option>
              <option value="view_count-desc">Phổ biến nhất</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default HymnFilterBar;
