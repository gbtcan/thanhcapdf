import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { MessageSquare, Heart, Eye, Pin, LockIcon } from 'lucide-react';
import { ForumPost } from '../../types/forum';
import Avatar from '../Avatar';

interface ForumPostCardProps {
  post: ForumPost;
  className?: string;
  isCompact?: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ 
  post, 
  className = '',
  isCompact = false
}) => {
  // Format date as "2 hours ago", etc.
  const formattedDate = formatDistance(
    new Date(post.created_at),
    new Date(),
    { addSuffix: true }
  );
  
  // Create a short preview from the content
  const createContentPreview = () => {
    if (!post.content) return '';
    
    // Strip HTML tags
    const contentText = post.content.replace(/<[^>]*>/g, '');
    
    // Return a short preview
    return contentText.length > 150
      ? contentText.substring(0, 150) + '...'
      : contentText;
  };
  
  if (isCompact) {
    return (
      <div className={`border-b border-gray-200 dark:border-gray-700 py-3 ${className}`}>
        <div className="flex justify-between">
          <div>
            <Link 
              to={`/forum/post/${post.id}`}
              className="text-base font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {post.is_pinned && <Pin className="inline h-3 w-3 mr-1 text-indigo-500" />}
              {post.is_locked && <LockIcon className="inline h-3 w-3 mr-1 text-amber-500" />}
              {post.title}
            </Link>
            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>By {post.author?.display_name || 'Unknown'}</span>
              <span className="mx-1">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{post.comment_count || 0}</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              <span>{post.like_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Card header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-4">
            <Link 
              to={`/forum/post/${post.id}`}
              className="text-xl font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {post.is_pinned && (
                <Pin className="inline h-4 w-4 mr-1 text-indigo-500" title="Pinned" />
              )}
              {post.is_locked && (
                <LockIcon className="inline h-4 w-4 mr-1 text-amber-500" title="Locked" />
              )}
              {post.title}
            </Link>
            
            {post.category && (
              <Link
                to={`/forum/category/${post.category.slug}`}
                className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
              >
                {post.category.name}
              </Link>
            )}
            
            {post.hymn && (
              <Link
                to={`/hymns/${post.hymn.id}`}
                className="inline-block mt-1 ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                Hymn: {post.hymn.title}
              </Link>
            )}
          </div>
          
          <div className="flex-shrink-0 flex flex-col items-end">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{post.view_count || 0}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.comment_count || 0}</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                <span>{post.like_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card body */}
      <div className="px-6 py-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <Avatar 
              src={post.author?.avatar_url} 
              name={post.author?.display_name || 'Unknown'} 
              size="md" 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Link 
                to={`/profile/${post.author_id}`}
                className="text-base font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {post.author?.display_name || 'Unknown User'}
              </Link>
              <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
            </div>
            
            <div className="prose dark:prose-invert prose-sm max-w-none line-clamp-3">
              <p>{createContentPreview()}</p>
            </div>
            
            <div className="mt-3">
              <Link
                to={`/forum/post/${post.id}`}
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Read more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostCard;
