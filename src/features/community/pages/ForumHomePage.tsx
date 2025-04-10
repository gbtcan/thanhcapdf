import React from 'react';
import { ForumHeader, ForumCategories, ForumPostList, RecentPosts } from '../components';
import { MessageSquare } from 'lucide-react';

const ForumHomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ForumHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Categories */}
        <div className="lg:col-span-1 space-y-6">
          <ForumCategories />
          <RecentPosts />
        </div>
        
        {/* Main content - Recent posts */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
              Tất cả bài viết
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Khám phá các bài viết mới nhất từ cộng đồng
            </p>
          </div>
          
          <ForumPostList 
            initialFilter={{ sort: 'newest' }} 
            title="Bài viết mới nhất"
            showFilters={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ForumHomePage;
