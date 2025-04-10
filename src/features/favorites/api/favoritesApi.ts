import { supabase } from '../../../lib/supabase';
import { FavoriteItem, FavoriteCollection, FavoritesStats } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../../../core/utils/storage';
import { supabaseClient } from '../../../lib/supabase/client';

interface AddFavoriteParams {
  userId: string;
  itemId: string;
  itemType: 'hymn' | 'post' | 'comment';
}

interface RemoveFavoriteParams {
  userId: string;
  itemId: string;
  itemType: 'hymn' | 'post' | 'comment';
}

/**
 * Get favorites for a user from the database
 */
export async function getUserFavorites(userId: string): Promise<FavoriteItem[]> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        item_id,
        item_type,
        created_at,
        hymns:item_id!item_id(id, title),
        authors:item_id!item_id(id, name),
        themes:item_id!item_id(id, name),
        posts:item_id!item_id(id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the data
    const favorites: FavoriteItem[] = data.map(item => {
      let title = '';
      let itemData = {};
      
      // Determine title based on item type
      switch (item.item_type) {
        case 'hymn':
          title = item.hymns?.title || '';
          itemData = item.hymns || {};
          break;
        case 'author':
          title = item.authors?.name || '';
          itemData = item.authors || {};
          break;
        case 'theme':
          title = item.themes?.name || '';
          itemData = item.themes || {};
          break;
        case 'post':
          title = item.posts?.title || '';
          itemData = item.posts || {};
          break;
      }
      
      return {
        id: item.item_id,
        type: item.item_type,
        title,
        added_at: item.created_at,
        data: itemData
      };
    });
    
    return favorites;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
}

/**
 * Get favorite collections for a user
 */
