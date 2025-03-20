import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  center?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  message,
  className = '',
  center = false
}) => {
  // Size mappings
  const sizeMap = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  const wrapperClasses = center 
    ? `flex flex-col items-center justify-center ${className}`
    : `flex flex-col items-center ${className}`;

  return (
    <div className={wrapperClasses}>
      <Loader className={`${sizeMap[size]} text-indigo-600 dark:text-indigo-400 animate-spin`} />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
};

export default LoadingIndicator;
