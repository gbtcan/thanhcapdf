import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { ForumPostList } from '../components';
import { LoadingIndicator } from '../../../core/components';

const ForumCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch category details
  const { data: category, isLoading, error } = useQuery({
    queryKey: ['forum-category', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingIndicator message="Đang tải danh mục..." />
      </div>
    );
  }
  
  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h2 className="text-red-800 dark:text-red-300 font-medium">Không tìm thấy danh mục</h2>
          <p className="text-red-700 dark:text-red-400 mt-1">
            Danh mục này không tồn tại hoặc đã bị xóa.
          </p>
          <Link 
            to="/community"
            className="mt-4 inline-flex items-center text-red-700 dark:text-red-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại diễn đàn
          </Link>
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
      
      {/* Category header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
        )}
      </div>
      
      {/* Posts in this category */}
      <ForumPostList 
        initialFilter={{ category_id: id, sort: 'newest' }} 
        title={`Bài viết trong ${category.name}`}
      />
    </div>
  );
};

export default ForumCategoryPage;
