import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPosts, 
  fetchPostById,
  updatePost,
  deletePost,
  fetchHymns,
  fetchHymnById,
  updateHymn,
  deleteHymn,
  fetchComments,
  updateComment,
  deleteComment,
  fetchContentStatistics
} from '../api/contentApi';
import { 
  Post, 
  Hymn, 
  Comment,
  ContentFilterParams,
  CommentFilterParams,
  ContentStatistics
} from '../types/content';
import { useNotifications } from "../../../core/contexts/NotificationContext";

/**
 * Hook for managing posts
 */
export function usePosts(params: ContentFilterParams = {}) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Fetch posts
  const {
    data: postsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'posts', params],
    queryFn: () => fetchPosts(params)
  });
  
  // Update post
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Post> }) => 
      updatePost(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'post', variables.id] });
      addNotification({
        type: 'success',
        title: 'Bài viết đã được cập nhật',
        message: 'Thông tin bài viết đã được lưu thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể cập nhật bài viết',
        message: error.message
      });
    }
  });
  
  // Delete post
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa bài viết',
        message: 'Bài viết đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa bài viết',
        message: error.message
      });
    }
  });
  
  return {
    posts: postsData?.data || [],
    totalPosts: postsData?.total || 0,
    isLoading,
    error,
    refetch,
    
    // Actions
    updatePost: updateMutation.mutateAsync,
    deletePost: deleteMutation.mutateAsync,
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for managing a single post
 */
export function usePost(id: number | undefined) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Fetch post
  const {
    data: post,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'post', id],
    queryFn: () => fetchPostById(id!),
    enabled: !!id
  });
  
  // Update post
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Post>) => updatePost(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'post', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      addNotification({
        type: 'success',
        title: 'Bài viết đã được cập nhật',
        message: 'Thông tin bài viết đã được lưu thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể cập nhật bài viết',
        message: error.message
      });
    }
  });
  
  // Delete post
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa bài viết',
        message: 'Bài viết đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa bài viết',
        message: error.message
      });
    }
  });
  
  return {
    post,
    isLoading,
    error,
    refetch,
    
    // Actions
    updatePost: updateMutation.mutateAsync,
    deletePost: deleteMutation.mutateAsync,
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for managing hymns
 */
export function useHymns(params: ContentFilterParams = {}) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Fetch hymns
  const {
    data: hymnsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'hymns', params],
    queryFn: () => fetchHymns(params)
  });
  
  // Update hymn
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Hymn> }) => 
      updateHymn(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', variables.id] });
      addNotification({
        type: 'success',
        title: 'Thánh ca đã được cập nhật',
        message: 'Thông tin thánh ca đã được lưu thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể cập nhật thánh ca',
        message: error.message
      });
    }
  });
  
  // Delete hymn
  const deleteMutation = useMutation({
    mutationFn: deleteHymn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa thánh ca',
        message: 'Thánh ca đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa thánh ca',
        message: error.message
      });
    }
  });
  
  return {
    hymns: hymnsData?.data || [],
    totalHymns: hymnsData?.total || 0,
    isLoading,
    error,
    refetch,
    
    // Actions
    updateHymn: updateMutation.mutateAsync,
    deleteHymn: deleteMutation.mutateAsync,
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for managing a single hymn
 */
export function useHymn(id: number | undefined) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Fetch hymn
  const {
    data: hymn,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'hymn', id],
    queryFn: () => fetchHymnById(id!),
    enabled: !!id
  });
  
  // Update hymn
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Hymn>) => updateHymn(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      addNotification({
        type: 'success',
        title: 'Thánh ca đã được cập nhật',
        message: 'Thông tin thánh ca đã được lưu thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể cập nhật thánh ca',
        message: error.message
      });
    }
  });
  
  // Delete hymn
  const deleteMutation = useMutation({
    mutationFn: () => deleteHymn(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa thánh ca',
        message: 'Thánh ca đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa thánh ca',
        message: error.message
      });
    }
  });
  
  return {
    hymn,
    isLoading,
    error,
    refetch,
    
    // Actions
    updateHymn: updateMutation.mutateAsync,
    deleteHymn: deleteMutation.mutateAsync,
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for managing comments
 */
export function useComments(params: CommentFilterParams = {}) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Fetch comments
  const {
    data: commentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'comments', params],
    queryFn: () => fetchComments(params)
  });
  
  // Update comment (e.g., approve/reject)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Comment> }) => 
      updateComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      addNotification({
        type: 'success',
        title: 'Bình luận đã được cập nhật',
        message: 'Thông tin bình luận đã được lưu thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể cập nhật bình luận',
        message: error.message
      });
    }
  });
  
  // Delete comment
  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa bình luận',
        message: 'Bình luận đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa bình luận',
        message: error.message
      });
    }
  });
  
  return {
    comments: commentsData?.data || [],
    totalComments: commentsData?.total || 0,
    isLoading,
    error,
    refetch,
    
    // Actions
    updateComment: updateMutation.mutateAsync,
    deleteComment: deleteMutation.mutateAsync,
    approveComment: (id: number) => 
      updateMutation.mutateAsync({ id, data: { status: 'approved' } }),
    rejectComment: (id: number) => 
      updateMutation.mutateAsync({ id, data: { status: 'rejected' } }),
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for content statistics
 */
export function useContentStatistics() {
  const {
    data: statistics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'contentStatistics'],
    queryFn: fetchContentStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
  
  return {
    statistics: statistics || {
      totalPosts: 0,
      totalHymns: 0,
      totalComments: 0,
      totalViews: 0,
      totalLikes: 0,
      recentPosts: 0,
      recentHymns: 0,
      recentComments: 0
    },
    isLoading,
    error,
    refetch
  };
}
