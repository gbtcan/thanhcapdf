import React from 'react';

type BadgeColor = 
  | 'primary' 
  | 'secondary'
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info'
  | 'neutral'
  | 'purple'
  | 'blue'
  | 'green'
  | 'indigo' 
  | 'gray';

type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  size = 'medium',
  rounded = true,
  className = '',
}) => {
  const getColorClasses = (color: BadgeColor) => {
    switch (color) {
      case 'primary':
        return 'bg-indigo-100 text-indigo-800';
      case 'secondary':
        return 'bg-purple-100 text-purple-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800';
      case 'gray':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = (size: BadgeSize) => {
    switch (size) {
      case 'small':
        return 'px-2 py-0.5 text-xs';
      case 'medium':
        return 'px-2.5 py-0.75 text-sm';
      case 'large':
        return 'px-3 py-1 text-base';
    }
  };

  const baseClasses = 'inline-flex items-center font-medium';
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`${baseClasses} ${roundedClasses} ${colorClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
