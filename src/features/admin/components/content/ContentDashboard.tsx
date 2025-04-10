import React from 'react';
import { useContentStatistics } from '../../hooks/useContentManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../core/components/ui/card';
import { FileText, Music, MessageSquare, Eye, Heart, Activity } from 'lucide-react';
import { Skeleton } from '../../../../core/components/ui/skeleton';

const ContentDashboard: React.FC = () => {
  const { statistics, isLoading } = useContentStatistics();
  
  const statCards = [
    {
      title: 'Tổng bài viết',
      value: statistics.totalPosts,
      description: `${statistics.recentPosts} bài viết mới trong 30 ngày qua`,
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      trend: statistics.recentPosts > 0 ? 'up' : 'down',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/admin/content/posts'
    },
    {
      title: 'Tổng thánh ca',
      value: statistics.totalHymns,
      description: `${statistics.recentHymns} thánh ca mới trong 30 ngày qua`,
      icon: <Music className="h-5 w-5 text-green-500" />,
      trend: statistics.recentHymns > 0 ? 'up' : 'down',
      color: 'bg-green-50 dark:bg-green-900/20',
      link: '/admin/content/hymns'
    },
    {
      title: 'Tổng bình luận',
      value: statistics.totalComments,
      description: `${statistics.recentComments} bình luận mới trong 30 ngày qua`,
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      trend: statistics.recentComments > 0 ? 'up' : 'down',
      color: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/admin/content/comments'
    },
    {
      title: 'Lượt xem',
      value: statistics.totalViews,
      description: 'Tổng số lượt xem thánh ca',
      icon: <Eye className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      title: 'Lượt thích',
      value: statistics.totalLikes,
      description: 'Tổng số lượt thích nội dung',
      icon: <Heart className="h-5 w-5 text-red-500" />,
      color: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Hoạt động',
      value: statistics.recentPosts + statistics.recentHymns + statistics.recentComments,
      description: 'Hoạt động mới trong 30 ngày qua',
      icon: <Activity className="h-5 w-5 text-indigo-500" />,
      color: 'bg-indigo-50 dark:bg-indigo-900/20'
    }
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Tổng quan nội dung</h2>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className={`p-4 ${card.color}`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-4 w-full mt-2" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
                  <CardDescription className="mt-2 line-clamp-1">
                    {card.description}
                  </CardDescription>
                  {card.link && (
                    <a 
                      href={card.link} 
                      className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 mt-2 inline-block"
                    >
                      Xem chi tiết →
                    </a>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContentDashboard;
