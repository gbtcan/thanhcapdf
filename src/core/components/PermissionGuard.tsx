import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '../../lib/permissions';

interface PermissionGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  anyOf, 
  allOf, 
  children, 
  fallback = null 
}) => {
  const { user } = useAuth();
  
  let hasAccess = true;
  
  if (permission) {
    hasAccess = hasPermission(user, permission);
  }
  
  if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(user, anyOf);
  }
  
  if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(user, allOf);
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
