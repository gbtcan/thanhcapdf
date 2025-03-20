import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryBadgeProps {
  category: Category;
  linkCategory?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  linkCategory = true,
  size = 'medium'
}) => {
  // Get the appropriate CSS classes based on size
  const getSizeClasses = (): string => {
    switch (size) {
      case 'small':
        return 'px-2 py-0.5 text-xs';
      case 'large':
        return 'px-4 py-2 text-sm';
      case 'medium':
      default:
        return 'px-3 py-1 text-sm';
    }
  };
  
  // Base classes for the badge
  const baseClasses = `inline-flex items-center rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${getSizeClasses()}`;
  
  if (linkCategory) {
    return (
      <Link to={`/hymns?category=${category.id}`} className={`${baseClasses} hover:bg-blue-200 dark:hover:bg-blue-800`}>
        {category.name}
      </Link>
    );
  }
  
  return <span className={baseClasses}>{category.name}</span>;
};

export default CategoryBadge;
