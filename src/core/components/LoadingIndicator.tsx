import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Đang tải...',
  size = 'md',
  center = true
}) => {
  const sizeClassMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const containerClass = center
    ? 'flex flex-col items-center justify-center py-8'
    : 'flex flex-col items-center py-6';
    
  return (
    <div className={containerClass}>
      <Loader2 className={`${sizeClassMap[size]} animate-spin text-indigo-600 mb-2`} />
      {message && (
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};

export default LoadingIndicator;
