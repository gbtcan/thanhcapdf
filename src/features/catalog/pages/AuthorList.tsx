import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Filter } from 'lucide-react';
import { useAuthorsList } from '../hooks';
import AuthorCard from '../components/AuthorCard';
import AuthorListFilters from '../components/AuthorListFilters';
import { Pagination } from '../../../components/common';
import { LoadingIndicator } from '../../../core/components';

const AuthorList: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    authors,
    isLoading,
    error,
    filters,
    updateFilters,
    pagination
  } = useAuthorsList();
  
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
            <User className="h-6 w-6 mr-2 text-indigo-600" />
            Tác giả
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLoading 
              ? 'Đang tải danh sách tác giả...' 
              : `Hiển thị ${authors.length} trong tổng số ${pagination.totalItems} tác giả`
            }
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button 
            className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Tìm kiếm tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        
        {/* Filters (if shown) */}
        {showFilters && (
          <div className="mt-4">
            <AuthorListFilters 
              filters={filters} 
              onChange={updateFilters} 
            />
          </div>
        )}
      </div>
      
      {/* Results */}
      {isLoading ? (
        <LoadingIndicator message="Đang tải danh sách tác giả..." />
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300">
          <p className="font-medium">Lỗi khi tải danh sách tác giả</p>
          <p className="mt-1">{error instanceof Error ? error.message : 'Không thể kết nối đến máy chủ'}</p>
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <User className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">Không tìm thấy tác giả</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {filters.searchTerm 
              ? `Không có tác giả nào phù hợp với "${filters.searchTerm}". Hãy thử từ khóa khác.`
              : 'Không tìm thấy tác giả nào. Hãy thử thay đổi bộ lọc và thử lại.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {authors.map((author) => (
              <AuthorCard
                key={author.id}
                author={author}
                onClick={() => navigate(`/authors/${author.id}`)}
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

export default AuthorList;
