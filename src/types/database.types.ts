// Define comprehensive database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role_id: number | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          reputation: number;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role_id?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          reputation?: number;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role_id?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          reputation?: number;
        };
      };
      roles: {
        Row: {
          id: number;
          name: string;
          permissions: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          permissions?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          permissions?: Record<string, any>;
          created_at?: string;
        };
      };
      hymns: {
        Row: {
          id: string;
          title: string;
          lyrics: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          lyrics?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          lyrics?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pdf_files: {
        Row: {
          id: string;
          hymn_id: string;
          file_url: string;
          description: string | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hymn_id: string;
          file_url: string;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hymn_id?: string;
          file_url?: string;
          description?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      authors: {
        Row: {
          id: string;
          name: string;
          biography: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          biography?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          biography?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hymn_authors: {
        Row: {
          hymn_id: string;
          author_id: string;
          created_at: string;
        };
        Insert: {
          hymn_id: string;
          author_id: string;
          created_at?: string;
        };
        Update: {
          hymn_id?: string;
          author_id?: string;
          created_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hymn_themes: {
        Row: {
          hymn_id: string;
          theme_id: string;
          created_at: string;
        };
        Insert: {
          hymn_id: string;
          theme_id: string;
          created_at?: string;
        };
        Update: {
          hymn_id?: string;
          theme_id?: string;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          hymn_id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
          is_pinned: boolean;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          hymn_id: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
          is_featured?: boolean;
        };
        Update: {
          id?: string;
          hymn_id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
          is_featured?: boolean;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      hymn_tags: {
        Row: {
          hymn_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          hymn_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          hymn_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      hymn_views: {
        Row: {
          hymn_id: string;
          user_id: string | null;
          viewed_at: string;
        };
        Insert: {
          hymn_id: string;
          user_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          hymn_id?: string;
          user_id?: string | null;
          viewed_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          post_id: string | null;
          comment_id: string | null;
          type: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          post_id?: string | null;
          comment_id?: string | null;
          type: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          post_id?: string | null;
          comment_id?: string | null;
          type?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      reputation_events: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          points: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          points: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          points?: number;
          reason?: string;
          created_at?: string;
        };
      };
      content_flags: {
        Row: {
          id: string;
          content_type: string;
          content_id: string;
          reason: string;
          details: string | null;
          reporter_id: string | null;
          status: string;
          moderator_note: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_type: string;
          content_id: string;
          reason: string;
          details?: string | null;
          reporter_id?: string | null;
          status?: string;
          moderator_note?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_type?: string;
          content_id?: string;
          reason?: string;
          details?: string | null;
          reporter_id?: string | null;
          status?: string;
          moderator_note?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Helper to extract Row types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']