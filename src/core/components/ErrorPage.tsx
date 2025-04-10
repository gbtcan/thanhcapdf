import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorPageProps {
  message?: string;
  error?: Error;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message, error }) => {
  // Nếu component được sử dụng bởi errorElement của React Router,
  // lấy lỗi từ hook useRouteError
  const routeError = useRouteError();
  
  // Xử lý lỗi từ nguồn khác nhau
  const errorMessage = message || 
    (error?.message) ||
    (routeError instanceof Error ? routeError.message : 
    (typeof routeError === 'object' && routeError !== null && 'statusText' in routeError) 
      ? (routeError as any).statusText
      : 'Đã xảy ra lỗi không xác định');
  
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 shadow-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Đã xảy ra lỗi
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {errorMessage}
          </p>
          
          {/* Hiện thông tin chi tiết về lỗi trong môi trường phát triển */}
          {isDevelopment && (error || routeError) && (
            <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-left overflow-auto">
              <p className="text-sm font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">
                {error?.stack || 
                 (routeError instanceof Error ? routeError.stack : 
                  JSON.stringify(routeError, null, 2))}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tải lại trang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
