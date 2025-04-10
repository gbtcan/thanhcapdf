import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { createForumPost, getForumCategories } from '../api/communityApi';
import { useQuery } from '@tanstack/react-query';
import { Loader, Send } from 'lucide-react';

interface NewPostFormProps {
  initialHymnId?: string;
  onSuccess?: () => void;
}

const NewPostForm: React.FC<NewPostFormProps> = ({ initialHymnId, onSuccess }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [hymnId, setHymnId] = useState(initialHymnId || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: getForumCategories
  });
  
  // Set default category
  useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);
  
  // Create post mutation
  const mutation = useMutation({
    mutationFn: () => {
      if (!user?.id) {
        throw new Error('Bạn phải đăng nhập để đăng bài viết');
      }
      
      if (!title.trim()) {
        throw new Error('Vui lòng nhập tiêu đề');
      }
      
      if (!content.trim()) {
        throw new Error('Vui lòng nhập nội dung');
      }
      
      if (!categoryId) {
        throw new Error('Vui lòng chọn danh mục');
      }
      
      return createForumPost(
        title,
        content,
        user.id,
        categoryId,
        hymnId || undefined,
        tags.length > 0 ? tags : undefined
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      addNotification({
        type: 'success',
        title: 'Đăng bài thành công',
        message: 'Bài viết của bạn đã được đăng thành công',
        duration: 3000
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/community/posts/${data.id}`);
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Đăng bài thất bại',
        message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
        duration: 5000
      });
    }
  });
  
  // Add tag handler
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Remove tag handler
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label 
          htmlFor="title" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Tiêu đề *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Nhập tiêu đề bài viết..."
          required
        />
      </div>
      
      {/* Category */}
      <div>
        <label 
          htmlFor="category" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Danh mục *
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          required
          disabled={loadingCategories}
        >
          {loadingCategories && <option value="">Đang tải...</option>}
          {categories?.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      
      {/* Content */}
      <div>
        <label 
          htmlFor="content" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Nội dung *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Nhập nội dung bài viết..."
          required
        />
      </div>
      
      {/* Tags */}
      <div>
        <label 
          htmlFor="tags" 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Thẻ
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Thêm thẻ..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
          >
            Thêm
          </button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 h-4 w-4 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 inline-flex items-center justify-center"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50"
        >
          {mutation.isPending ? (
            <>
              <Loader className="h-5 w-5 mr-2 animate-spin" />
              Đang đăng...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Đăng bài viết
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default NewPostForm;
