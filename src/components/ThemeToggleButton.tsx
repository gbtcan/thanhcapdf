import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'minimal';
}

/**
 * Toggle button for switching between light and dark themes
 */
const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  className = '',
  size = 'medium',
  variant = 'icon'
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Icon sizes
  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };
  
  // Button sizes
  const buttonSizes = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };
  
  // Get classes based on variant
  const getButtonClasses = () => {
    switch (variant) {
      case 'button':
        return `${buttonSizes[size]} flex items-center space-x-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`;
      case 'minimal':
        return `${buttonSizes[size]} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ${className}`;
      case 'icon':
      default:
        return `${buttonSizes[size]} rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white ${className}`;
    }
  };
  
  // Render based on variant
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={getButtonClasses()}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <>
            <Sun className={iconSizes[size]} />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className={iconSizes[size]} />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }
  
  // Icon or minimal variant
  return (
    <button
      onClick={toggleTheme}
      className={getButtonClasses()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={iconSizes[size]} />
      ) : (
        <Moon className={iconSizes[size]} />
      )}
    </button>
  );
};

export default ThemeToggleButton;
