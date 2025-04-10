import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { NewPostForm } from '../components';
import { useAuth } from '../../../contexts/AuthContext';

const NewPostPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mb-3">
            Đăng nhập để tạo bài viết
          </h2>
          <p className="text-amber-700 dark:text-amber-400 mb-6">
            Bạn cần đăng nhập để tạo bài viết mới.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/auth/login?redirect=/community/new"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Đăng nhập
            </Link>
            <Link
              to="/community"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Quay lại diễn đàn
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-4">
        <Link 
          to="/community" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại diễn đàn
        </Link>
      </div>
      
      {/* Post form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-indigo-600" />
            Tạo bài viết mới
          </h1>
        </div>
        
        <div className="p-6">
          <NewPostForm />
        </div>
      </div>
    </div>
  );
};

export default NewPostPage;
