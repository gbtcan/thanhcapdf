/**
 * Interface for PDF file metadata stored in the database
 */
export interface PdfFile {
  id: string;
  hymn_id: string;
  filename: string;
  created_at: string;
  updated_at?: string;
  user_id?: string; 
  size?: number;
  view_count?: number;
  download_count?: number;
  metadata?: PdfMetadata;
  // Relations
  hymns?: {
    title: string;
    authors?: { name: string }[];
  };
}

/**
 * Metadata stored with the PDF file
 */
export interface PdfMetadata {
  originalName?: string;
  description?: string;
  pageCount?: number;
  author?: string;
  keywords?: string[];
  title?: string;
  contentType?: string;
  uploadedBy?: string;
  source?: string;
  language?: string;
  copyright?: string;
  isPrimaryScore?: boolean;
  isLeadSheet?: boolean;
  arrangement?: string;
  parts?: string[];
  key?: string;
  [key: string]: any;
}

/**
 * Interface for PDF view records
 */
export interface PdfView {
  pdf_id: string;
  user_id?: string;
  session_id?: string;
  viewed_at: string;
}

/**
 * Additional interface for uploading PDFs
 */
export interface PdfUpload {
  file: File;
  hymn_id: string;
  metadata?: PdfMetadata;
  onProgress?: (progress: number) => void;
}

/**
 * Interface for PDF download response
 */
export interface PdfDownload {
  url: string;
  filename: string;
}
