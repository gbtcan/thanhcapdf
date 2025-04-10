export interface DashboardStats {
  recentlyViewed: RecentItem[];
  favorites: FavoriteCount;
  notifications: number;
  savedOffline: number;
}

export interface RecentItem {
  id: string | number;
  title: string;
  type: 'hymn' | 'author' | 'theme' | 'playlist';
  timestamp: string;
}

export interface FavoriteCount {
  hymns: number;
  authors: number;
  themes: number;
  playlists: number;
  total: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export interface RecommendedItem {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  type: 'hymn' | 'author' | 'theme' | 'playlist';
  reason?: 'popular' | 'seasonal' | 'recent' | 'personalized';
}
