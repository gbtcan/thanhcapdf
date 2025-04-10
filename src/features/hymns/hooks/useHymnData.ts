import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPublicHymn, incrementHymnView } from '../../../core/api/publicDataAPI';
import { useOfflineData } from '../../../contexts/OfflineDataContext';
import { useNetworkStatus } from '../../../contexts/NetworkStatusContext';
import { useFavorites } from '../../../contexts/FavoritesContext';
import { useHymnHistory } from '../../../contexts/HymnHistoryContext';
import { HymnWithRelations } from '../types';

/**
 * Combined hook for all hymn data operations
 * This provides a unified API for hymn data access, regardless of source (online/offline)
 */
export function useHymnData(hymnId?: string) {
  const queryClient = useQueryClient();
  const { isOnline, isSupabaseReachable } = useNetworkStatus();
  const { isOfflineModeEnabled, isHymnCached, getHymnFromCache, addHymnToCache } = useOfflineData();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { addToHistory } = useHymnHistory();
  
  // Determine if we should use cached data
  const shouldUseCache = isOfflineModeEnabled && (!isOnline || !isSupabaseReachable) && hymnId ? isHymnCached(hymnId) : false;
  
  // Fetch hymn data from API or cache
  const { 
    data: hymn,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['hymn', hymnId],
    queryFn: async () => {
      // If offline and hymn is cached, use cached data
      if (shouldUseCache) {
        return getHymnFromCache(hymnId!);
      }
      
      // Otherwise fetch from API
      const data = await fetchPublicHymn(hymnId!);
      
      // Add to cache for offline use if enabled
      if (isOfflineModeEnabled && data) {
        addHymnToCache(hymnId!, data);
      }
      
      return data;
    },
    enabled: !!hymnId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Add to history if hymn is loaded
  if (hymn && hymnId) {
    addToHistory(hymnId, hymn.title);
  }
  
  // Increment view count mutation
  const incrementViewMutation = useMutation({
    mutationFn: () => {
      if (!hymnId || !isOnline || !isSupabaseReachable) return Promise.resolve();
      return incrementHymnView(hymnId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hymn', hymnId] });
    }
  });
  
  // Increment view count when hymn is loaded
  const recordView = () => {
    incrementViewMutation.mutate();
  };
  
  // Check if hymn is favorited
  const isFavoriteHymn = hymnId ? isFavorited(hymnId, 'hymn') : false;
  
  // Toggle favorite status
  const toggleFavoriteHymn = () => {
    if (hymnId && hymn) {
      return toggleFavorite(hymnId, 'hymn', hymn.title);
    }
    return Promise.reject('No hymn data available');
  };
  
  return {
    hymn,
    isLoading,
    error,
    refetch,
    recordView,
    isOffline: !isOnline || !isSupabaseReachable,
    usingCachedData: shouldUseCache,
    isFavorite: isFavoriteHymn,
    toggleFavorite: toggleFavoriteHymn
  };
}
