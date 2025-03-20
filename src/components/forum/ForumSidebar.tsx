import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare, Users, Heart, Tag, 
  Info, HelpCircle, BarChart, Settings, Loader2, 
  Bookmark, Award, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getTopUsers } from '../../lib/reputationService';
import { supabase } from '../../lib/supabase';
import { fetchCategories } from '../../lib/categoryService';
import type { ForumStatistics } from '../../types/forum';

interface ForumSidebarProps {
  statistics?: ForumStatistics;
  isLoading?: boolean;
}

const ForumSidebar: React.FC<ForumSidebarProps> = ({ 
  statistics, 
  isLoading = false 
}) => {
  const { isAuthenticated, userRole } = useAuth();
  
  // Fetch top users by reputation
  const { data: topUsers, isLoading: topUsersLoading } = useQuery({
    queryKey: ['top-users-reputation'],
    queryFn: () => getTopUsers(5),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  // Get user bookmarks count
  const { data: bookmarksCount } = useQuery({
    queryKey: ['forum-bookmarks-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: isAuthenticated && !!user
  });

  // Try to fetch categories, but gracefully handle if table doesn't exist yet
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      try {
        return await fetchCategories();
      } catch (error) {
        console.warn('Error fetching categories, table might not exist yet:', error);
        return []; // Return empty array if categories table doesn't exist yet
      }
    },
    retry: false, // Don't retry if the table doesn't exist
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });
  
  // Fetch popular tags
  const { data: popularTags } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name', { ascending: true })
          .limit(10);
          
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching tags:', err);
        return [];
      }
    }
  });
  
  return (
    <div className="space-y-6">
      {/* Statistics card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-3 text-white">
          <h3 className="font-medium flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Forum Statistics
          </h3>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
          ) : statistics ? (
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                  Total Discussions
                </span>
                <span className="font-medium text-gray-900">{statistics.totalPosts}</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                  Total Comments
                </span>
                <span className="font-medium text-gray-900">{statistics.totalComments}</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-indigo-500" />
                  Active Users
                </span>
                <span className="font-medium text-gray-900">{statistics.activeUsers}</span>
              </li>
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Statistics not available</p>
          )}
        </div>
      </div>
      
      {/* Top Contributors */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-3 text-white">
          <h3 className="font-medium flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Top Contributors
          </h3>
        </div>
        
        <div className="p-4">
          {topUsersLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
            </div>
          ) : topUsers && topUsers.length > 0 ? (
            <ol className="space-y-3">
              {topUsers.map((user, index) => (
                <li key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full 
                      ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                        index === 1 ? 'bg-gray-100 text-gray-600' : 
                        index === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                      {index + 1}
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-800">{user.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">{user.reputation}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No reputation data found</p>
          )}
        </div>
      </div>
      
      {/* Categories section - only show if categories exist */}
      {!categoriesLoading && categories && categories.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
          <ul className="space-y-1">
            {categories.map(category => (
              <li key={category.id}>
                <Link
                  to={`/forum/category/${category.slug || category.id}`}
                  className="flex items-center justify-between p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Popular tags */}
      {statistics?.popularTags && statistics.popularTags.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-600 px-4 py-3 text-white">
            <h3 className="font-medium flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Popular Tags
            </h3>
          </div>
          
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {statistics.popularTags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/forum?tag=${tag.id}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                  <span className="ml-1">({tag._count.posts})</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Quick links */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-600 px-4 py-3 text-white">
          <h3 className="font-medium flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Forum Information
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          <Link
            to="/forum/guidelines"
            className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
          >
            <HelpCircle className="h-4 w-4 mr-2 text-indigo-500" />
            <span className="text-sm">Forum Guidelines</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link
                to="/forum/my-posts"
                className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="text-sm">My Discussions</span>
              </Link>
              
              <Link
                to="/forum/bookmarks"
                className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
              >
                <Bookmark className="h-4 w-4 mr-2 text-indigo-500" />
                <span className="text-sm">Bookmarks</span>
              </Link>
            </>
          )}
          
          {isAuthenticated && userRole === 'administrator' && (
            <Link
              to="/admin/forum"
              className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
            >
              <Settings className="h-4 w-4 mr-2 text-indigo-500" />
              <span className="text-sm">Manage Forum</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* User actions */}
      {isAuthenticated && (
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Activity</h3>
          <ul className="space-y-3">
            <li>
              <Link
                to="/forum/my-posts"
                className="flex justify-between items-center text-gray-700 hover:text-indigo-600 py-1"
              >
                <span className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  My Discussions
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium rounded-full px-2 py-0.5">
                  {userStats?.postCount || 0}
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/forum/bookmarks"
                className="flex justify-between items-center text-gray-700 hover:text-indigo-600 py-1"
              >
                <span className="flex items-center">
                  <Bookmark className="h-5 w-5 mr-2" />
                  Bookmarked Discussions
                </span>
                <span className="bg-gray-100 text-gray-700 text-xs font-medium rounded-full px-2 py-0.5">
                  {bookmarksCount || 0}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ForumSidebar;
