import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { addComment } from '../../lib/forumService';
import { useAuth } from '../../contexts/AuthContext';
import AlertBanner from '../AlertBanner';
import Avatar from '../Avatar';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ 
  postId,
  parentId,
  onSuccess
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: () => addComment({
      post_id: postId,
      content,
      parent_id: parentId
    }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    addCommentMutation.mutate();
  };
  
  return (
    <div>
      {error && (
        <AlertBanner
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-4"
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <Avatar
              src={user?.avatar_url}
              name={user?.display_name || 'You'}
              size="md"
            />
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your comment..."
              rows={3}
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={addCommentMutation.isPending || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 dark:focus:ring-offset-gray-800"
          >
            {addCommentMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
