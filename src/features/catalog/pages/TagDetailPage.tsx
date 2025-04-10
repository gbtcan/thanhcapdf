import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTagDetail } from '../hooks/useTagDetail';
import { HymnCard } from '../../hymns/components';
import { LoadingIndicator, NetworkErrorBoundary, AlertBanner, Pagination } from '../../../core/components';
import { ArrowLeft, Tag as TagIcon, Filter, BookOpen, SortAsc, SortDesc } from 'lucide-react';
import { ShareButton } from '../../social/components';

const TagDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Local state for pagination and sorting
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'view_count'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Fetch tag data
  const { 
    tag, 
    hymns, 
    totalHymns, 
    isLoading, 
    error 
  } = useTagDetail(id, {
    page,
    pageSize,
    sortBy,
    sortDirection
  });
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Change sort field
  const handleSortChange = (field: 'title' | 'created_at' | 'view_count') => {
    if (sortBy === field) {
      toggleSortDirection();
    } else {
      setSortBy(field);
      setSortDirection(field === 'view_count' ? 'desc' : 'asc');
    }
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingIndicator message="Đang tải thông tin tag..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertBanner
          type="error"
          title="Không thể tải thông tin tag"
          message="Đã xảy ra lỗi khi tải thông tin tag. Vui lòng thử lại sau."
        />
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Handle not found state
  if (!tag) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-8 text-center">
          <TagIcon className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Không tìm thấy tag
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tag bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              to="/tags"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tất cả thẻ tag
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/tags"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tất cả thẻ tag
        </Link>
      </div>
      
      {/* Tag header */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg overflow-hidden border border-indigo-100 dark:border-indigo-800 shadow-sm">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="bg-white dark:bg-indigo-800 p-3 rounded-full mr-4">
                <TagIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
                  {tag.name}
                </h1>
                
                <div className="flex items-center text-sm text-indigo-700 dark:text-indigo-300">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  {totalHymns} thánh ca
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <ShareButton
                url={window.location.href}
                title={`Tag: ${tag.name}`}
                description={`Khám phá các thánh ca với tag ${tag.name}.`}
              />
            </div>
          </div>
          
          {/* Description */}
          {tag.description && (
            <div className="mt-6 text-indigo-700 dark:text-indigo-300">
              <p>{tag.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Filtering and sorting */}
      <div className="mt-10 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thánh ca với tag "{tag.name}"
          </h2>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sắp xếp:</span>
            
            <button
              onClick={() => handleSortChange('title')}
              className={`flex items-center px-3 py-1.5 text-xs rounded-md ${
                sortBy === 'title'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Tên
              {sortBy === 'title' && (
                sortDirection === 'asc'
                  ? <SortAsc className="h-3 w-3 ml-1" />
                  : <SortDesc className="h-3 w-3 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => handleSortChange('created_at')}
              className={`flex items-center px-3 py-1.5 text-xs rounded-md ${
                sortBy === 'created_at'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Mới nhất
              {sortBy === 'created_at' && (
                sortDirection === 'asc'
                  ? <SortAsc className="h-3 w-3 ml-1" />
                  : <SortDesc className="h-3 w-3 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => handleSortChange('view_count')}
              className={`flex items-center px-3 py-1.5 text-xs rounded-md ${
                sortBy === 'view_count'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Phổ biến
              {sortBy === 'view_count' && (
                sortDirection === 'asc'
                  ? <SortAsc className="h-3 w-3 ml-1" />
                  : <SortDesc className="h-3 w-3 ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Tag hymns */}
      <NetworkErrorBoundary>
        {hymns.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
              Chưa có thánh ca nào
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Thẻ tag này hiện chưa có thánh ca nào trong hệ thống.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hymns.map(hymn => (
              <HymnCard key={hymn.id} hymn={hymn} />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalHymns > pageSize && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={totalHymns}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </NetworkErrorBoundary>
    </div>
  );
};

export default TagDetailPage;
