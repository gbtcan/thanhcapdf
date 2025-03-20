import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Trash, Flag, MoreVertical, Heart } from 'lucide-react';
import { ForumComment } from '../../types/forum';
import { useAuth } from '../../contexts/AuthContext';
import { deleteComment } from '../../lib/forumService';
import Avatar from '../Avatar';
import ConfirmDialog from '../common/ConfirmDialog';
import AlertBanner from '../AlertBanner';

interface CommentsListProps {
  comments: ForumComment[];
  postId: string;
  isLocked?: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, postId, isLocked = false }) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      setCommentToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
      setCommentToDelete(null);
    }
  });
  
  // Handle delete comment
  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setOpenActionMenu(null);
  };
  
  // Confirm delete comment
  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
    }
  };
  
  // Toggle action menu
  const toggleActionMenu = (commentId: string) => {
    setOpenActionMenu(openActionMenu === commentId ? null : commentId);
  };
  
  // Format date
  const formatCommentDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Check if user can delete a comment
  const canDeleteComment = (comment: ForumComment) => {
    if (!isAuthenticated || !user) return false;
    
    // User can delete their own comments
    if (comment.author_id === user.id) return true;
    
    // Admins and moderators can delete any comment
    return user.roles?.name === 'administrator' || user.roles?.name === 'moderator';
  };
  
  // If no comments
  if (!comments.length) {
    return <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet.</p>;
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-4"
        />
      )}
      
      {comments.map((comment) => {
        const isAuthor = isAuthenticated && user?.id === comment.author_id;
        const userCanDelete = canDeleteComment(comment);
        
        return (
          <div key={comment.id} className="flex space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar
                src={comment.profiles?.avatar_url}
                name={comment.profiles?.display_name || 'Unknown'}
                size="md"
              />
            </div>
            
            {/* Comment content */}
            <div className="flex-1 bg-gray-50 dark:bg-gray-750 rounded-lg px-4 py-3 relative">
              {/* Comment header */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Link
                    to={`/profile/${comment.author_id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {comment.profiles?.display_name || 'Unknown User'}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {formatCommentDate(comment.created_at)}
                  </span>
                </div>
                
                {/* Actions menu */}
                {!isLocked && (
                  <div className="relative">
                    <button
                      onClick={() => toggleActionMenu(comment.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {openActionMenu === comment.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 ring-1 ring-black ring-opacity-5">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <Heart className="h-4 w-4 mr-2 text-gray-500" />
                          Like
                        </button>
                        
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <Flag className="h-4 w-4 mr-2 text-gray-500" />
                          Report
                        </button>
                        
                        {userCanDelete && (
                          <button
                            onClick={() => handleDeleteClick(comment.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Comment text */}
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: comment.content }} />
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Delete confirmation dialog */}
      {commentToDelete && (
        <ConfirmDialog
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDeleteComment}
          onCancel={() => setCommentToDelete(null)}
          isLoading={deleteCommentMutation.isPending}
          isDestructive
        />
      )}
    </div>
  );
};

export default CommentsList;
