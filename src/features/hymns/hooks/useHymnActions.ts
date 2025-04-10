import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { toggleHymnFavorite } from '../services/hymnService';
import { supabase } from '../../../lib/supabase';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useHymnViews } from './useHymnViews';

/**
 * Hook to provide actions for hymn detail page (favorite, share, delete)
 * @param hymnId ID of the hymn
 */
export const useHymnActions = (hymnId: string) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canEdit = isAdmin || isEditor;
  const { addNotification } = useNotifications();
  const [isDownloading, setIsDownloading] = useState<{ [key: string]: boolean }>({});
  const { viewed, recordView } = useHymnViews({ hymnId });
  
  // Check if user has favorited this hymn
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !hymnId) return;
      
      try {
        const { data } = await supabase
          .from('hymn_likes')
          .select('id')
          .eq('hymn_id', hymnId)
          .eq('user_id', user.id)
          .single();
        
        setIsFavorited(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkFavoriteStatus();
  }, [hymnId, user]);

  // Favorite/Unfavorite hymn mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !hymnId) throw new Error('User or hymn ID missing');
      return toggleHymnFavorite(hymnId, user.id);
    },
    onSuccess: (isFavorite) => {
      setIsFavorited(isFavorite);
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      alert('Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại sau.');
    }
  });

  // Delete hymn mutation
  const deleteHymnMutation = useMutation({
    mutationFn: async () => {
      if (!hymnId || !canEdit) return;
      const { error } = await supabase
        .from('hymns_new')
        .delete()
        .eq('id', hymnId);
      if (error) throw error;
      return hymnId;
    },
    onSuccess: () => {
      navigate('/hymns');
      queryClient.invalidateQueries({ queryKey: ['hymns'] });
    }
  });

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu bài hát vào danh sách yêu thích.');
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };

  // Handle sharing
  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Xem bài hát thánh ca',
        text: `Xem bài hát trên ThánhCaPDF`,
        url: shareUrl,
      }).catch(err => {
        console.log('Error sharing:', err);
        navigator.clipboard.writeText(shareUrl);
        alert('Đã copy đường dẫn vào clipboard');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Đã copy đường dẫn vào clipboard');
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (canEdit) {
      deleteHymnMutation.mutate();
    }
    setShowDeleteModal(false);
  };

  // Handler for downloading files
  const downloadFile = async (url: string, fileName: string, fileType: string) => {
    const fileKey = `${fileType}-${fileName}`;
    
    if (isDownloading[fileKey]) {
      return;
    }

    try {
      setIsDownloading(prev => ({ ...prev, [fileKey]: true }));
      
      // Record view if not already recorded
      if (!viewed) {
        await recordView();
      }

      // Create anchor element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification({
        type: 'success',
        title: 'Đang tải xuống',
        message: `${fileType} "${fileName}" đang được tải xuống`
      });
    } catch (error) {
      console.error(`Error downloading ${fileType}:`, error);
      addNotification({
        type: 'error',
        title: 'Lỗi tải xuống',
        message: `Không thể tải xuống ${fileType} "${fileName}"`
      });
    } finally {
      setIsDownloading(prev => ({ ...prev, [fileKey]: false }));
    }
  };

  // Share hymn
  const shareHymn = async (title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Thánh ca: ${title}`,
          text: `Chia sẻ thánh ca ${title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing hymn:', error);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        addNotification({
          type: 'success',
          title: 'Đã sao chép',
          message: 'Liên kết đã được sao chép vào clipboard'
        });
      } catch (error) {
        console.error('Error copying URL:', error);
        addNotification({
          type: 'error',
          title: 'Không thể sao chép',
          message: 'Không thể sao chép liên kết, vui lòng thử lại.'
        });
      }
    }
  };

  return {
    isFavorited,
    handleFavoriteToggle,
    handleShare,
    handleDelete,
    showDeleteModal,
    setShowDeleteModal,
    downloadFile,
    shareHymn,
    isDownloading,
    viewed
  };
};
