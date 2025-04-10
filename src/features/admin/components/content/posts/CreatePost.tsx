import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PostForm from './PostForm';
import { Post } from '../../../types/content';
import { useNotifications } from '../../../../../contexts/NotificationContext';
import { supabaseClient } from '../../../../../lib/supabase/client';
import { useAuth } from '../../../../../contexts/AuthContext';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabaseClient
        .from('posts')
        .insert([{
          ...postData,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      addNotification({
        type: 'success',
        title: 'Đã tạo bài viết',
        message: 'Bài viết mới đã được tạo thành công'
      });
      navigate('/admin/content/posts');
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể tạo bài viết',
        message: error.message
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await createPostMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/admin/content/posts');
  };
  
  return (
    <div className="space-y-4">
      <PostForm
        isSubmitting={createPostMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreatePost;
