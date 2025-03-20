import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Heart, User, Clock, 
  Bookmark, Reply
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../utils/dateUtils';
import Avatar from '../Avatar';
import LoadingIndicator from '../LoadingIndicator';

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
  className?: string;
  showTitle?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  userId,
  limit = 5,
  className = '',
  showTitle = true
}) => {
  // Fetch recent activity
  const { data: activities, isLoading } = useQuery({
    queryKey: ['forum-activity', userId, limit],
    queryFn: async () => {
      let query = supabase
        .from('forum_activity_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2 // 2 minutes
  });
  
  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <LoadingIndicator size="medium" message="Loading activity..." />
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <Link to="/forum" className="text-sm text-indigo-600 hover:text-indigo-800">
            View all
          </Link>
        </div>
      )}
      
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex">
              {/* User avatar */}
              <Avatar
                src={activity.user_avatar_url}
                name={activity.user_name || 'User'}
                size="sm"
                className="mr-3 flex-shrink-0"
              />
              
              {/* Activity content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <Link
                    to={`/users/${activity.user_id}`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {activity.user_name}
                  </Link>{' '}
                  
                  {/* Activity description based on type */}
                  {activity.activity_type === 'post_created' && (
                    <span className="text-gray-500">
                      created a new discussion{' '}
                      <Link
                        to={`/forum/post/${activity.post_id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {activity.post_title}
                      </Link>
                    </span>
                  )}
                  
                  {activity.activity_type === 'comment_created' && (
                    <span className="text-gray-500">
                      commented on{' '}
                      <Link
                        to={`/forum/post/${activity.post_id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {activity.post_title}
                      </Link>
                    </span>
                  )}
                  
                  {activity.activity_type === 'post_liked' && (
                    <span className="text-gray-500">
                      liked{' '}
                      <Link
                        to={`/forum/post/${activity.post_id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {activity.post_title}
                      </Link>
                    </span>
                  )}
                </div>
                
                {/* Activity snippet or excerpt */}
                {activity.content_snippet && (
                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {activity.content_snippet}
                  </div>
                )}
                
                {/* Activity metadata */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatRelativeTime(new Date(activity.created_at))}</span>
                  </div>
                  
                  {activity.activity_type === 'post_created' && (
                    <>
                      <div className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>{activity.comment_count || 0} comments</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        <span>{activity.like_count || 0} likes</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
