import { Tables } from './database.types';

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface ForumQueryParams {
  hymnId?: string;
  userId?: string;
  tagId?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'popular' | 'comments';
}

export interface Post {
  id: string;
  title: string;
  content: string;
  hymn_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_featured: boolean;
  
  // Relations
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
    reputation?: number;
  };
  hymn?: {
    id: string;
    title: string;
  };
  tags?: Tag[];
  
  // Counts
  _count?: {
    comments: number;
    likes: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
    reputation?: number;
  };
  
  // Counts
  _count?: {
    likes: number;
  };
}

export interface PostWithDetails extends Post {
  comments: Comment[];
}

export type Like = Tables<'likes'>;
export type PostTag = Tables<'post_tags'>;

export interface ForumTagWithCount extends Tag {
  _count: {
    posts: number;
  };
}

export interface ForumStatistics {
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  totalLikes: number;
  popularTags: ForumTagWithCount[];
}

/**
 * Type definitions for forum functionality
 */

// Forum Post interface
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  category_id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  hymn_id?: string;
  hymn?: {
    id: string;
    title: string;
  };
  is_pinned?: boolean;
  is_locked?: boolean;
  view_count?: number;
  comment_count?: number;
  like_count?: number;
  created_at: string;
  updated_at?: string;
  comments?: ForumComment[];
  likes?: ForumLike[];
}

// Forum Comment interface
export interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  parent_id?: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

// Forum Like interface
export interface ForumLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// Forum Category interface
export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  post_count?: number;
}

// Forum PostCard interface (simplified post for listings)
export interface PostCard {
  id: string;
  title: string;
  preview: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  commentCount: number;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  isPinned?: boolean;
  isLocked?: boolean;
}

// Search parameters for forum posts
export interface PostSearchParams {
  query?: string;
  categoryId?: string;
  authorId?: string;
  hymnId?: string;
  sortBy?: 'newest' | 'popular' | 'comments';
  page?: number;
  limit?: number;
}

// Forum search results
export interface ForumSearchResults {
  posts: ForumPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
