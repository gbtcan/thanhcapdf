import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'default',
  fullWidth = false,
  size = 'medium'
}) => {
  // Handle tab click
  const handleTabClick = (tabId: string, disabled: boolean = false) => {
    if (!disabled) {
      onChange(tabId);
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs py-1.5 px-2.5';
      case 'large':
        return 'text-base py-3 px-5';
      default: // medium
        return 'text-sm py-2 px-4';
    }
  };

  // Get variant-specific styles
  const getTabStyles = (isActive: boolean, disabled: boolean = false) => {
    const sizeClass = getSizeClasses();
    const baseClass = `${
      fullWidth ? 'flex-1 text-center' : ''
    } font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${sizeClass}`;
    
    if (disabled) {
      return `${baseClass} cursor-not-allowed opacity-50`;
    }

    switch (variant) {
      case 'pills':
        return `${baseClass} ${
          isActive
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
        }`;
      case 'underline':
        return `${baseClass} ${
          isActive
            ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent'
        } px-1 py-3`;
      default: // default variant
        return `${baseClass} ${
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`;
    }
  };

  // Get container styles
  const getContainerStyles = () => {
    if (variant === 'underline') {
      return `flex space-x-4 border-b border-gray-200 dark:border-gray-700 ${className}`;
    }
    if (variant === 'pills') {
      return `flex ${fullWidth ? 'w-full' : 'space-x-2'} ${className}`;
    }
    return `flex ${fullWidth ? 'w-full' : 'space-x-1'} bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ${className}`;
  };

  return (
    <div className={getContainerStyles()}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id, tab.disabled)}
          className={getTabStyles(activeTab === tab.id, tab.disabled)}
          disabled={tab.disabled}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 ${
              activeTab === tab.id 
                ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200' 
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            } text-xs font-medium rounded-full px-2 py-0.5`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
