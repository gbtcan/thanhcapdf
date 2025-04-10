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
      hymns_new: {
        Row: {
          id: string
          title: string
          number?: number
          view_count?: number
          last_viewed_at?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          number?: number
          view_count?: number
          last_viewed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          number?: number
          view_count?: number
          last_viewed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      hymn_authors: {
        Row: {
          hymn_id: string
          author_id: string
          created_at?: string
        }
        Insert: {
          hymn_id: string
          author_id: string
          created_at?: string
        }
        Update: {
          hymn_id?: string
          author_id?: string
          created_at?: string
        }
      }
      hymn_themes: {
        Row: {
          hymn_id: string
          theme_id: string
          created_at?: string
        }
        Insert: {
          hymn_id: string
          theme_id: string
          created_at?: string
        }
        Update: {
          hymn_id?: string
          theme_id?: string
          created_at?: string
        }
      }
      pdf_files: {
        Row: {
          id: string
          file_key: string
          title?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          file_key: string
          title?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_key?: string
          title?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      public_increment_hymn_view: {
        Args: {
          hymn_id: string
        }
        Returns: void
      }
      increment_hymn_view: {
        Args: {
          hymn_id: string
          user_id?: string | null
        }
        Returns: void
      }
      calculate_new_view_count: {
        Args: {
          row_id: string
        }
        Returns: number
      }
    }
  }
}