import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing user favorites
 */
export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { 
    data: favorites = [], 
    isLoading: favoritesLoading,
    refetch 
  } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            hymn_id,
            hymns(
              id,
              title,
              hymn_authors(authors(*))
            )
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        return data.map((item: any) => ({
          hymnId: item.hymn_id,
          hymn: {
            ...item.hymns,
            authors: item.hymns.hymn_authors?.map((ha: any) => ha.authors) || []
          }
        }));
      } catch (err) {
        console.error('Error fetching favorites:', err);
        throw err;
      }
    },
    enabled: isAuthenticated
  });

  // Check if hymn is in favorites
  const checkIsFavorite = (hymnId: string): boolean => {
    return favorites.some(fav => fav.hymnId === hymnId);
  };

  // Add hymn to favorites
  const addToFavorites = useMutation({
    mutationFn: async (hymnId: string) => {
      if (!user) throw new Error('You must be logged in to favorite hymns');
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if already exists to prevent duplicates
        if (checkIsFavorite(hymnId)) return;
        
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            hymn_id: hymnId
          });
          
        if (error) throw error;
        
        return hymnId;
      } catch (err: any) {
        console.error('Error adding to favorites:', err);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    }
  });

  // Remove hymn from favorites
  const removeFromFavorites = useMutation({
    mutationFn: async (hymnId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, hymn_id: hymnId });
          
        if (error) throw error;
        
        return hymnId;
      } catch (err: any) {
        console.error('Error removing from favorites:', err);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    }
  });

  // Toggle favorite status
  const toggleFavorite = async (hymnId: string) => {
    if (!isAuthenticated) {
      setError(new Error('You must be logged in to favorite hymns'));
      return false;
    }
    
    try {
      if (checkIsFavorite(hymnId)) {
        await removeFromFavorites.mutateAsync(hymnId);
        return false;
      } else {
        await addToFavorites.mutateAsync(hymnId);
        return true;
      }
    } catch (err) {
      return checkIsFavorite(hymnId); // Return current state on error
    }
  };

  // Listen for auth state changes and refresh favorites
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  return {
    favorites,
    isLoading: isLoading || favoritesLoading,
    error,
    checkIsFavorite,
    addToFavorites: addToFavorites.mutate,
    removeFromFavorites: removeFromFavorites.mutate,
    toggleFavorite
  };
}

export default useFavorites;
