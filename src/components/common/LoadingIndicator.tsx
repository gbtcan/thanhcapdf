import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  // Size mapping for the spinner
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${sizeClasses[size]}`}></div>
      {message && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
