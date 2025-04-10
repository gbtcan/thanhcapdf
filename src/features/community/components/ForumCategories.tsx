import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, MessageSquare, Book, Music } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getForumCategories } from '../api/communityApi';
import { LoadingIndicator } from '../../../core/components';

const ForumCategories: React.FC = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: getForumCategories,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Get icon based on category name
  const getCategoryIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('thảo luận') || nameLower.includes('discussion')) {
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    } else if (nameLower.includes('hướng dẫn') || nameLower.includes('guide')) {
      return <Book className="h-5 w-5 text-green-500" />;
    } else if (nameLower.includes('bài hát') || nameLower.includes('hymn')) {
      return <Music className="h-5 w-5 text-purple-500" />;
    }
    
    // Default icon
    return <Layout className="h-5 w-5 text-indigo-500" />;
  };

  if (isLoading) {
    return <LoadingIndicator message="Đang tải danh mục..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
        <p className="text-red-600 dark:text-red-300">Không thể tải danh mục diễn đàn. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-medium text-gray-900 dark:text-white">Danh mục</h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {categories?.map((category) => (
          <Link
            key={category.id}
            to={`/community/categories/${category.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750"
          >
            <div className="flex items-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-md mr-3">
                {getCategoryIcon(category.name)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded">
                {category.post_count}
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      {!categories?.length && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Không tìm thấy danh mục nào.
        </div>
      )}
    </div>
  );
};

export default ForumCategories;
