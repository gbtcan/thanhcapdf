import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '../../lib/supabase';
import LoadingIndicator from '../LoadingIndicator';
import AlertBanner from '../AlertBanner';

interface AnalyticsData {
  date: string;
  posts: number;
  comments: number;
  likes: number;
}

const ForumAnalytics: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-analytics'],
    queryFn: async (): Promise<AnalyticsData[]> => {
      // Get posts by date (last 7 days)
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 7);
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('created_at')
        .gte('created_at', daysAgo.toISOString());
      
      if (postsError) throw postsError;
      
      // Get comments by date
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('created_at')
        .gte('created_at', daysAgo.toISOString());
      
      if (commentsError) throw commentsError;
      
      // Get likes by date
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('created_at')
        .gte('created_at', daysAgo.toISOString());
      
      if (likesError) throw likesError;
      
      // Format the data by day
      const result: Record<string, AnalyticsData> = {};
      
      // Initialize the past 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        result[dateStr] = { date: dateStr, posts: 0, comments: 0, likes: 0 };
      }
      
      // Count posts by date
      postsData.forEach((post) => {
        const dateStr = post.created_at.split('T')[0];
        if (result[dateStr]) {
          result[dateStr].posts++;
        }
      });
      
      // Count comments by date
      commentsData.forEach((comment) => {
        const dateStr = comment.created_at.split('T')[0];
        if (result[dateStr]) {
          result[dateStr].comments++;
        }
      });
      
      // Count likes by date
      likesData.forEach((like) => {
        const dateStr = like.created_at.split('T')[0];
        if (result[dateStr]) {
          result[dateStr].likes++;
        }
      });
      
      // Convert to array and sort by date
      return Object.values(result).sort((a, b) => 
        a.date.localeCompare(b.date)
      );
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
  
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <LoadingIndicator size="large" message="Loading analytics..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <AlertBanner
        type="error"
        title="Error loading analytics"
        message={(error as Error).message}
      />
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Forum Activity (Last 7 Days)</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="posts" name="New Posts" fill="#8884d8" />
            <Bar dataKey="comments" name="New Comments" fill="#82ca9d" />
            <Bar dataKey="likes" name="New Likes" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForumAnalytics;
