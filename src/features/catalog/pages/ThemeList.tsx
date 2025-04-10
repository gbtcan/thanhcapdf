import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { useThemesList } from '../hooks';
import ThemeCard from '../components/ThemeCard';
import { Pagination } from '../../../components/common';
import { LoadingIndicator } from '../../../core/components';

const ThemeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    themes,
    isLoading,
    error,
    filters,
    updateFilters,
    pagination
  } = useThemesList();
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ searchTerm });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-indigo-600" />
            Chủ đề bài hát
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLoading 
              ? 'Đang tải danh sách chủ đề...' 
              : `Hiển thị ${themes.length} trong tổng số ${pagination.totalItems} chủ đề`
            }
          </p>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Tìm kiếm chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
      </div>
      
      {/* Results */}
      {isLoading ? (
        <LoadingIndicator message="Đang tải danh sách chủ đề..." />
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300">
          <p className="font-medium">Lỗi khi tải danh sách chủ đề</p>
          <p className="mt-1">{error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ'}</p>
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">Không tìm thấy chủ đề</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {filters.searchTerm 
              ? `Không có chủ đề nào phù hợp với "${filters.searchTerm}". Hãy thử từ khóa khác.`
              : 'Không tìm thấy chủ đề nào. Hãy thử lại sau.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={pagination.goToPage}
                onNext={pagination.nextPage}
                onPrevious={pagination.previousPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThemeList;
