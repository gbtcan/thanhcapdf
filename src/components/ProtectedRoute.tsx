import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * Route component that restricts access to authenticated users
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading, permissions } = useAuth();
  const location = useLocation();

  // Show loading state while auth status is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingIndicator size="medium" message="Verifying access..." />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Redirect to login page and save the location they tried to access
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // If specific permission is required, check for it
  if (requiredPermission && permissions) {
    const hasPermission = permissions[requiredPermission as keyof typeof permissions];
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated (and has required permission if specified), render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;