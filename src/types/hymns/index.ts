// Hymn-related types

/**
 * Basic hymn information
 */
export interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  author_id?: string;
  metadata?: HymnMetadata;
}

/**
 * Extended hymn with related data
 */
export interface HymnWithRelations extends Hymn {
  authors?: Author[];
  categories?: Category[];
  pdf_files?: PdfFile[];
}

/**
 * Author information
 */
export interface Author {
  id: string;
  name: string;
  bio?: string;
  year_born?: number;
  year_died?: number;
}

/**
 * Hymn metadata
 */
export interface HymnMetadata {
  year?: number;
  language?: string;
  scripture_reference?: string;
  key?: string;
  tempo?: string;
  time_signature?: string;
  tags?: string[];
  [key: string]: any;
}

// Import from other type modules to avoid circular dependencies
import type { Category } from '../categories';
import type { PdfFile } from '../pdf';
