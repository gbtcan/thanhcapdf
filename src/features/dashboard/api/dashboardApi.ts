import { supabaseClient } from '../../../lib/supabase/client';
import { DashboardStats, RecentItem, RecommendedItem } from '../types';
import { STORAGE_KEYS, getStorageItem } from '../../../core/utils/storage';
import { handleSupabaseError } from '../../../core/utils/error-handler';

/**
 * Fetch user dashboard statistics
 */
export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Get recently viewed hymns
    const { data: recentlyViewed, error: recentError } = await supabaseClient
      .from('user_hymn_history')
      .select('hymn_id, hymns(id, title), viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // Get favorites count
    const { data: favorites, error: favoritesError } = await supabaseClient
      .from('user_favorites')
      .select('item_type')
      .eq('user_id', userId);

    if (favoritesError) throw favoritesError;

    // Count favorites by type
    const favoritesByType = favorites?.reduce((acc, item) => {
      const type = item.item_type as keyof typeof acc;
      if (acc[type] !== undefined) {
        acc[type]++;
      }
      return acc;
    }, {
      hymns: 0,
      authors: 0,
      themes: 0,
      playlists: 0,
      total: 0
    });

    favoritesByType.total = favorites?.length || 0;

    // Get notification count
    const { count: notificationCount, error: notifError } = await supabaseClient
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (notifError) throw notifError;

    // Get saved offline items from local storage
    const offlineHymns = getStorageItem(STORAGE_KEYS.CACHED_HYMNS) || [];
    
    return {
      recentlyViewed: recentlyViewed?.map(item => ({
        id: item.hymn_id,
        title: item.hymns?.title || 'Unknown Hymn',
        type: 'hymn',
        timestamp: item.viewed_at
      })) as RecentItem[] || [],
      favorites: favoritesByType,
      notifications: notificationCount || 0,
      savedOffline: offlineHymns.length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Get recommended hymns for the user
 */
export async function fetchRecommendedHymns(
  userId: string,
  options: { limit?: number } = {}
): Promise<RecommendedItem[]> {
  try {
    const { limit = 5 } = options;
    
    // For users with history, get hymns similar to what they viewed
    if (userId) {
      // Get user's recent categories/themes
      const { data: userHistory } = await supabaseClient.rpc('get_user_hymn_preferences', {
        p_user_id: userId,
        p_limit: 3
      });
      
      if (userHistory && userHistory.length > 0) {
        // Get hymns from preferred categories
        const { data, error } = await supabaseClient
          .from('hymns')
          .select(`
            id, title, subtitle, thumbnail_url,
            authors:hymn_authors(author:author_id(name))
          `)
          .in('id', function(sb) {
            sb.from('hymn_themes')
              .select('hymn_id')
              .in('theme_id', userHistory.map(h => h.theme_id))
          })
          .order('view_count', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        return data.map(hymn => ({
          id: hymn.id,
          title: hymn.title,
          subtitle: hymn.subtitle || hymn.authors[0]?.author?.name || undefined,
          imageUrl: hymn.thumbnail_url || undefined,
          type: 'hymn',
          reason: 'personalized'
        }));
      }
    }
    
    // Fallback: Get popular hymns
    const { data, error } = await supabaseClient
      .from('hymns')
      .select(`
        id, title, subtitle, thumbnail_url,
        authors:hymn_authors(author:author_id(name))
      `)
      .order('view_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(hymn => ({
      id: hymn.id,
      title: hymn.title,
      subtitle: hymn.subtitle || hymn.authors[0]?.author?.name || undefined,
      imageUrl: hymn.thumbnail_url || undefined,
      type: 'hymn',
      reason: 'popular'
    }));
  } catch (error) {
    console.error('Error fetching recommended hymns:', error);
    throw handleSupabaseError(error);
  }
}
