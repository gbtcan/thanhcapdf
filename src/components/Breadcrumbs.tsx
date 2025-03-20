import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

/**
 * Breadcrumb navigation component
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = '/',
  className = ''
}) => {
  // Add home item at the beginning
  const allItems = [
    { label: 'Home', href: homeHref, icon: <Home className="h-4 w-4" /> },
    ...items
  ];

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          // Determine element type: Link for navigable items, span for current/last item
          const Element = !isLast && item.href ? Link : 'span';
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-1" />
              )}
              
              <Element 
                {...(!isLast && item.href ? { to: item.href } : {})}
                className={`flex items-center text-sm ${
                  isLast 
                    ? 'font-medium text-gray-700 dark:text-gray-300' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                {item.label}
              </Element>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
