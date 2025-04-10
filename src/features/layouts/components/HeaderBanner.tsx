import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';

interface HeaderBannerProps {
  showBanner?: boolean;
  onClose?: () => void;
  variant?: 'default' | 'info' | 'warning' | 'promotion';
  title: string;
  description?: string;
  actionText?: string;
  actionUrl?: string;
}

const HeaderBanner: React.FC<HeaderBannerProps> = ({
  showBanner = true,
  onClose,
  variant = 'default',
  title,
  description,
  actionText,
  actionUrl,
}) => {
  if (!showBanner) {
    return null;
  }

  // Banner style variants
  const variantStyles = {
    default: 'bg-indigo-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-amber-500 text-white',
    promotion: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
  };
  
  return (
    <div className={`relative ${variantStyles[variant]}`}>
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <div className="mr-3">
              {/* Decorative pattern */}
              <svg
                className="h-6 w-6 text-white opacity-70"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center">
              <p className="font-medium">
                {title}
              </p>
              {description && (
                <p className="mt-1 sm:mt-0 sm:ml-2 text-sm opacity-90">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 sm:mt-0 sm:ml-4 flex items-center space-x-3">
            {actionText && actionUrl && (
              <a 
                href={actionUrl}
                className="flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
              >
                {actionText}
              </a>
            )}
            {onClose && (
              <button
                type="button"
                className="flex p-1.5 rounded-md hover:bg-indigo-500 hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Đóng</span>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;
