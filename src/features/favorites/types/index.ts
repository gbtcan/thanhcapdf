/**
 * Types for favorites feature
 */

export interface FavoriteItem {
  id: string;
  type: 'hymn' | 'author' | 'post' | 'theme';
  title: string;
  added_at: string;
  // Additional data specific to each type
  data?: Record<string, any>;
}

export interface FavoriteCollection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  is_public: boolean;
  items: FavoriteItem[];
}

export interface UserFavorites {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export interface FavoritesStats {
  total_items: number;
  total_collections: number;
  most_favorited_items: {
    id: string;
    type: string;
    title: string;
    favorites_count: number;
  }[];
}
