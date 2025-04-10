/**
 * Types for User domain
 */

export interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  auth_user_id?: string;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
  permissions: any;
  created_at?: string;
  updated_at?: string;
}

export interface UnifiedUser {
  created_at?: string;
  role?: string;
}

export interface UserWithRoles extends Profile {
  role?: Role;
}

export interface AuthUser {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  roles?: {
    id: number;
    name: string;
    permissions: string[];
  };
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

export enum UserRole {
  ANONYMOUS = 'anonymous',
  USER = 'user',
  EDITOR = 'editor',
  ADMIN = 'administrator'
}

export interface RegisterFormData {
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
