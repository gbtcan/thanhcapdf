import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { CommentFormData } from '../types';

interface CommentFormProps {
  hymnId?: string;
  parentId?: string;
  initialValue?: string;
  onSubmit: (data: CommentFormData | string) => void;
  onCancel?: () => void;
  buttonText?: string;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  hymnId,
  parentId,
  initialValue = '',
  onSubmit,
  onCancel,
  buttonText = 'Bình luận',
  placeholder = 'Viết bình luận của bạn...'
}) => {
  const [content, setContent] = useState(initialValue);
  const { user, isAuthenticated } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (hymnId) {
      onSubmit({
        content: content.trim(),
        hymn_id: hymnId,
        parent_id: parentId
      });
    } else {
      onSubmit(content.trim());
    }
    
    // Reset the form if not editing an existing comment
    if (!initialValue) {
      setContent('');
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Vui lòng đăng nhập để bình luận.
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
      <div className="flex items-start">
        {/* User avatar */}
        <div className="flex-shrink-0 mr-3">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.display_name || 'User'} 
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {user?.display_name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>
        
        {/* Comment input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
            required
          />
          
          {/* Action buttons */}
          <div className="flex justify-end mt-2 space-x-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Hủy
              </button>
            )}
            
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-1.5" />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
