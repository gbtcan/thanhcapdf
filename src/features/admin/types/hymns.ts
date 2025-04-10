export interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  created_by?: string;
  view_count: number;
  status?: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
  
  // Derived/joined fields
  author?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

export interface HymnPdfFile {
  id: string;
  hymn_id: string;
  pdf_path: string;
  description?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  
  // Generated/computed fields
  url?: string;
  size?: number;
  file_name?: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface HymnAudioFile {
  id: string;
  hymn_id: string;
  audio_path: string;
  description?: string;
  uploaded_by?: string;
  pdf_id?: string;
  created_at: string;
  updated_at: string;
  
  // Generated/computed fields
  url?: string;
  size?: number;
  duration?: number;
  file_name?: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
  };
  linked_pdf?: HymnPdfFile;
}

export interface HymnVideoLink {
  id: string;
  hymn_id: string;
  video_url: string;
  source?: string;
  description?: string;
  uploaded_by?: string;
  pdf_id?: string;
  created_at: string;
  updated_at: string;
  
  // Generated/computed fields
  thumbnail_url?: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
  };
  linked_pdf?: HymnPdfFile;
}

export interface HymnPresentationFile {
  id: string;
  hymn_id: string;
  presentation_url: string;
  description?: string;
  source?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  
  // Generated/computed fields
  url?: string;
  size?: number;
  file_name?: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface HymnFormData {
  title: string;
  lyrics?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface HymnFilterParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
