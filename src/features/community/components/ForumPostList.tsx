import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Filter, Search } from 'lucide-react';
import { useForumPosts } from '../hooks/useForumPosts';
import ForumPostCard from './ForumPostCard';
import { Pagination } from '../../../components/common';
import { LoadingIndicator } from '../../../core/components';
import { ForumPostFilter } from '../types';

interface ForumPostListProps {
  initialFilter?: ForumPostFilter;
  title?: string;
  showFilters?: boolean;
}

const ForumPostList: React.FC<ForumPostListProps> = ({ 
  initialFilter = {}, 
  title = 'Bài viết mới nhất',
  showFilters = true
}) => {
  const {
    posts,
    totalPosts,
    isLoading,
    error,
    page,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    filter,
    updateFilter
  } = useForumPosts(initialFilter);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ search: searchTerm });
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilter({ sort: e.target.value as ForumPostFilter['sort'] });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
          {title}
          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
            ({totalPosts})
          </span>
        </h2>
        
        {showFilters && (
          <div className="mt-2 md:mt-0 flex items-center space-x-2">
            <select
              value={filter.sort || 'newest'}
              onChange={handleSortChange}
              className="border border-gray-300 dark:border-gray-600 rounded-md py-1.5 pl-3 pr-8 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="most_viewed">Xem nhiều nhất</option>
              <option value="most_liked">Thích nhiều nhất</option>
              <option value="most_replied">Trả lời nhiều nhất</option>
            </select>
            
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Search bar */}
      {showFilters && showFilterPanel && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      )}
      
      {/* Posts list */}
      {isLoading ? (
        <LoadingIndicator />
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">Đã xảy ra lỗi khi tải bài viết.</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Vui lòng thử lại sau.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Không có bài viết nào</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter.search 
              ? `Không tìm thấy bài viết nào cho "${filter.search}"`
              : 'Chưa có bài viết nào trong diễn đàn này'}
          </p>
          <Link
            to="/community/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tạo bài viết mới
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            onNext={nextPage}
            onPrevious={previousPage}
          />
        </div>
      )}
    </div>
  );
};

export default ForumPostList;
