/**
 * Types for Community domain
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  hymn_id?: string;
  search_vector?: any;
}

export interface Comment {
  id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  post_id: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at?: string;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at?: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
  created_at?: string;
}

export interface PostWithRelations extends Post {
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count?: number;
  comments_count?: number;
  tags?: { id: string; name: string }[];
  is_liked_by_user?: boolean;
}

export interface CommentWithRelations extends Comment {
  author?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count?: number;
  is_liked_by_user?: boolean;
}

export interface PostFilter {
  tag_ids?: string[];
  hymn_id?: string;
  user_id?: string;
  search_term?: string;
  sort_by?: 'created_at' | 'likes_count' | 'comments_count';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Types for community feature
 */

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  hymn_id?: string;
  created_at: string;
  updated_at?: string;
  view_count: number;
  likes_count: number;
  replies_count: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  tags?: string[];
  slug?: string;
  user?: ForumUser;
}

export interface ForumUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  reputation?: number;
  post_count?: number;
  join_date?: string;
}

export interface ForumReply {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  is_solution?: boolean;
  user?: ForumUser;
  parent_id?: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  post_count: number;
  color?: string;
  slug?: string;
  sort_order?: number;
}

export interface ForumPostFilter {
  category_id?: string;
  user_id?: string;
  hymn_id?: string;
  search?: string;
  tags?: string[];
  sort?: 'newest' | 'most_viewed' | 'most_liked' | 'most_replied';
}

export interface ForumStats {
  total_posts: number;
  total_replies: number;
  total_users: number;
  active_users_today: number;
}
