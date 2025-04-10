import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getForumPostById } from '../api/communityApi';
import { Heart, MessageSquare, Eye, ArrowLeft, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LoadingIndicator } from '../../../core/components';
import ReplySection from './ReplySection';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: () => getForumPostById(id!),
    enabled: !!id
  });
  
  if (isLoading) {
    return <LoadingIndicator message="Đang tải bài viết..." />;
  }
  
  if (error || !post) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <h2 className="text-red-800 dark:text-red-300 font-medium">Không tìm thấy bài viết</h2>
        <p className="text-red-700 dark:text-red-400 mt-1">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
        <Link 
          to="/community"
          className="mt-4 inline-flex items-center text-red-700 dark:text-red-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại diễn đàn
        </Link>
      </div>
    );
  }
  
  // Format date
  const formattedDate = formatDistanceToNow(parseISO(post.created_at), {
    addSuffix: true,
    locale: vi
  });
  
  return (
    <div>
      {/* Back link */}
      <div className="mb-4">
        <Link 
          to="/community" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại diễn đàn
        </Link>
      </div>
      
      {/* Post detail card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        {/* Post header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              {post.user?.avatar_url ? (
                <img 
                  src={post.user.avatar_url} 
                  alt={post.user.display_name}
                  className="h-6 w-6 rounded-full mr-2" 
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2">
                  <span className="font-medium text-xs text-indigo-600 dark:text-indigo-400">
                    {post.user?.display_name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <span className="font-medium">{post.user?.display_name}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              {formattedDate}
            </div>
            
            {post.category && (
              <Link 
                to={`/community/categories/${post.category.id}`}
                className="flex items-center px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium"
              >
                {post.category.name}
              </Link>
            )}
          </div>
        </div>
        
        {/* Post content */}
        <div className="px-6 py-4">
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Post stats */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Eye className="h-4 w-4 mr-1.5" />
            {post.view_count || 0} lượt xem
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Heart className="h-4 w-4 mr-1.5" />
            {post.likes_count || 0} thích
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            {post.replies_count || 0} phản hồi
          </div>
        </div>
      </div>
      
      {/* Replies section */}
      <ReplySection postId={post.id} />
    </div>
  );
};

export default PostDetail;
