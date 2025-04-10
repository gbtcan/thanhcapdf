/**
 * Các loại dữ liệu tự động sinh bởi Supabase CLI
 * Khi cơ sở dữ liệu thay đổi, cập nhật file này bằng cách chạy:
 * 'npx supabase gen types typescript --project-id [your-project-id]'
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
          id: number
          name: string
          biography: string | null
          birth_year: number | null
          death_year: number | null
          image_url: string | null
          external_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          biography?: string | null
          birth_year?: number | null
          death_year?: number | null
          image_url?: string | null
          external_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          biography?: string | null
          birth_year?: number | null
          death_year?: number | null
          image_url?: string | null
          external_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          parent_id: number | null
          created_at: string
          updated_at: string | null
          sort_order: number | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string | null
          sort_order?: number | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          parent_id?: number | null
          created_at?: string
          updated_at?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      health: {
        Row: {
          id: number
          status: string
          timestamp: string
        }
        Insert: {
          id?: number
          status: string
          timestamp?: string
        }
        Update: {
          id?: number
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      hymn_authors: {
        Row: {
          hymn_id: number
          author_id: number
          created_at: string
          primary: boolean
        }
        Insert: {
          hymn_id: number
          author_id: number
          created_at?: string
          primary?: boolean
        }
        Update: {
          hymn_id?: number
          author_id?: number
          created_at?: string
          primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hymn_authors_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hymn_authors_hymn_id_fkey"
            columns: ["hymn_id"]
            referencedRelation: "hymns"
            referencedColumns: ["id"]
          }
        ]
      }
      hymn_categories: {
        Row: {
          hymn_id: number
          category_id: number
          created_at: string
        }
        Insert: {
          hymn_id: number
          category_id: number
          created_at?: string
        }
        Update: {
          hymn_id?: number
          category_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hymn_categories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hymn_categories_hymn_id_fkey"
            columns: ["hymn_id"]
            referencedRelation: "hymns"
            referencedColumns: ["id"]
          }
        ]
      }
      hymn_tags: {
        Row: {
          hymn_id: number
          tag_id: number
          created_at: string
        }
        Insert: {
          hymn_id: number
          tag_id: number
          created_at?: string
        }
        Update: {
          hymn_id?: number
          tag_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hymn_tags_hymn_id_fkey"
            columns: ["hymn_id"]
            referencedRelation: "hymns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hymn_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      hymn_themes: {
        Row: {
          hymn_id: number
          theme_id: number
          created_at: string
        }
        Insert: {
          hymn_id: number
          theme_id: number
          created_at?: string
        }
        Update: {
          hymn_id?: number
          theme_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hymn_themes_hymn_id_fkey"
            columns: ["hymn_id"]
            referencedRelation: "hymns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hymn_themes_theme_id_fkey"
            columns: ["theme_id"]
            referencedRelation: "themes"
            referencedColumns: ["id"]
          }
        ]
      }
      hymns: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          code: string | null
          lyrics: string | null
          description: string | null
          view_count: number
          created_at: string
          updated_at: string | null
          published: boolean
          thumbnail_url: string | null
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          code?: string | null
          lyrics?: string | null
          description?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string | null
          published?: boolean
          thumbnail_url?: string | null
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          code?: string | null
          lyrics?: string | null
          description?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string | null
          published?: boolean
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      pdf_files: {
        Row: {
          id: number
          hymn_id: number
          file_url: string
          title: string | null
          description: string | null
          file_type: string | null
          size_bytes: number | null
          created_at: string
        }
        Insert: {
          id?: number
          hymn_id: number
          file_url: string
          title?: string | null
          description?: string | null
          file_type?: string | null
          size_bytes?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          hymn_id?: number
          file_url?: string
          title?: string | null
          description?: string | null
          file_type?: string | null
          size_bytes?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_files_hymn_id_fkey"
            columns: ["hymn_id"]
            referencedRelation: "hymns"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string | null
          parent_id: number | null
          is_seasonal: boolean
          season_start_date: string | null
          season_end_date: string | null
          color: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string | null
          parent_id?: number | null
          is_seasonal?: boolean
          season_start_date?: string | null
          season_end_date?: string | null
          color?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string | null
          parent_id?: number | null
          is_seasonal?: boolean
          season_start_date?: string | null
          season_end_date?: string | null
          color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "themes_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "themes"
            referencedColumns: ["id"]
          }
        ]
      }
      user_favorites: {
        Row: {
          id: number
          user_id: string
          item_id: string
          item_type: string
          title: string
          added_at: string
        }
        Insert: {
          id?: number
          user_id: string
          item_id: string
          item_type: string
          title: string
          added_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          item_id?: string
          item_type?: string
          title?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_hymn_history: {
        Row: {
          user_id: string
          hymn_id: number
          viewed_at: string
        }
        Insert: {
          user_id: string
          hymn_id: number
          viewed_at?: string
        }
        Update: {
          user_id?: string
          hymn_id?: number
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hymn_history_hymn_id_fkey"
            columns: ["hymn_id"]
            referencedRelation: "hymns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hymn_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users_profile: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          role: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_profile_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_hymn_view: {
        Args: {
          hymn_id: number
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
