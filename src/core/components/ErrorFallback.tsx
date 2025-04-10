import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  message?: string;
  showHome?: boolean;
  showRefresh?: boolean;
}

/**
 * Generic error fallback component for error boundaries
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = 'Có lỗi xảy ra trong quá trình tải dữ liệu.',
  showHome = true,
  showRefresh = true
}) => {
  const isDevelopment = import.meta.env.DEV;
  
  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center justify-center text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
        Đã Xảy Ra Lỗi
      </h3>
      
      <p className="text-sm text-red-700 dark:text-red-200 mb-4">{message}</p>
      
      {/* Display error details in development */}
      {isDevelopment && error && (
        <div className="mt-2 mb-4 bg-white dark:bg-gray-800 p-3 rounded-md text-left w-full max-w-lg overflow-auto text-sm">
          <p className="font-mono text-red-800 dark:text-red-300">{error.message}</p>
          {error.stack && (
            <pre className="mt-2 text-xs text-gray-700 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      )}
      
      <div className="mt-4 flex space-x-3">
        {showRefresh && resetErrorBoundary && (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={resetErrorBoundary}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Thử lại
          </button>
        )}
        
        {showHome && (
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Home className="h-4 w-4 mr-1" />
            Trang chủ
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
