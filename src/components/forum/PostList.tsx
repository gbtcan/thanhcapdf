import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, MessageSquare, Heart, Calendar,
  Music, Pin, Star, AlertTriangle 
} from 'lucide-react';
import ReputationBadge from './ReputationBadge';
import BookmarkButton from './BookmarkButton';
import { formatRelativeTime } from '../../utils/dateUtils';
import type { Post } from '../../types/forum';

interface PostListProps {
  posts: Post[];
  showHymnTitle?: boolean;
  emptyMessage?: string;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  showHymnTitle = true,
  emptyMessage = "No discussions found. Be the first to start a conversation!"
}) => {
  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Link
          key={post.id}
          to={`/forum/post/${post.id}`}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center">
                  {post.is_pinned && (
                    <Pin className="h-4 w-4 text-amber-500 mr-1.5" />
                  )}
                  
                  {post.is_featured && (
                    <Star className="h-4 w-4 text-yellow-500 mr-1.5" />
                  )}
                  
                  <h3 className="text-lg font-medium text-indigo-600">{post.title}</h3>
                </div>
                
                {/* Hymn relation if showing */}
                {showHymnTitle && post.hymn && (
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Music className="h-3.5 w-3.5 mr-1" />
                    <span>Related to: {post.hymn.title}</span>
                  </div>
                )}
              </div>
              
              <BookmarkButton postId={post.id} />
            </div>
            
            {/* Content preview */}
            <div className="mt-2">
              <p className="text-gray-600 text-sm line-clamp-2">
                {post.content.replace(/<[^>]*>?/gm, '')}
              </p>
            </div>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Footer with stats */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                {/* Author info */}
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  <span>{post.user?.name || 'Anonymous'}</span>
                  
                  {post.user?.reputation !== undefined && post.user.reputation > 0 && (
                    <div className="ml-1.5">
                      <ReputationBadge reputation={post.user.reputation} size="sm" />
                    </div>
                  )}
                </div>
                
                {/* Date */}
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  <span>{formatRelativeTime(new Date(post.created_at))}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Comment count */}
                <div className="flex items-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  <span>{post._count?.comments || 0}</span>
                </div>
                
                {/* Like count */}
                <div className="flex items-center">
                  <Heart className="h-3.5 w-3.5 mr-1" />
                  <span>{post._count?.likes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PostList;
