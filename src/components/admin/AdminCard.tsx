import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface AdminCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  footerLink?: {
    text: string;
    to: string;
  };
  className?: string;
  loading?: boolean;
}

/**
 * A consistent card component for the admin interface
 */
const AdminCard: React.FC<AdminCardProps> = ({
  title,
  children,
  footer,
  footerLink,
  className = '',
  loading = false
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {title}
          {loading && (
            <span className="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-gray-400 animate-spin"></span>
          )}
        </h3>
      </div>
      
      <div className="p-6">
        {children}
      </div>
      
      {(footer || footerLink) && (
        <div className="bg-gray-50 dark:bg-gray-750 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          {footer || (
            <div className="text-sm">
              <Link 
                to={footerLink!.to} 
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
              >
                {footerLink!.text}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminCard;
