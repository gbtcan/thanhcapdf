/**
 * Types for the comments feature
 */

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  hymn_id: string;
  parent_id?: string;
  is_pinned?: boolean;
  is_deleted?: boolean;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  reply_count?: number;
  likes_count?: number;
}

export interface CommentFormData {
  content: string;
  hymn_id: string;
  parent_id?: string;
}

export interface CommentFilter {
  hymn_id?: string;
  user_id?: string;
  parent_id?: string | null; // null means only root comments
  sort?: 'newest' | 'oldest' | 'likes';
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}
