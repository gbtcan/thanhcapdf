import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

/**
 * Loading indicator component for pages or sections
 */
const PageLoadingIndicator: React.FC<PageLoadingIndicatorProps> = ({
  message = 'Loading...',
  size = 'md',
  fullPage = false
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const container = fullPage
    ? 'h-screen w-screen fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={container}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClass[size]} animate-spin text-indigo-600`} />
        {message && (
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageLoadingIndicator;
