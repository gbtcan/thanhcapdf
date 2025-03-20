/**
 * Type definitions for hymns and related entities
 */

// Base Hymn interface
export interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  created_at?: string;
  updated_at?: string;
  view_count?: number;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

// Author interface
export interface Author {
  id: string;
  name: string;
  biography?: string;
  website?: string;
  image_url?: string;
}

// Theme interface
export interface Theme {
  id: string;
  name: string;
  description?: string;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  description?: string;
}

// PDF File interface
export interface PdfFile {
  id: string;
  hymn_id: string;
  pdf_path: string;
  file_url?: string; // URL for display
  description?: string;
  uploaded_at?: string;
  uploaded_by?: string;
}

// Audio File interface
export interface AudioFile {
  id: string;
  hymn_id: string;
  audio_path: string;
  file_url?: string; // URL for display
  description?: string;
  duration?: number;
  uploaded_at?: string;
  uploaded_by?: string;
}

// Video Link interface
export interface VideoLink {
  id: string;
  hymn_id: string;
  video_url: string;
  source?: 'youtube' | 'vimeo' | 'other';
  description?: string;
  added_at?: string;
  added_by?: string;
}

// Hymn with full relations
export interface HymnWithRelations extends Hymn {
  authors?: Author[];
  themes?: Theme[];
  tags?: Tag[];
  pdf_files?: PdfFile[];
  audio_files?: AudioFile[];
  video_links?: VideoLink[];
}

// Search parameters for hymns
export interface HymnSearchParams {
  query?: string;
  authorId?: string;
  themeId?: string;
  tagId?: string;
  sortBy?: 'title' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// Hymn search results
export interface HymnSearchResults {
  hymns: HymnWithRelations[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
