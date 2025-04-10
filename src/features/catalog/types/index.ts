/**
 * Types for catalog feature
 */

export interface Author {
  id: string | number;
  name: string;
  biography?: string;
  birth_year?: number;
  death_year?: number;
  image_url?: string;
  external_url?: string;
  created_at?: string;
  updated_at?: string;
  hymn_count?: number;
}

export interface Theme {
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  hymn_count?: number;
  parent_id?: string | number;
  is_seasonal?: boolean;
  season_start_date?: string;
  season_end_date?: string;
  color?: string;
}

export interface Tag {
  id: string | number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  hymn_count?: number;
}

export interface Category {
  id: string | number;
  name: string;
  description?: string;
  parent_id?: string | number;
  created_at?: string;
  updated_at?: string;
  hymn_count?: number;
  sort_order?: number;
}

export interface HymnWithRelations {
  id: string | number;
  title: string;
  subtitle?: string;
  code?: string;
  lyrics?: string;
  description?: string;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
  published?: boolean;
  thumbnail_url?: string;
  authors?: Author[];
  themes?: Theme[];
  tags?: Tag[];
  categories?: Category[];
  pdf_files?: PdfFile[];
  audio_files?: AudioFile[];
  video_links?: VideoLink[];
  presentation_files?: PresentationFile[];
}

export interface PdfFile {
  id: string | number;
  hymn_id: string | number;
  file_url: string;
  title?: string;
  description?: string;
  file_type?: string;
  size_bytes?: number;
  created_at?: string;
}

export interface AudioFile {
  id: string | number;
  hymn_id: string | number;
  file_url: string;
  title?: string;
  description?: string;
  duration_seconds?: number;
  file_type?: string;
  size_bytes?: number;
  created_at?: string;
}

export interface VideoLink {
  id: string | number;
  hymn_id: string | number;
  video_url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  platform?: string;
  created_at?: string;
}

export interface PresentationFile {
  id: string | number;
  hymn_id: string | number;
  file_url: string;
  title?: string;
  description?: string;
  file_type?: string;
  slide_count?: number;
  size_bytes?: number;
  created_at?: string;
}

export interface CatalogFilters {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CategoryWithHymns {
  id: string;
  name: string;
  hymns: {
    id: string;
    title: string;
  }[];
  hymn_count: number;
}