export async function getUserFavoriteCollections(userId: string): Promise<FavoriteCollection[]> {
  try {
    const { data, error } = await supabase
      .from('favorite_collections')
      .select(`
        *,
        items:collection_items(
          id,
          item_id,
          item_type,
          added_at,
          hymns:item_id!item_id(id, title),
          authors:item_id!item_id(id, name),
          themes:item_id!item_id(id, name),
          posts:item_id!item_id(id, title)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the collections
    const collections: FavoriteCollection[] = data.map(collection => {
      // Format items in the collection
      const items = collection.items.map((item: any) => {
        let title = '';
        let itemData = {};
        
        switch (item.item_type) {
          case 'hymn':
            title = item.hymns?.title || '';
            itemData = item.hymns || {};
            break;
          case 'author':
            title = item.authors?.name || '';
            itemData = item.authors || {};
            break;
          case 'theme':
            title = item.themes?.name || '';
            itemData = item.themes || {};
            break;
          case 'post':
            title = item.posts?.title || '';
            itemData = item.posts || {};
            break;
        }
        
        return {
          id: item.item_id,
          type: item.item_type,
          title,
          added_at: item.added_at,
          data: itemData
        };
      });
      
      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
        user_id: collection.user_id,
        is_public: collection.is_public,
        items
      };
    });
    
    return collections;
  } catch (error) {
    console.error('Error fetching favorite collections:', error);
    throw error;
  }
}

/**
 * Check if an item is in user's favorites
 */
export async function isItemFavorited(userId: string, itemId: string, itemType: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const { count, error } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
      
    if (error) throw error;
    
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error checking if item is favorited:', error);
    return false;
  }
}

/**
 * Add an item to favorites
 */
export async function addToFavorites(
  userId: string, 
  itemId: string, 
  itemType: string, 
  title: string
): Promise<void> {
  if (!userId) throw new Error('User ID is required');
  
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    // Also add to local storage for offline access
    addToLocalFavorites(itemId, itemType, title);
  } catch (error) {
    console.error('Error adding item to favorites:', error);
    throw error;
  }
}

/**
 * Remove an item from favorites
 */
export async function removeFromFavorites(userId: string, itemId: string, itemType: string): Promise<void> {
  if (!userId) throw new Error('User ID is required');
  
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
      
    if (error) throw error;
    
    // Also remove from local storage
    removeFromLocalFavorites(itemId);
  } catch (error) {
    console.error('Error removing item from favorites:', error);
    throw error;
  }
}

/**
 * Get favorites statistics
 */
export async function getFavoritesStats(): Promise<FavoritesStats> {
  try {
    const [
      { count: totalItems },
      { count: totalCollections },
      { data: mostFavorited }
    ] = await Promise.all([
      supabase.from('user_favorites').select('*', { count: 'exact', head: true }),
      supabase.from('favorite_collections').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_most_favorited_items', { limit_count: 5 })
    ]);
    
    return {
      total_items: totalItems || 0,
      total_collections: totalCollections || 0,
      most_favorited_items: mostFavorited || []
    };
  } catch (error) {
    console.error('Error fetching favorites stats:', error);
    throw error;
  }
}

// Local storage functions for offline functionality

/**
 * Get favorites from local storage
 */
export function getLocalFavorites(): FavoriteItem[] {
  return getStorageItem<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
}

/**
 * Add an item to local favorites
 */
export function addToLocalFavorites(id: string, type: string, title: string): void {
  const favorites = getLocalFavorites();
  
  // Check if item already exists
  const existingIndex = favorites.findIndex(item => item.id === id && item.type === type);
  
  if (existingIndex === -1) {
    // Add new item
    favorites.unshift({
      id,
      type: type as any,
      title,
      added_at: new Date().toISOString()
    });
    
    // Save back to storage
    setStorageItem(STORAGE_KEYS.FAVORITES, favorites);
  }
}

/**
 * Remove an item from local favorites
 */
export function removeFromLocalFavorites(id: string): void {
  const favorites = getLocalFavorites();
  const updatedFavorites = favorites.filter(item => item.id !== id);
  setStorageItem(STORAGE_KEYS.FAVORITES, updatedFavorites);
}

/**
 * Check if an item is in local favorites
 */
export function isInLocalFavorites(id: string): boolean {
  const favorites = getLocalFavorites();
  return favorites.some(item => item.id === id);
}

/**
 * Check if an item is in user's favorites
 */
export async function checkIsFavorite({ userId, itemId, itemType }: AddFavoriteParams): Promise<boolean> {
  try {
    // Determine which table to query based on item type
    let table: string;
    let column: string;
    
    switch (itemType) {
      case 'hymn':
        table = 'hymn_likes';
        column = 'hymn_id';
        break;
      case 'post':
        table = 'post_likes';
        column = 'post_id';
        break;
      case 'comment':
        table = 'comment_likes';
        column = 'comment_id';
        break;
      default:
        throw new Error('Invalid item type');
    }
    
    // Query the appropriate table
    const { data, error } = await supabaseClient
      .from(table)
      .select('id')
      .eq(column, itemId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if ${itemType} is favorite:`, error);
    return false;
  }
}

/**
 * Add an item to user's favorites
 */
export async function addFavorite({ userId, itemId, itemType }: AddFavoriteParams): Promise<void> {
  try {
    // Determine which table to insert into based on item type
    let table: string;
    let data: any;
    
    switch (itemType) {
      case 'hymn':
        table = 'hymn_likes';
        data = { hymn_id: itemId, user_id: userId };
        break;
      case 'post':
        table = 'post_likes';
        data = { post_id: itemId, user_id: userId };
        break;
      case 'comment':
        table = 'comment_likes';
        data = { comment_id: itemId, user_id: userId };
        break;
      default:
        throw new Error('Invalid item type');
    }
    
    // Add created_at timestamp
    data.created_at = new Date().toISOString();
    
    // Insert into the appropriate table
    const { error } = await supabaseClient
      .from(table)
      .insert([data]);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error adding ${itemType} to favorites:`, error);
    throw error;
  }
}

/**
 * Remove an item from user's favorites
 */
export async function removeFavorite({ userId, itemId, itemType }: RemoveFavoriteParams): Promise<void> {
  try {
    // Determine which table to delete from based on item type
    let table: string;
    let column: string;
    
    switch (itemType) {
      case 'hymn':
        table = 'hymn_likes';
        column = 'hymn_id';
        break;
      case 'post':
        table = 'post_likes';
        column = 'post_id';
        break;
      case 'comment':
        table = 'comment_likes';
        column = 'comment_id';
        break;
      default:
        throw new Error('Invalid item type');
    }
    
    // Delete from the appropriate table
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq(column, itemId)
      .eq('user_id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error removing ${itemType} from favorites:`, error);
    throw error;
  }
}

