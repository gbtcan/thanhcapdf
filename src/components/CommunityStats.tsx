import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Music, MessageSquare, Users, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingIndicator from './LoadingIndicator';

interface StatItemProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
}

const StatItem: React.FC<StatItemProps> = ({ title, value, icon, description }) => (
  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-indigo-500 dark:bg-indigo-600 rounded-md p-3">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
          </dd>
          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

interface CommunityStatsProps {
  className?: string;
}

const CommunityStats: React.FC<CommunityStatsProps> = ({ className = '' }) => {
  // Fetch community statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      try {
        // Fetch hymn count
        const { count: hymnCount, error: hymnError } = await supabase
          .from('hymns_new')  // Use hymns_new instead of hymns
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');
        
        if (hymnError) throw hymnError;
        
        // Fetch forum post count
        const { count: postCount, error: postError } = await supabase
          .from('posts')  // Correct table name for posts
          .select('*', { count: 'exact', head: true });
        
        if (postError) throw postError;
        
        // Fetch user count from profiles table
        const { count: userCount, error: userError } = await supabase
          .from('profiles')  // Use profiles instead of users
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Fetch theme count
        const { count: themeCount, error: themeError } = await supabase
          .from('themes')  
          .select('*', { count: 'exact', head: true });
        
        if (themeError) throw themeError;
        
        return {
          hymns: hymnCount || 0,
          posts: postCount || 0,
          users: userCount || 0,
          themes: themeCount || 0
        };
      } catch (error) {
        console.error('Error fetching community stats:', error);
        return {
          hymns: 0,
          posts: 0,
          users: 0,
          themes: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  if (isLoading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingIndicator size="medium" message="Loading community stats..." />
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatItem
          title="Total Hymns"
          value={formatNumber(stats.hymns)}
          icon={<Music className="h-6 w-6 text-white" />}
          description="Available in our collection"
        />
        <StatItem
          title="Forum Posts"
          value={formatNumber(stats.posts)}
          icon={<MessageSquare className="h-6 w-6 text-white" />}
          description="Community discussions"
        />
        <StatItem
          title="Community Members"
          value={formatNumber(stats.users)}
          icon={<Users className="h-6 w-6 text-white" />}
          description="Registered users"
        />
        <StatItem
          title="Themes"
          value={formatNumber(stats.themes)}
          icon={<BookOpen className="h-6 w-6 text-white" />}
          description="Hymn classifications"
        />
      </div>
    </div>
  );
};

export default CommunityStats;
