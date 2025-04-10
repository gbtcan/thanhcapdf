import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingPage from '../components/LoadingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  redirectTo = '/auth/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  // Đang kiểm tra trạng thái xác thực
  if (isLoading) {
    return <LoadingPage message="Đang xác thực..." />;
  }
  
  // Chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  
  // Kiểm tra quyền truy cập nếu cần
  if (requiredPermission && user?.permissions) {
    const hasPermission = user.permissions.includes(requiredPermission);
    if (!hasPermission) {
      return <Navigate to="/access-denied" replace />;
    }
  }
  
  // Đã xác thực và có đủ quyền truy cập
  return <>{children}</>;
};

export default ProtectedRoute;
