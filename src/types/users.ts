/**
 * User-related type definitions for the Catholic Hymns App
 */

export interface BaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface User extends BaseUser {
  display_name: string;
  avatar_url?: string;
  role_id?: number;
  is_locked?: boolean;
  theme?: string;
  email_notifications?: boolean;
  roles?: Role;
}

export interface Role {
  id: number;
  name: string;
  permissions?: Record<string, boolean>;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser extends BaseUser {
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
    [key: string]: any;
  };
}

export interface AuthState {
  user: User | null;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole?: UserRole;
  permissions?: UserPermissions;
}

export type UserRole = 'administrator' | 'editor' | 'contributor' | 'member' | 'user' | undefined;

export interface UserPermissions {
  canCreateHymns: boolean;
  canEditHymns: boolean;
  canDeleteHymns: boolean;
  canApproveHymns: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageSettings: boolean;
  [key: string]: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  created_at: string;
  updated_at: string | null;
  last_login: string | null;
  role_id: number | null;
}

export interface UserRole {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  font_size: 'small' | 'medium' | 'large';
  language: string;
  enable_notifications: boolean;
  display_mode: 'default' | 'compact';
  created_at: string;
  updated_at: string | null;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  mobile_push_notifications: boolean;
  comment_notifications: boolean;
  reply_notifications: boolean;
  mention_notifications: boolean;
  favorite_notifications: boolean;
  hymn_status_notifications: boolean;
  post_liked_notifications: boolean;
  system_notifications: boolean;
  digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
}

export interface UserContribution {
  id: string;
  user_id: string;
  hymn_id: string | null;
  content_type: 'hymn' | 'translation' | 'sheet_music' | 'audio' | 'correction';
  status: 'pending' | 'approved' | 'rejected';
  content: any;
  created_at: string;
  updated_at: string | null;
}

export interface UserWithProfile {
  id: string;
  email: string;
  role: UserRole | null;
  profile: UserProfile;
  settings: UserSettings | null;
  notification_preferences: NotificationPreferences | null;
}

export interface UserBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserWithBadges extends UserWithProfile {
  badges: UserBadge[];
}

export type UserPermissions = {
  create_hymns: boolean;
  edit_hymns: boolean;
  delete_hymns: boolean;
  manage_users: boolean;
  manage_roles: boolean;
  manage_settings: boolean;
  approve_contributions: boolean;
  view_analytics: boolean;
}

export type UserRoleName = 
  | 'administrator'
  | 'editor'
  | 'contributor'
  | 'moderator'
  | 'standard'
  | 'guest';
