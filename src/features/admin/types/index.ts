/**
 * Types for the admin feature
 */

export interface AdminDashboardStats {
  totalHymns: number;
  totalUsers: number;
  totalAuthors: number;
  totalThemes: number;
  totalViews: number;
  totalComments: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: 'hymn' | 'user' | 'author' | 'theme' | 'tag' | 'comment';
  entity_id: string;
  created_at: string;
  details?: Record<string, any>;
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface HymnFormData {
  id?: string;
  title: string;
  lyrics?: string;
  authors: string[];
  themes: string[];
  tags?: string[];
}

export interface AdminFilter {
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export type UserRole = 'administrator' | 'editor' | 'user';

export interface UserRoleUpdate {
  userId: string;
  roleId: number;
}
