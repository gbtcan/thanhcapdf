import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  size = 'medium'
}) => {
  const { theme, toggleTheme } = useTheme();
  
  const getIconSize = () => {
    switch (size) {
      case 'small': return 'h-4 w-4';
      case 'large': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };
  
  const getButtonSize = () => {
    switch (size) {
      case 'small': return 'p-1';
      case 'large': return 'p-3';
      default: return 'p-2';
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className={`${getButtonSize()} rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className={`${getIconSize()} text-gray-400 hover:text-yellow-500`} />
      ) : (
        <Moon className={`${getIconSize()} text-gray-500 hover:text-indigo-600`} />
      )}
      <span className="sr-only">
        {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
