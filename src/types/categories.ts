export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
}

export interface HymnCategory {
  hymn_id: string;
  category_id: string;
}
