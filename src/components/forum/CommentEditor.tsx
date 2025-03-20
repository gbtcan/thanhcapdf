import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RichTextEditor from './RichTextEditor';
import LoadingIndicator from '../LoadingIndicator';
import { supabase } from '../../lib/supabase';

interface CommentEditorProps {
  postId: string;
  replyToId?: string | null;
  onCommentSubmitted?: () => void;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  postId,
  replyToId = null,
  onCommentSubmitted
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          user_id: user!.id,
          post_id: postId,
          reply_to_id: replyToId
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setContent('');
      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    commentMutation.mutate({ content });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your comment..."
          minHeight="120px"
          className="rounded-md"
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={commentMutation.isPending || !content.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {commentMutation.isPending ? (
            <LoadingIndicator size="small" color="white" className="mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Post Comment
        </button>
      </div>
    </form>
  );
};

export default CommentEditor;
