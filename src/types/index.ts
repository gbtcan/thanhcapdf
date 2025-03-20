import { Tables } from './database.types';

// Re-export all types from domain-specific directories
export * from './hymns';
export * from './pdf';
export * from './users';
export * from './forum';
export * from './categories';
export * from './notifications';
export * from './database.types';

// Define the auth user role type
export type UserRole = 'standard' | 'editor' | 'administrator' | 'contributor' | 'user';

// Define the base entity types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface Author extends BaseEntity {
  id: string | number;
  name: string;
  biography?: string;
  bio?: string;
  birth_year?: number;
  death_year?: number;
}

export interface Category extends BaseEntity {
  id: string | number;
  name: string;
  description?: string;
  parent_id?: string | number;
}

export interface Theme {
  id: string | number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string | number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Hymn extends BaseEntity {
  id: string | number;
  title: string;
  lyrics?: string;
  music_url?: string;
  video_url?: string;
  notes?: string;
  view_count?: number;
  search_vector?: any;
}

// Define the relationship entity types
export interface HymnAuthor {
  hymn_id: string;
  author_id: string | number;
}

export interface HymnCategory {
  hymn_id: string;
  category_id: number;
}

// Type alias for consistency
export type HymnAuthorRelation = HymnAuthor;
export type HymnCategoryRelation = HymnCategory;

// Define extended entity types with relations
export interface HymnWithRelations extends Hymn {
  authors: Author[];
  categories: Category[];
  themes?: Theme[];
  pdf_files?: PDFFile[];
  pdfUrl?: string | null;
  tags?: Tag[];
}

export interface HymnDetails extends Hymn {
  authors: Author[];
  categories: Category[];
  themes: Theme[];
  pdf_files: PdfFile[];
}

export interface HymnWithDetails extends HymnWithRelations {
  tags: Tag[];
}

// Now define the base types
export interface Role {
  id: number;
  name: UserRole;
  permissions: any;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role_id?: number;
  roles?: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface PdfFile {
  id: string | number;
  hymn_id: string | number;
  file_url: string;
  file_key?: string;
  title?: string;
  file_type?: string;
  size_bytes?: number;
  created_at?: string;
  updated_at?: string;
}

// For backwards compatibility during refactoring
export interface Song extends Hymn {}
export interface SongWithRelations extends HymnWithRelations {}

// Database interface for Supabase typing
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at'>;
        Update: Partial<Omit<Role, 'id' | 'created_at'>>;
      };
      hymns: {
        Row: Hymn;
        Insert: Omit<Hymn, 'created_at' | 'updated_at' | 'search_vector'>;
        Update: Partial<Omit<Hymn, 'id' | 'created_at' | 'updated_at' | 'search_vector'>>;
      };
      authors: {
        Row: Author;
        Insert: Omit<Author, 'created_at'>;
        Update: Partial<Omit<Author, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      hymn_authors: {
        Row: HymnAuthor;
        Insert: HymnAuthor;
        Update: Partial<HymnAuthor>;
      };
      hymn_categories: {
        Row: HymnCategory;
        Insert: HymnCategory;
        Update: Partial<HymnCategory>;
      };
    };
  };
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  loading?: boolean;  // For backward compatibility
  error: Error | null;
  session: any;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  isAuthenticated: boolean;
  updateProfile?: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  permissions?: Record<string, boolean>;
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

// Base entity interfaces
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

export interface Role {
  id: number;
  name: string;
  permissions?: string[];
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  role_id?: number;
  created_at?: string;
}

// Relationship interfaces
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

/**
 * Core application types for the Catholic Hymns App
 */

// Basic record types
export interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  created_at: string;
  updated_at: string | null;
}

