/**
 * Type definitions for the Hymns feature
 */

import { Author as CatalogAuthor, Theme as CatalogTheme, Tag } from '../../catalog/types';

export interface Hymn {
  id: string;
  title: string;
  // Không có subtitle trong database
  // Không có number trong database
  lyrics?: string;
  view_count: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  last_viewed_at?: string;
  // Không có slug trong database
}

// Rename local interfaces to avoid conflict
export interface HymnAuthorInfo {
  id: string;
  name: string;
  biography?: string;  // Thay vì description
  // Không có image_url trong database
  created_at?: string;
  updated_at?: string;
}

export interface HymnThemeInfo {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HymnAuthor {
  hymn_id: string;
  author_id: string;
  created_at?: string;
}

export interface HymnTheme {
  hymn_id: string;
  theme_id: string;
  created_at?: string;
}

export interface HymnPdfFile {
  id: string;
  hymn_id: string;
  pdf_path: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  uploaded_by?: string;
  url?: string; // Add the missing url property
}

export interface HymnAudioFile {
  id: string;
  hymn_id: string;
  audio_path: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  uploaded_by?: string;
  pdf_id?: string;
}

export interface HymnVideoLink {
  id: string;
  hymn_id: string;
  video_url: string;
  source?: string;
  description?: string; // Add description property
  created_at?: string;
  updated_at?: string;
  uploaded_by?: string;
  pdf_id?: string;
  linked_pdf?: HymnPdfFile; // Add linked_pdf property
  uploader?: { // Add uploader property
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface HymnPresentationFile {
  id: string;
  hymn_id: string;
  presentation_url: string;
  source?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  uploaded_by?: string;
}

export interface HymnWithRelations extends Hymn {
  authors?: HymnAuthorInfo[]; // Use renamed interface
  themes?: HymnThemeInfo[]; // Use renamed interface
  pdf_files?: HymnPdfFile[];
  audio_files?: HymnAudioFile[];
  video_links?: HymnVideoLink[];
  presentation_files?: HymnPresentationFile[];
}

export interface HymnFilters {
  search?: string;
  authorId?: string;
  themeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
