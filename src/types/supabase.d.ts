/**
 * Khai báo định nghĩa kiểu dữ liệu cho cơ sở dữ liệu Supabase
 * File này có thể được tạo tự động bởi supabase gen types typescript
 */

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
      authors: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          image_url: string | null
          birth_date: string | null
          death_date: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          image_url?: string | null
          birth_date?: string | null
          death_date?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          image_url?: string | null
          birth_date?: string | null
          death_date?: string | null
          slug?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string | null
          created_at: string
          updated_at: string | null
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug?: string | null
          created_at?: string
          updated_at?: string | null
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string | null
          created_at?: string
          updated_at?: string | null
          parent_id?: string | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          hymn_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hymn_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hymn_id?: string
          created_at?: string
        }
      }
      hymn_authors: {
        Row: {
          hymn_id: string
          author_id: string
        }
        Insert: {
          hymn_id: string
          author_id: string
        }
        Update: {
          hymn_id?: string
          author_id?: string
        }
      }
      hymn_categories: {
        Row: {
          hymn_id: string
          category_id: string
        }
        Insert: {
          hymn_id: string
          category_id: string
        }
        Update: {
          hymn_id?: string
          category_id?: string
        }
      }
      hymn_tags: {
        Row: {
          hymn_id: string
          tag_id: string
        }
        Insert: {
          hymn_id: string
          tag_id: string
        }
        Update: {
          hymn_id?: string
          tag_id?: string
        }
      }
      hymn_themes: {
        Row: {
          hymn_id: string
          theme_id: string
        }
        Insert: {
          hymn_id: string
          theme_id: string
        }
        Update: {
          hymn_id?: string
          theme_id?: string
        }
      }
      hymns: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          number: number | null
          sheet_music_key: string | null
          created_at: string
          updated_at: string | null
          slug: string | null
          lyrics: string | null
          description: string | null
          published: boolean
          view_count: number
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          number?: number | null
          sheet_music_key?: string | null
          created_at?: string
          updated_at?: string | null
          slug?: string | null
          lyrics?: string | null
          description?: string | null
          published?: boolean
          view_count?: number
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          number?: number | null
          sheet_music_key?: string | null
          created_at?: string
          updated_at?: string | null
          slug?: string | null
          lyrics?: string | null
          description?: string | null
          published?: boolean
          view_count?: number
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          email: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          created_at: string | null
          role: string | null
          permissions: string[] | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          email: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string | null
          role?: string | null
          permissions?: string[] | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string | null
          role?: string | null
          permissions?: string[] | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string | null
          created_at?: string
        }
      }
      themes: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_hymn_view: {
        Args: {
          hymn_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
