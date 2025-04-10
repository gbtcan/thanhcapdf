/**
 * Types for content management
 */

export interface Author {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Post {
  id: number;
  user_id: string;
  title: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  
  // Derived properties
  author?: Author;
  likesCount?: number;
  commentsCount?: number;
}

export interface Hymn {
  id: number;
  created_by: string;
  title: string;
  lyrics: string;
  view_count: number;
  status?: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  
  // Derived properties
  author?: Author;
}

export interface Comment {
  id: number;
  user_id: string;
  content: string;
  post_id: number;
  status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  
  // Derived properties
  author?: Author;
  postTitle?: string;
}

export interface ContentFilterParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  userId?: string | null;
  categoryId?: number | null;
}

export interface CommentFilterParams extends ContentFilterParams {
  postId?: number | null;
}

export interface ContentStatistics {
  totalPosts: number;
  totalHymns: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  recentPosts: number;
  recentHymns: number;
  recentComments: number;
}
