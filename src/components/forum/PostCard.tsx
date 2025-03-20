import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Calendar, Tag, Music } from 'lucide-react';
import { ForumPost } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';

interface PostCardProps {
  post: ForumPost;
  showExcerpt?: boolean;
  showAuthor?: boolean;
}

/**
 * Card component for displaying forum posts
 */
const PostCard: React.FC<PostCardProps> = ({ 
  post,
  showExcerpt = false,
  showAuthor = true
}) => {
  // Generate excerpt from post content
  const getExcerpt = (content: string): string => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Limit to 150 characters
    if (plainText.length > 150) {
      return plainText.substring(0, 150).trim() + '...';
    }
    
    return plainText;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/forum/post/${post.id}`} className="block p-5">
        {/* Post title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
          {post.title}
        </h3>
        
        {/* Post metadata */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          {/* Date */}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatRelativeTime(post.created_at)}</span>
          </div>
          
          {/* Comments count */}
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>
              {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
            </span>
          </div>
          
          {/* Likes count */}
          {post.like_count !== undefined && (
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
            </div>
          )}
          
          {/* Related hymn */}
          {post.hymns && (
            <div className="flex items-center">
              <Music className="h-4 w-4 mr-1" />
              <span className="text-indigo-600 dark:text-indigo-400">{post.hymns.title}</span>
            </div>
          )}
          
          {/* Post tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              <div className="flex flex-wrap gap-1">
                {post.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Author (optional) */}
        {showAuthor && post.users && (
          <div className="mt-3 flex items-center">
            <div className="flex-shrink-0">
              {post.users.avatar_url ? (
                <img 
                  src={post.users.avatar_url}
                  alt={post.users.display_name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-xs font-medium text-indigo-800 dark:text-indigo-200">
                    {(post.users.display_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {post.users.display_name || 'Anonymous'}
            </div>
          </div>
        )}
        
        {/* Post excerpt (optional) */}
        {showExcerpt && post.content && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {getExcerpt(post.content)}
          </div>
        )}
      </Link>
    </div>
  );
};

export default PostCard;
