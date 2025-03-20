import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Comment from './Comment';
import LoadingIndicator from '../LoadingIndicator';

interface CommentType {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes: number;
  dislikes: number;
  user_reaction?: 'like' | 'dislike' | null;
  replies?: CommentType[];
}

interface CommentListProps {
  comments: CommentType[];
  postId: string;
  isLoading?: boolean;
  onAddComment: (content: string, parentId?: string | null) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  onDislike: (commentId: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReport?: (commentId: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  postId,
  isLoading = false,
  onAddComment,
  onLike,
  onDislike,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; parentId?: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group comments and their replies
  const groupedComments = comments.reduce((result: { [key: string]: CommentType[] }, comment) => {
    const parentId = comment.parent_id || 'root';
    if (!result[parentId]) {
      result[parentId] = [];
    }
    result[parentId].push(comment);
    return result;
  }, {});

  const rootComments = groupedComments['root'] || [];

  // Get replies for a comment
  const getReplies = (commentId: string) => {
    return groupedComments[commentId] || [];
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(newComment, null);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !isAuthenticated || !replyingTo || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddComment(replyContent, replyingTo.id);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, parentId?: string) => {
    setReplyingTo({ id: commentId, parentId });
    setReplyContent('');
    // Scroll to reply form
    setTimeout(() => {
      const replyForm = document.getElementById(`reply-form-${commentId}`);
      if (replyForm) {
        replyForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  if (isLoading) {
    return <LoadingIndicator size="medium" message="Loading comments..." />;
  }

  return (
    <div className="comments-section space-y-6">
      {/* Add new comment form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="mb-2">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id}>
              <Comment
                id={comment.id}
                content={comment.content}
                createdAt={comment.created_at}
                author={comment.author}
                likes={comment.likes}
                dislikes={comment.dislikes}
                userReaction={comment.user_reaction}
                onLike={onLike}
                onDislike={onDislike}
                onDelete={isAuthenticated ? onDelete : undefined}
                onEdit={isAuthenticated ? onEdit : undefined}
                onReport={isAuthenticated ? onReport : undefined}
                onReply={isAuthenticated ? handleReply : undefined}
              />

              {/* Reply form for this comment */}
              {replyingTo?.id === comment.id && (
                <div id={`reply-form-${comment.id}`} className="ml-8 mt-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <form onSubmit={handleSubmitReply} className="space-y-3">
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder={`Reply to ${comment.author.name}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      required
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        disabled={!replyContent.trim() || isSubmitting}
                      >
                        {isSubmitting ? 'Posting...' : 'Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Replies to this comment */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-8 mt-2">
                  <Comment
                    id={reply.id}
                    content={reply.content}
                    createdAt={reply.created_at}
                    author={reply.author}
                    likes={reply.likes}
                    dislikes={reply.dislikes}
                    userReaction={reply.user_reaction}
                    parentId={comment.id}
                    onLike={onLike}
                    onDislike={onDislike}
                    onDelete={isAuthenticated ? onDelete : undefined}
                    onEdit={isAuthenticated ? onEdit : undefined}
                    onReport={isAuthenticated ? onReport : undefined}
                    onReply={isAuthenticated ? handleReply : undefined}
                  />

                  {/* Reply form for this reply */}
                  {replyingTo?.id === reply.id && (
                    <div id={`reply-form-${reply.id}`} className="ml-8 mt-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      <form onSubmit={handleSubmitReply} className="space-y-3">
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder={`Reply to ${reply.author.name}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          required
                        ></textarea>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            disabled={!replyContent.trim() || isSubmitting}
                          >
                            {isSubmitting ? 'Posting...' : 'Reply'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* Login to comment message */}
      {!isAuthenticated && (
        <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-gray-600 dark:text-gray-400">
            Please <a href="/auth/login" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">sign in</a> to join the discussion.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentList;
