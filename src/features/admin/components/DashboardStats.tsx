import React from 'react';
import { Music, Users, User, BookOpen, Eye, MessageSquare } from 'lucide-react';
import { AdminDashboardStats } from '../types';

interface DashboardStatsProps {
  stats: AdminDashboardStats;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  // Define stat cards
  const statCards = [
    {
      title: 'Tổng số bài hát',
      value: stats.totalHymns,
      icon: <Music className="h-6 w-6 text-blue-500" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6 text-green-500" />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: 'Tác giả',
      value: stats.totalAuthors,
      icon: <User className="h-6 w-6 text-purple-500" />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
    {
      title: 'Chủ đề',
      value: stats.totalThemes,
      icon: <BookOpen className="h-6 w-6 text-amber-500" />,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-700 dark:text-amber-300'
    },
    {
      title: 'Lượt xem',
      value: stats.totalViews,
      icon: <Eye className="h-6 w-6 text-indigo-500" />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-700 dark:text-indigo-300'
    },
    {
      title: 'Bình luận',
      value: stats.totalComments,
      icon: <MessageSquare className="h-6 w-6 text-pink-500" />,
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-700 dark:text-pink-300'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <div 
          key={index} 
          className={`${card.bgColor} rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {card.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{card.title}</h3>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {typeof card.value === 'number' 
                  ? new Intl.NumberFormat('vi-VN').format(card.value) 
                  : card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
