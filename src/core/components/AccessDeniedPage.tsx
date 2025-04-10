import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const AccessDeniedPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 shadow-md">
          <ShieldAlert className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quyền truy cập bị từ chối
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Bạn không có quyền truy cập vào trang này.
            {!isAuthenticated && ' Vui lòng đăng nhập với tài khoản có quyền truy cập.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
            
            {!isAuthenticated && (
              <Button variant="outline" asChild>
                <Link to="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
