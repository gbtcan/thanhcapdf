import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users, Heart, Calendar } from 'lucide-react';
import { fetchForumStatistics } from '../../lib/forumService';
import LoadingIndicator from '../LoadingIndicator';

const ForumStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['forum-statistics-admin'],
    queryFn: fetchForumStatistics,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <LoadingIndicator size="medium" message="Loading statistics..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Unable to load forum statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Discussions',
      value: stats.totalPosts,
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Comments',
      value: stats.totalComments,
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <Users className="h-6 w-6 text-purple-500" />,
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes || 0,
      icon: <Heart className="h-6 w-6 text-red-500" />,
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg shadow-sm p-6 flex items-center`}
        >
          <div className="mr-4">{stat.icon}</div>
          <div>
            <p className="text-sm text-gray-600">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForumStats;
