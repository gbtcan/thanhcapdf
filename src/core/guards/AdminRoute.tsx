import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingPage from '../components/LoadingPage';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Đang kiểm tra trạng thái xác thực
  if (isLoading) {
    return <LoadingPage message="Đang xác thực..." />;
  }
  
  // Kiểm tra xem người dùng có phải là admin không
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('admin');
  
  if (!user || !isAdmin) {
    return <Navigate to="/access-denied" state={{ from: location.pathname }} replace />;
  }
  
  // Người dùng là admin
  return <>{children}</>;
};

export default AdminRoute;
