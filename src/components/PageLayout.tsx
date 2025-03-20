import React from 'react';
import { Helmet } from 'react-helmet-async';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  fullWidth?: boolean;
  showAlert?: React.ReactNode;
}

/**
 * Consistent page layout with metadata and breadcrumbs
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  breadcrumbs,
  className = '',
  fullWidth = false,
  showAlert
}) => {
  const appName = import.meta.env.VITE_APP_NAME || 'Catholic Hymns Library';
  const fullTitle = `${title} | ${appName}`;
  
  return (
    <>
      {/* Page metadata */}
      <Helmet>
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      
      <div className={`px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
        <div className={fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}>
          {/* Breadcrumbs if provided */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-4">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          )}
          
          {/* Alert banner if provided */}
          {showAlert && (
            <div className="mb-6">
              {showAlert}
            </div>
          )}
          
          {/* Main content */}
          {children}
        </div>
      </div>
    </>
  );
};

export default PageLayout;
