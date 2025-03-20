import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AlertBanner from './AlertBanner';

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
  placeholder?: string;
  buttonText?: string;
  redirectPath?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  onCommentAdded,
  placeholder = 'Write your comment here...',
  buttonText = 'Post Comment',
  redirectPath
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentContent: string) => {
      if (!user) throw new Error('You must be logged in to comment');
      if (!commentContent.trim()) throw new Error('Comment cannot be empty');

      const { data, error } = await supabase
        .from('forum_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: commentContent.trim()
          }
        ])
        .select();

      if (error) throw error;
      
      // Also update the comment_count on the post
      await supabase.rpc('increment_comment_count', { post_id_param: postId });
      
      return data;
    },
    onSuccess: () => {
      setComment('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    addCommentMutation.mutate(comment);
  };

  const loginRedirectUrl = redirectPath || `/forum/post/${postId}`;

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-4 rounded-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You need to sign in to post a comment.
        </p>
        <Link 
          to={`/auth/login?redirect=${encodeURIComponent(loginRedirectUrl)}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Sign In to Comment
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <AlertBanner 
          type="error"
          message={error}
          className="mb-4"
          dismissible
          onDismiss={() => setError(null)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            rows={4}
            name="comment"
            id="comment"
            placeholder={placeholder}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={addCommentMutation.isPending}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={addCommentMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
          >
            {addCommentMutation.isPending ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
