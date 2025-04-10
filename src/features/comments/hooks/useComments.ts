import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { getComments, addComment, updateComment, deleteComment, toggleLikeComment } from '../api/commentApi';
import { CommentFilter, CommentFormData } from '../types';

/**
 * Hook to manage comments for a hymn or user
 */
export function useComments(filter: CommentFilter) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // Fetch comments
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments', filter, page],
    queryFn: () => getComments(filter, page, pageSize),
    keepPreviousData: true,
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentData: CommentFormData) => {
      if (!user?.id) {
        throw new Error('Must be logged in to comment');
      }
      return addComment(commentData, user.id);
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ['comments', filter] });
      addNotification({
        type: 'success',
        title: 'Bình luận đã được thêm',
        message: 'Bình luận của bạn đã được đăng thành công.',
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể thêm bình luận: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        duration: 5000
      });
    }
  });
  
  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({id, content}: {id: string, content: string}) => {
      if (!user?.id) {
        throw new Error('Must be logged in to update comments');
      }
      return updateComment(id, content, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', filter] });
      addNotification({
        type: 'success',
        title: 'Bình luận đã cập nhật',
        message: 'Bình luận của bạn đã được cập nhật thành công.',
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể cập nhật bình luận: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        duration: 5000
      });
    }
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      if (!user?.id) {
        throw new Error('Must be logged in to delete comments');
      }
      return deleteComment(commentId, user.id, user.isAdmin || false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', filter] });
      addNotification({
        type: 'success',
        title: 'Bình luận đã xóa',
        message: 'Bình luận đã được xóa thành công.',
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể xóa bình luận: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        duration: 5000
      });
    }
  });
  
  // Like comment mutation
  const toggleLikeMutation = useMutation({
    mutationFn: (commentId: string) => {
      if (!user?.id) {
        throw new Error('Must be logged in to like comments');
      }
      return toggleLikeComment(commentId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', filter] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
    }
  });
  
  // Pagination handlers
  const nextPage = useCallback(() => {
    if (data && data.comments.length === pageSize) {
      setPage(p => p + 1);
    }
  }, [data, pageSize]);
  
  const previousPage = useCallback(() => {
    setPage(p => Math.max(0, p - 1));
  }, []);
  
  // Comment action handlers
  const handleAddComment = useCallback((commentData: CommentFormData) => {
    addCommentMutation.mutate(commentData);
  }, [addCommentMutation]);
  
  const handleUpdateComment = useCallback((id: string, content: string) => {
    updateCommentMutation.mutate({id, content});
  }, [updateCommentMutation]);
  
  const handleDeleteComment = useCallback((id: string) => {
    deleteCommentMutation.mutate(id);
  }, [deleteCommentMutation]);
  
  const handleLikeComment = useCallback((id: string) => {
    toggleLikeMutation.mutate(id);
  }, [toggleLikeMutation]);
  
  return {
    comments: data?.comments || [],
    totalComments: data?.count || 0,
    isLoading,
    error,
    page,
    nextPage,
    previousPage,
    actions: {
      addComment: handleAddComment,
      updateComment: handleUpdateComment,
      deleteComment: handleDeleteComment,
      likeComment: handleLikeComment
    },
    mutations: {
      isAddingComment: addCommentMutation.isPending,
      isUpdatingComment: updateCommentMutation.isPending,
      isDeletingComment: deleteCommentMutation.isPending
    },
    refetch
  };
}
