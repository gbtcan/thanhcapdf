/**
 * Types for resources (PDF, audio, video files)
 */

export interface ResourceBase {
  id: string;
  hymn_id: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  uploaded_by?: string;
}

export interface PdfResource extends ResourceBase {
  pdf_path: string;
  thumbnail_path?: string;
  page_count?: number;
  file_size?: number;
}

export interface AudioResource extends ResourceBase {
  audio_path: string;
  duration?: number;
  file_size?: number;
  format?: string;
  pdf_id?: string; // Optional reference to PDF
}

export interface VideoResource extends ResourceBase {
  video_url: string;
  source: 'youtube' | 'vimeo' | 'other';
  thumbnail_url?: string;
  duration?: number;
  pdf_id?: string; // Optional reference to PDF
}

export interface PresentationResource extends ResourceBase {
  presentation_url: string;
  source: string;
  slide_count?: number;
}

export interface ResourceFilter {
  hymn_id?: string;
  type?: 'pdf' | 'audio' | 'video' | 'presentation';
  uploaded_by?: string;
}
