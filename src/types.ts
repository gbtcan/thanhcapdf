// Re-export these types directly to avoid circular references
export type UserRole = 'standard' | 'editor' | 'administrator';

export interface Role {
  id: number;
  name: UserRole;
  permissions: any;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role_id?: number;
  name?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Role;
}

export interface Author {
  id: string | number;
  name: string;
  biography?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface PDFFile {
  id: string;
  hymn_id: string;
  file_url: string;
  version?: number;
  created_at: string;
  updated_at?: string;
}

export interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  created_at: string;
  updated_at?: string;
  search_vector?: any;
  author_id?: string | null;
  pdf_url?: string | null;
}

export interface HymnWithRelations extends Hymn {
  authors: Author[];
  categories: Category[];
  pdf_files?: PDFFile[];
  pdfUrl?: string | null;
  hymn_authors?: any[];
  hymn_categories?: any[];
}

export interface HymnAuthor {
  hymn_id: string;
  author_id: string | number;
}

export interface HymnCategory {
  hymn_id: string;
  category_id: number;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  error: Error | null;
  session: any | null;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  isAuthenticated: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: number | null;
  author?: number | null;
}

export type SortOption = 'title-asc' | 'title-desc' | 'author' | 'created-asc' | 'created-desc';

export interface QueryParams {
  q?: string;
  category?: string;
  author?: string;
  sort?: SortOption;
}

// Core database entity types
export interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  created_at: string;
  updated_at?: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface PdfFile {
  id: number;
  hymn_id: string;
  file_url: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  role_id?: number;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions?: string[];
  created_at?: string;
}

// Relationship types
export interface HymnAuthor {
  hymn_id: string;
  author_id: number;
}

export interface HymnCategory {
  hymn_id: string;
  category_id: number;
}

export interface UserRole {
  user_id: string;
  role_id: number;
}

// Extended types with relationships
export interface HymnWithRelations extends Hymn {
  authors: Author[];
  categories: Category[];
  pdfUrl?: string | null;
}

export interface AuthorWithHymns extends Author {
  hymns: Hymn[];
}

export interface CategoryWithHymns extends Category {
  hymns: Hymn[];
  hymn_count?: number;
}

// UI specific types
export type SortOption = 'title-asc' | 'title-desc' | 'author' | 'created-asc' | 'created-desc';

export interface SearchFilters {
  query: string;
  categoryId?: number;
  authorId?: number;
  sortBy: SortOption;
}

// Authentication types
export interface AuthState {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  error: Error | null;
  session: any;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Component prop types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

// Re-export all types from the types directory for easier imports
export * from './types/index';
export * from './types/database.types';

// Add any additional global types here
export interface AppConfig {
  appName: string;
  version: string;
  enableForum: boolean;
  enablePdfPreview: boolean;
  enableUserProfiles: boolean;
}