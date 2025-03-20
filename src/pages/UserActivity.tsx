import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MessageSquare, Heart, Award, Calendar, User as UserIcon } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import PostList from '../components/forum/PostList';
import LoadingIndicator from '../components/LoadingIndicator';
import AlertBanner from '../components/AlertBanner';
import { fetchPosts } from '../lib/forumService';
import { getUserReputationHistory } from '../lib/reputationService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/dateUtils';

interface UserDetails {
  id: string;
  name: string;
  reputation: number;
  avatar_url?: string;
  created_at: string;
}

const UserActivity: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;
  
  // Fetch user details
  const {
    data: userDetails,
    isLoading: userLoading,
    error: userError
  } = useQuery<UserDetails>({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, reputation, avatar_url, created_at')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
  
  // Fetch user's posts
  const {
    data: userPosts,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => fetchPosts({
      userId: userId!,
      limit: 5,
      sortBy: 'latest'
    }),
    enabled: !!userId
  });
  
  // Fetch reputation history
  const {
    data: reputationHistory,
    isLoading: reputationLoading,
    error: reputationError
  } = useQuery({
    queryKey: ['user-reputation', userId],
    queryFn: () => getUserReputationHistory(userId!),
    enabled: !!userId
  });
  
  // Calculate stats
  const totalPosts = userPosts?.totalCount || 0;
  const totalReputation = userDetails?.reputation || 0;
  const joinedDate = userDetails ? formatDate(new Date(userDetails.created_at)) : '';
  
  const isLoading = userLoading || postsLoading || reputationLoading;
  const hasErrors = !!userError || !!postsError || !!reputationError;
  
  if (userError) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-8">
          <AlertBanner
            type="error"
            title="User not found"
            message="The user profile you're looking for doesn't exist or you don't have permission to view it."
          />
          <div className="mt-4">
            <button 
              onClick={() => navigate(-1)} 
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Go back
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        {/* Back button */}
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go back
          </button>
        </div>
        
        {/* User profile header */}
        {isLoading ? (
          <LoadingIndicator size="large" message="Loading profile..." />
        ) : userDetails ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-indigo-700 h-24"></div>
              <div className="px-4 py-5 sm:px-6 -mt-12 flex flex-col sm:flex-row sm:items-end">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg flex items-center justify-center text-indigo-800 text-4xl font-bold">
                  {userDetails.avatar_url ? (
                    <img 
                      src={userDetails.avatar_url} 
                      alt={userDetails.name}
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    userDetails.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{userDetails.name}</h1>
                  <div className="flex items-center mt-1 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {joinedDate}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center bg-indigo-50 px-4 py-2 rounded-full">
                  <Award className="h-5 w-5 text-indigo-500 mr-1" />
                  <span className="font-medium text-indigo-800">
                    {totalReputation} reputation
                  </span>
                </div>
              </div>
            </div>
            
            {/* User activity sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Recent Discussions
                  </h2>
                  
                  <PostList
                    posts={userPosts?.posts || []}
                    isLoading={postsLoading}
                    error={postsError instanceof Error ? postsError : null}
                    showHymnTitle={true}
                    emptyMessage={isOwnProfile 
                      ? "You haven't started any discussions yet." 
                      : "This user hasn't started any discussions yet."}
                  />
                  
                  {totalPosts > 5 && (
                    <div className="mt-4">
                      <Link
                        to={isOwnProfile ? "/forum/my-posts" : `/forum?userId=${userId}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View all discussions
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Sidebar - 1/3 width */}
              <div className="space-y-6">
                {/* Reputation log */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-indigo-100 px-4 py-3 border-b border-indigo-200">
                    <h3 className="font-medium text-indigo-800 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Reputation Activity
                    </h3>
                  </div>
                  
                  {reputationLoading ? (
                    <div className="p-4 flex justify-center">
                      <LoadingIndicator size="small" />
                    </div>
                  ) : reputationHistory && reputationHistory.length > 0 ? (
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {reputationHistory.map(event => (
                        <li key={event.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${
                              event.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {event.points > 0 ? '+' : ''}{event.points}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(new Date(event.created_at), true)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.reason}
                          </p>
                          {event.post && (
                            <Link 
                              to={`/forum/post/${event.post.id}`}
                              className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {event.post.title}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No reputation activity yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default UserActivity;
