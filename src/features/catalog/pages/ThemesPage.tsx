import React, { useState } from 'react';
import { useThemes } from '../hooks/useThemes';
import { ThemeCard } from '../components';
import { NetworkErrorBoundary, LoadingIndicator, Pagination } from '../../../core/components';
import { Search, SortAsc, SortDesc, Tag, BookOpen, AlertTriangle } from 'lucide-react';
import { useDebounce } from '../../../core/hooks/useDebounce';

const ThemesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'hymn_count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  // Debounce search query to prevent excessive API calls
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const { 
    themes, 
    totalThemes, 
    isLoading, 
    error 
  } = useThemes({
    search: debouncedQuery,
    sortBy,
    sortDirection,
    page,
    pageSize
  });
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Change sort field
  const handleSortChange = (field: 'name' | 'hymn_count') => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Chủ Đề Thánh Ca
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Khám phá thánh ca theo chủ đề, ngày lễ và mùa phụng vụ
        </p>
      </div>
      
      {/* Search and filtering */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Sort options */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('name')}
                className={`flex items-center px-4 py-2 border rounded-md ${
                  sortBy === 'name'
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Tag className="h-4 w-4 mr-2" />
                Tên
                {sortBy === 'name' && (
                  sortDirection === 'asc'
                    ? <SortAsc className="h-4 w-4 ml-2" />
                    : <SortDesc className="h-4 w-4 ml-2" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('hymn_count')}
                className={`flex items-center px-4 py-2 border rounded-md ${
                  sortBy === 'hymn_count'
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Số thánh ca
                {sortBy === 'hymn_count' && (
                  sortDirection === 'asc'
                    ? <SortAsc className="h-4 w-4 ml-2" />
                    : <SortDesc className="h-4 w-4 ml-2" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Themes grid with error handling */}
      <NetworkErrorBoundary>
        {isLoading ? (
          <LoadingIndicator message="Đang tải danh sách chủ đề..." />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Lỗi khi tải danh sách chủ đề
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
              </p>
            </div>
          </div>
        ) : themes.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
              Không tìm thấy chủ đề nào
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {debouncedQuery
                ? `Không có chủ đề nào khớp với "${debouncedQuery}"`
                : "Không có chủ đề nào trong hệ thống."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map(theme => (
                <ThemeCard key={theme.id} theme={theme} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalThemes > pageSize && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  pageSize={pageSize}
                  totalItems={totalThemes}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </>
        )}
      </NetworkErrorBoundary>
    </div>
  );
};

export default ThemesPage;
