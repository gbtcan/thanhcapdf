import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { useForumPosts } from '../hooks/useForumPosts';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LoadingIndicator } from '../../../core/components';

const RecentPosts: React.FC = () => {
  const { posts, isLoading, error } = useForumPosts({ sort: 'newest' });
  
  if (isLoading) {
    return <LoadingIndicator size="small" message="Đang tải..." />;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400">
        Không thể tải dữ liệu. Vui lòng thử lại sau.
      </div>
    );
  }
  
  if (!posts.length) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-400">
        Chưa có bài viết nào.
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-indigo-600" />
        <h2 className="font-medium text-gray-900 dark:text-white">Bài viết gần đây</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {posts.slice(0, 5).map(post => (
          <Link
            key={post.id}
            to={`/community/posts/${post.id}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-750"
          >
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
              {post.title}
            </h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: vi
                })}
              </span>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-3 w-3 mr-1" />
                {post.replies_count || 0}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentPosts;
