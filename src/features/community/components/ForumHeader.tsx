import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageSquare, Plus } from 'lucide-react';
import { getForumStats } from '../api/communityApi';
import { useAuth } from '../../../contexts/AuthContext';

const ForumHeader: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['forum-stats'],
    queryFn: getForumStats,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2" />
            Cộng đồng ThánhCaPDF
          </h1>
          <p className="text-indigo-100 max-w-2xl">
            Trao đổi, thảo luận, và chia sẻ kinh nghiệm về bài hát, thánh ca với cộng đồng.
            Đặt câu hỏi, giúp đỡ người khác hoặc chia sẻ kiến thức của bạn!
          </p>
          
          {stats && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1.5 text-indigo-200" />
                <span className="text-sm">{stats.total_posts} bài viết</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1.5 text-indigo-200" />
                <span className="text-sm">{stats.active_users_today} người dùng hoạt động hôm nay</span>
              </div>
            </div>
          )}
        </div>
        
        {isAuthenticated && (
          <div className="mt-4 md:mt-0">
            <Link
              to="/community/new"
              className="inline-flex items-center px-4 py-2 bg-white text-indigo-700 font-medium rounded-md shadow hover:bg-indigo-50 transition"
            >
              <Plus className="h-5 w-5 mr-1.5" />
              Tạo bài viết
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumHeader;
