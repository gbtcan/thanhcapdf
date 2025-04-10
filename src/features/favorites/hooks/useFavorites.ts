import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabaseClient } from '../../../lib/supabase/client';
import { useNotifications } from '../../../contexts/NotificationContext';

/**
 * Hook to manage favorites functionality
 */
export function useFavorites(itemId: string, itemType: 'hymn' | 'post' | 'comment') {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine which table to use based on item type
  const getTableName = (): string => {
    switch (itemType) {
      case 'hymn':
        return 'hymn_likes';
      case 'post':
        return 'post_likes';
      case 'comment':
        return 'comment_likes';
      default:
        return 'hymn_likes';
    }
  };
  
  // Determine which column to use based on item type
  const getItemColumn = (): string => {
    switch (itemType) {
      case 'hymn':
        return 'hymn_id';
      case 'post':
        return 'post_id';
      case 'comment':
        return 'comment_id';
      default:
        return 'hymn_id';
    }
  };
  
  // Check if user has favorited the item
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !user?.id || !itemId) return;
      
      try {
        const { data, error } = await supabaseClient
          .from(getTableName())
          .select('id')
          .eq(getItemColumn(), itemId)
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error(`Error checking favorite status:`, error);
          return;
        }
        
        setIsFavorite(!!data);
      } catch (error) {
        console.error(`Error checking favorite status:`, error);
      }
    };
    
    checkFavoriteStatus();
  }, [user?.id, itemId, itemType, isAuthenticated]);
  
  // Add item to favorites
  const addFavorite = async () => {
    if (!isAuthenticated || !user?.id || !itemId) {
      addNotification({
        type: 'warning',
        title: 'Cần đăng nhập',
        message: 'Vui lòng đăng nhập để sử dụng tính năng này.'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Create the favorite record
      const { error } = await supabaseClient
        .from(getTableName())
        .insert({
          [getItemColumn()]: itemId,
          user_id: user.id,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setIsFavorite(true);
      addNotification({
        type: 'success',
        title: 'Đã thêm vào yêu thích',
        message: 'Mục này đã được thêm vào danh sách yêu thích của bạn.'
      });
    } catch (error) {
      console.error(`Error adding favorite:`, error);
      addNotification({
        type: 'error',
        title: 'Không thể thêm vào yêu thích',
        message: 'Đã xảy ra lỗi, vui lòng thử lại sau.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove item from favorites
  const removeFavorite = async () => {
    if (!isAuthenticated || !user?.id || !itemId) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Delete the favorite record
      const { error } = await supabaseClient
        .from(getTableName())
        .delete()
        .eq(getItemColumn(), itemId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setIsFavorite(false);
      addNotification({
        type: 'info',
        title: 'Đã xóa khỏi yêu thích',
        message: 'Mục này đã được xóa khỏi danh sách yêu thích của bạn.'
      });
    } catch (error) {
      console.error(`Error removing favorite:`, error);
      addNotification({
        type: 'error',
        title: 'Không thể xóa khỏi yêu thích',
        message: 'Đã xảy ra lỗi, vui lòng thử lại sau.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isFavorite,
    addFavorite,
    removeFavorite,
    isLoading
  };
}
