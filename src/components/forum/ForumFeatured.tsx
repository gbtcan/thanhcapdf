import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, User } from 'lucide-react';
import { fetchFeaturedPosts, fetchPosts } from '../../lib/forumService';
import { formatRelativeTime } from '../../utils/dateUtils';
import LoadingIndicator from '../LoadingIndicator';
import { clientConfig } from '../../config/clientConfig';

const ForumFeatured: React.FC = () => {
  // Use appropriate query based on client mode
  const { data: featuredPosts, isLoading, error } = useQuery({
    queryKey: ['forum-featured'],
    queryFn: () => {
      if (clientConfig.clientSideOnly) {
        // In client-side mode, just fetch recent posts instead of featured
        return fetchPosts({ limit: 3 });
      } else {
        return fetchFeaturedPosts(3);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    select: data => {
      // Handle both data formats - array or { posts, totalCount }
      return Array.isArray(data) ? data : data?.posts || [];
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator size="medium" message="Loading featured discussions..." />
      </div>
    );
  }
  
  if (error || !featuredPosts || featuredPosts.length === 0) {
    return null; // Silently hide the component on error
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Featured Discussions</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {featuredPosts.map((post) => (
          <Link
            key={post.id}
            to={`/forum/post/${post.id}`}
            className="block bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-indigo-600 mb-2">
              {post.title}
            </h3>
            
            <p className="text-gray-600 line-clamp-2 mb-3">
              {post.content?.substring(0, 150)}
              {post.content && post.content.length > 150 ? '...' : ''}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {post.user && (
                <div className="flex items-center text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.user.name}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatRelativeTime(new Date(post.created_at))}</span>
              </div>
              
              <div className="flex items-center text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{post.comments?.[0]?.count || 0} comments</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="text-center">
        <Link
          to="/forum"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View All Discussions
        </Link>
      </div>
    </div>
  );
};

export default ForumFeatured;
