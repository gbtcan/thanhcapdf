import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'administrator' | 'editor' | string[];
}

/**
 * Route component that restricts access to admin users only
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredRole = 'administrator'
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="large" message="Verifying admin access..." />
      </div>
    );
  }

  // First, check if user is authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // Then check if user has the required role
  const hasRequiredRole = 
    // If requiredRole is a string, check if userRole matches
    (typeof requiredRole === 'string' && userRole === requiredRole) ||
    // If requiredRole is an array, check if userRole is in the array
    (Array.isArray(requiredRole) && userRole && requiredRole.includes(userRole));

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has the required role, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