export interface Author {
  id: number;
  name: string;
  biography: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PDFFile {
  id: number;
  hymn_id: string;
  file_url: string;
  created_at: string;
  updated_at: string | null;
}

export interface UserRole {
  user_id: string;
  role_id: number;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role_id: number | null;
  display_name: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Favorite {
  id: number;
  user_id: string;
  hymn_id: string;
  created_at: string;
}

// Nested relationship types
export interface HymnWithRelations extends Hymn {
  authors?: Author[];
  categories?: Category[];
  pdfUrl?: string | null;
}

export interface AuthorWithHymns extends Author {
  hymns: HymnWithRelations[];
}

export interface CategoryWithHymns extends Category {
  hymns: HymnWithRelations[];
}

export interface FavoriteWithHymn extends Favorite {
  hymn: HymnWithRelations;
}

// Special enum types
export type ThemeMode = 'light' | 'dark' | 'system';

export type UserRoleType = 'administrator' | 'editor' | 'standard' | 'guest';

export type SortOption = 'title_asc' | 'title_desc' | 'newest' | 'oldest' | 'relevance';

export interface ForumPost {
  id: string | number;
  title: string;
  content: string;
  user_id: string;
  hymn_id?: string | number;
  created_at: string;
  updated_at?: string;
  comment_count: number;
  like_count?: number;
  users?: {
    display_name?: string;
    email?: string;
  };
  hymns?: {
    id: string | number;
    title: string;
  };
}

export interface Comment {
  id: string | number;
  post_id: string | number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  likes?: number;
  dislikes?: number;
  user?: {
    display_name?: string;
    email?: string;
  };
}

export interface HymnSearchParams {
  query?: string;
  authorId?: number | string;
  themeId?: number | string;
  tagId?: number | string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'newest' | 'popular';
}

export interface ForumSearchParams {
  tagId?: string;
  hymnId?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'popular' | 'comments';
}

/**
 * Central type definitions for the application
 */

// Re-export types from specific files
export * from './users';
export * from './notifications';

export interface Author {
  id: string | number;
  name: string;
  bio?: string;
  birth_year?: number;
  death_year?: number;
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
}

export interface Theme {
  id: string | number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string | number;
  name: string;
  created_at?: string;
  updated_at?: string;
  hymn_count?: number;
}

export interface PdfFile {
  id: string | number;
  hymn_id: string | number;
  file_url: string;
  file_key?: string;
  title?: string;
  file_type?: string;
  size_bytes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Hymn {
  id: string | number;
  title: string;
  lyrics?: string;
  music_url?: string;
  video_url?: string;
  notes?: string;
  view_count?: number;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  authors?: Author[];
  themes?: Theme[];
  tags?: Tag[];
  pdf_files?: PdfFile[];
  audio_files?: AudioFile[];
  video_links?: VideoLink[];
  presentation_files?: PresentationFile[];
}

export interface HymnWithRelations extends Hymn {
  authors: Author[];
  categories: Category[];
  themes?: Theme[];
  pdf_files?: PdfFile[];
}

export interface HymnDetails extends Hymn {
  authors: Author[];
  categories: Category[];
  themes: Theme[];
  pdf_files: PdfFile[];
}

export interface HymnWithDetails extends HymnWithRelations {
  tags: Tag[];
}

export interface ForumPost {
  id: string | number;
  title: string;
  content: string;
  user_id: string;
  hymn_id?: string | number;
  created_at: string;
  updated_at?: string;
  comment_count: number;
  like_count?: number;
  users?: {
    display_name?: string;
    email?: string;
  };
  hymns?: {
    id: string | number;
    title: string;
  };
  tags?: Tag[];
}

export interface Comment {
  id: string | number;
  post_id: string | number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  likes?: number;
  dislikes?: number;
  user?: {
    display_name?: string;
    email?: string;
  };
  user_reaction?: 'like' | 'dislike' | null;
}

export interface HymnSearchParams {
  query?: string;
  authorId?: number | string;
  themeId?: number | string;
  tagId?: number | string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'newest' | 'popular';
}

export interface ForumSearchParams {
  tagId?: string;
  hymnId?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'popular' | 'comments';
}

export interface Report {
  id: string | number;
  reporter_id: string;
  content_type: 'post' | 'comment' | 'hymn' | 'user';
  content_id: string | number;
  reason: string;
  details?: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  reporter?: {
    display_name?: string;
    email?: string;
  };
  content?: any;
}

export interface Favorite {
  id: string | number;
  user_id: string;
  hymn_id: string | number;
  created_at: string;
  hymn?: HymnWithRelations;
}

export interface PaginationParams {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: PaginationParams;
  };
}

export interface RolePermission {
  id: string | number;
  role_id: string | number;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  allowed: boolean;
  created_at?: string;
  updated_at?: string;
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role_id?: number;
  roles?: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: number;
  name: string;
  permissions?: any;
}

// Hymn related types
export interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  authors?: Author[];
  themes?: Theme[];
  tags?: Tag[];
  pdf_files?: PdfFile[];
  audio_files?: AudioFile[];
  video_links?: VideoLink[];
  presentation_files?: PresentationFile[];
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at?: string;
}

export interface PdfFile {
  id: string;
  hymn_id: string;
  pdf_path: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AudioFile {
  id: string;
  hymn_id: string;
  audio_path: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VideoLink {
  id: string;
  hymn_id: string;
  video_url: string;
  source?: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PresentationFile {
  id: string;
  hymn_id: string;
  presentation_url: string;
  source?: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Forum related types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  hymn_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  users?: User;
  hymns?: Hymn;
  tags?: Tag[];
  comment_count?: number;
  like_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  users?: User;
  like_count?: number;
}

export interface Like {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  hymn_id?: string;
  created_at?: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  error: Error | null;
  session: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  updateProfile?: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

// App settings
export interface AppSettings {
  enableComments: boolean;
  enableFavorites: boolean;
  enableSharing: boolean;
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  siteTitle: string;
  siteDescription: string;
}

/**
 * Core application types based on database schema
 * This file centralizes type definitions derived from database tables
 */

// User related types
export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Record<string, boolean>;
  updated_at?: string;
}

// Hymn related types
export interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  view_count?: number;
  status?: 'approved' | 'pending' | 'rejected';
  authors?: Author[];
  themes?: Theme[];
  tags?: Tag[];
  pdf_files?: PdfFile[];
  audio_files?: AudioFile[];
  video_links?: VideoLink[];
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at?: string;
}

// File types
export interface PdfFile {
  id: string;
  hymn_id: string;
  pdf_path: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
  file_url?: string; // Computed property, not in DB
}

export interface AudioFile {
  id: string;
  hymn_id: string;
  audio_path: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VideoLink {
  id: string;
  hymn_id: string;
  video_url: string;
  source?: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Forum related types
export interface Post {
  id: string;
  title: string;
  content: string;
  hymn_id?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  author?: Profile;
  hymn?: Hymn;
  comments_count?: number;
  likes_count?: number;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  author?: Profile;
  likes_count?: number;
}

export interface Like {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  hymn_id?: string;
  created_at?: string;
}

// View tracking
export interface HymnView {
  hymn_id: string;
  user_id: string;
  viewed_at: string;
}

// Relation types with extended properties
export interface HymnWithRelations extends Hymn {
  // Additional computed or derived properties
  authorsList?: string; // Comma separated list of author names
  themesList?: string; // Comma separated list of theme names
  pdf_count?: number;   // Count of PDF files
}

// Common types for the application

// Basic entity types
export interface Author {
  id: string;
  name: string;
  bio?: string;
  birth_year?: number;
  death_year?: number;
  created_at?: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
}

// PDF file types
export interface PDFFile {
  id: string;
  hymn_id?: string;
  pdf_path: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  file_url?: string;
}

// Audio file types
export interface AudioFile {
  id: string;
  hymn_id?: string;
  audio_path: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
  file_url?: string;
}

// Video link types
export interface VideoLink {
  id: string;
  hymn_id?: string;
  video_url: string;
  source?: string;
  description?: string;
  uploaded_by?: string;
  created_at?: string;
}

// Basic hymn type
export interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  language?: string;
  year?: number;
  scripture_reference?: string;
  status?: 'published' | 'draft' | 'pending' | 'archived';
  created_at?: string;
  updated_at?: string;
  view_count?: number;
}

// Hymn with related entities
export interface HymnWithRelations extends Hymn {
  authors?: Author[];
  themes?: Theme[];
  tags?: Tag[];
  pdf_files?: PDFFile[];
  audio_files?: AudioFile[];
  video_links?: VideoLink[];
}

// Hymn search parameters
export interface HymnSearchParams {
  query?: string;
  authorId?: string;
  themeId?: string;
  tagId?: string;
  sortBy?: 'title' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// Forum related types
export interface Post {
  id: string;
  title: string;
  content: string;
  hymn_id?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
  comments?: any[];
  comment_count?: number;
  like_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

// User related types
export interface UserRole {
  id: number;
  name: string;
  description?: string;
}