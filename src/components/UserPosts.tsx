import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Calendar, ThumbsUp, Link as LinkIcon, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ForumPost } from '../types';
import LoadingIndicator from './LoadingIndicator';
import AlertBanner from './AlertBanner';
import { formatRelativeTime } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface UserPostsProps {
  userId: string;
}

const UserPosts: React.FC<UserPostsProps> = ({ userId }) => {
  const { user } = useAuth();
  const isOwnProfile = user?.id === userId;

  // Fetch user posts
  const {
    data: posts,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id, 
          title,
          created_at,
          comment_count,
          like_count,
          hymn_id,
          hymns (id, title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as ForumPost[];
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator size="medium" message="Loading posts..." />
      </div>
    );
  }

  if (error) {
    return (
      <AlertBanner
        type="error"
        title="Error loading posts"
        message="There was a problem loading the forum posts. Please try again later."
      />
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <MessageSquare className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No forum posts yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {isOwnProfile 
            ? "You haven't created any forum posts yet. Start a new discussion to engage with the community."
            : "This user hasn't created any forum posts yet."}
        </p>
        {isOwnProfile && (
          <Link
            to="/forum/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Create New Post
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Forum Posts {posts && <span className="text-gray-500 dark:text-gray-400 font-normal">({posts.length})</span>}
        </h3>
      </div>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post.id}
            className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
          >
            <Link 
              to={`/forum/post/${post.id}`} 
              className="block"
            >
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                {post.title}
              </h4>
              
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatRelativeTime(post.created_at)}</span>
                </div>
                
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
                </div>
                
                {post.like_count !== undefined && (
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>
                  </div>
                )}
                
                {post.hymn_id && post.hymns && (
                  <div className="flex items-center">
                    <span>Related to: </span>
                    <Link 
                      to={`/hymns/${post.hymn_id}`} 
                      className="ml-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.hymns.title}
                    </Link>
                  </div>
                )}
              </div>
            </Link>
            
            {/* Actions */}
            <div className="mt-4 flex justify-end space-x-2">
              <Link
                to={`/forum/post/${post.id}`}
                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <LinkIcon className="h-3 w-3 mr-1" />
                View
              </Link>
              
              {isOwnProfile && (
                <Link
                  to={`/forum/edit/${post.id}`}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPosts;
