import { User } from '../types/user';

export type Permission = 
  // Content permissions
  | 'content.create' 
  | 'content.read' 
  | 'content.update' 
  | 'content.delete'
  | 'content.publish'
  
  // User management permissions
  | 'users.create' 
  | 'users.read' 
  | 'users.update' 
  | 'users.delete'
  
  // System permissions
  | 'system.settings'
  | 'system.stats';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// Default permissions for different roles
const DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'content.create', 'content.read', 'content.update', 'content.delete', 'content.publish',
    'users.create', 'users.read', 'users.update', 'users.delete',
    'system.settings', 'system.stats'
  ],
  editor: [
    'content.create', 'content.read', 'content.update', 'content.publish'
  ],
  contributor: [
    'content.create', 'content.read', 'content.update'
  ],
  viewer: [
    'content.read'
  ]
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  // Super admin bypass all permission checks
  if (user.userProfile?.role === 'admin') return true;
  
  // Get user role and permissions
  const role = user.userProfile?.role || 'viewer';
  const userPermissions = user.userProfile?.permissions as Permission[] || DEFAULT_PERMISSIONS[role] || [];
  
  return userPermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: User | null | undefined): Permission[] {
  if (!user) return [];
  
  // Get user role and permissions
  const role = user.userProfile?.role || 'viewer';
  return user.userProfile?.permissions as Permission[] || DEFAULT_PERMISSIONS[role] || [];
}
