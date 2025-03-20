import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { fetchPosts } from '../../lib/forumService';
import LoadingIndicator from '../LoadingIndicator';

interface RelatedHymnPostsProps {
  hymnId: string;
  limit?: number;
  className?: string;
}

const RelatedHymnPosts: React.FC<RelatedHymnPostsProps> = ({
  hymnId,
  limit = 5,
  className = ''
}) => {
  // Fetch related posts for this hymn
  const { data, isLoading, error } = useQuery({
    queryKey: ['related-hymn-posts', hymnId],
    queryFn: () => fetchPosts({ 
      hymnId,
      limit,
      sortBy: 'newest'
    }),
    enabled: !!hymnId
  });
  
  // If no posts found
  if (!isLoading && !error && (!data || !data.posts || data.posts.length === 0)) {
    return null;
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Discussion</h3>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <LoadingIndicator size="small" center message="Loading discussions..." />
        ) : error ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
            Failed to load discussions
          </p>
        ) : data && data.posts.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.posts.map(post => (
              <li key={post.id} className="py-3 first:pt-0 last:pb-0">
                <Link 
                  to={`/forum/post/${post.id}`} 
                  className="flex items-start group"
                >
                  <MessageSquare className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      By {post.author?.display_name || 'Unknown'} • {post.comment_count || 0} comments
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
            No discussions found for this hymn
          </p>
        )}
        
        {/* Start new discussion */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex">
          <Link 
            to={`/forum/new?hymnId=${hymnId}`}
            className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 py-2 px-4 rounded-md text-center text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
          >
            Start a new discussion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelatedHymnPosts;
