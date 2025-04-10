import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingPageProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = 'Đang tải dữ liệu...', 
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center p-4'
    : 'min-h-[300px] flex items-center justify-center p-4';
  
  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          {message}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Vui lòng đợi trong giây lát...
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
