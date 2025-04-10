import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../core/contexts/AuthContext';

interface FavoriteButtonProps {
  hymnId: string;
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  hymnId,
  size = 'default',
  showLabel = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Kiểm tra xem bài hát có trong danh sách yêu thích chưa
  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!user) {
        setIsFavorite(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('hymn_id', hymnId)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking favorite status:', error);
        }
        
        setIsFavorite(!!data);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };
    
    checkIfFavorite();
  }, [user, hymnId]);
  
  // Xử lý khi click vào nút yêu thích
  const toggleFavorite = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        // Xóa khỏi danh sách yêu thích
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('hymn_id', hymnId);
          
        if (error) throw error;
        
        setIsFavorite(false);
      } else {
        // Thêm vào danh sách yêu thích
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            hymn_id: hymnId
          });
          
        if (error) throw error;
        
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated) return null;
  
  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading}
      className={isFavorite 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20'}
    >
      <Heart
        className={`h-4 w-4 ${showLabel ? 'mr-2' : ''} ${isFavorite ? 'fill-current' : ''}`}
      />
      {showLabel && (isFavorite ? 'Đã yêu thích' : 'Yêu thích')}
    </Button>
  );
};