/**
 * Get user's favorite hymns
 */
export async function getFavoriteHymns(userId: string, page = 0, pageSize = 10) {
  try {
    const { data, error, count } = await supabaseClient
      .from('hymn_likes')
      .select(`
        id, created_at,
        hymn:hymn_id(
          id, title, view_count, lyrics, created_at, updated_at,
          authors:hymn_authors(author:authors(id, name))
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) throw error;
    
    // Process data to extract hymns and format author information
    const hymns = data.map(item => {
      const hymn = item.hymn;
      
      // Format authors
      const authors = hymn?.authors?.map((authorItem: any) => ({
        id: authorItem.author.id,
        name: authorItem.author.name
      })) || [];
      
      return {
        ...hymn,
        authors
      };
    });
    
    return { hymns, total: count || 0 };
  } catch (error) {
    console.error('Error fetching favorite hymns:', error);
    return { hymns: [], total: 0 };
  }
}

import { supabase } from '../../../lib/supabase';

/**
 * Checks if a hymn is favorited by the user
 */
export async function isHymnFavorited(hymnId: string, userId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('hymn_likes')
      .select('*', { count: 'exact', head: true })
      .eq('hymn_id', hymnId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return (count || 0) > 0;
  } catch (err) {
    console.error('Error checking favorite status:', err);
    return false;
  }
}

/**
 * Toggle favorite status of a hymn for a user
 */
export async function toggleFavorite(hymnId: string, userId: string): Promise<boolean> {
  try {
    // Check current state
    const isFavorited = await isHymnFavorited(hymnId, userId);
    
    if (isFavorited) {
      // Remove favorite
      const { error } = await supabase
        .from('hymn_likes')
        .delete()
        .eq('hymn_id', hymnId)
        .eq('user_id', userId);
        
      if (error) throw error;
      return false;
    } else {
      // Add favorite
      const { error } = await supabase
        .from('hymn_likes')
        .insert({
          hymn_id: hymnId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      return true;
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
    throw err;
  }
}

/**
 * Get the user's favorited hymns
 */
export async function getFavoriteHymns(userId: string) {
  try {
    // Get the hymn_id's of all the user's favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('hymn_likes')
      .select('hymn_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (favoritesError) throw favoritesError;
    
    if (!favoritesData || favoritesData.length === 0) {
      return [];
    }
    
    const hymnIds = favoritesData.map(favorite => favorite.hymn_id);
    
    // Fetch hymns data for the favorites
    const { data: hymnsData, error: hymnsError } = await supabase
      .from('hymns_new')
      .select('id, title, view_count')
      .in('id', hymnIds);
      
    if (hymnsError) throw hymnsError;
    
    // Create a map of hymn_id to hymn details for quick lookup
    const hymnsMap = new Map(hymnsData?.map(hymn => [hymn.id, hymn]) || []);
    
    // Enrich hymn data with author information
    const enrichedHymns = await Promise.all(hymnIds
      .map(hymnId => hymnsMap.get(hymnId))
      .filter(Boolean)
      .map(async (hymn) => {
        // Get author info for this hymn
        const { data: authorRels } = await supabase
          .from('hymn_authors')
          .select('author_id')
          .eq('hymn_id', hymn!.id);
          
        let authors = [];
        if (authorRels && authorRels.length > 0) {
          const authorIds = authorRels.map(rel => rel.author_id);
          
          const { data: authorsData } = await supabase
            .from('authors')
            .select('id, name')
            .in('id', authorIds);
            
          authors = authorsData || [];
        }
        
        return {
          ...hymn,
          authors
        };
      }));
      
    return enrichedHymns;
  } catch (err) {
    console.error('Error fetching favorite hymns:', err);
    throw err;
  }
}

/**
 * Get count of user's favorited hymns
 */
export async function getFavoriteHymnsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('hymn_likes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return count || 0;
  } catch (err) {
    console.error('Error counting favorite hymns:', err);
    return 0;
  }
}
