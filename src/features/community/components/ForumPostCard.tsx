import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Eye, Pin } from 'lucide-react';
import { ForumPost } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ForumPostCardProps {
  post: ForumPost;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post }) => {
  // Format date
  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: vi
  });
  
  return (
    <div className={`p-4 ${post.is_pinned ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
      <div className="flex items-start">
        {/* User avatar */}
        <div className="flex-shrink-0 mr-4">
          {post.user?.avatar_url ? (
            <img 
              src={post.user.avatar_url} 
              alt={post.user.display_name}
              className="h-10 w-10 rounded-full" 
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {post.user?.display_name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>
        
        {/* Post content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            {post.is_pinned && (
              <Pin className="h-4 w-4 mr-1.5 text-amber-600" />
            )}
            <Link 
              to={`/community/posts/${post.id}`} 
              className="text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1"
            >
              {post.title}
            </Link>
          </div>
          
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {post.content.replace(/<[^>]*>?/gm, '')}
          </p>
          
          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {post.user?.display_name}
            </span>
            <span className="mx-2">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        
        {/* Post stats */}
        <div className="flex-shrink-0 ml-4 flex flex-col space-y-1.5 items-end">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Eye className="h-4 w-4 mr-1" />
            {post.view_count || 0}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Heart className="h-4 w-4 mr-1" />
            {post.likes_count || 0}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-4 w-4 mr-1" />
            {post.replies_count || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostCard;
