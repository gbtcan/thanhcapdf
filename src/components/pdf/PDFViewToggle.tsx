import React from 'react';
import { Grid, List } from 'lucide-react';

interface PDFViewToggleProps {
  viewMode: 'list' | 'grid';
  onChange: (mode: 'list' | 'grid') => void;
  className?: string;
}

/**
 * Toggle button to switch between list and grid views
 */
const PDFViewToggle: React.FC<PDFViewToggleProps> = ({ 
  viewMode, 
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex rounded-md border border-gray-200 dark:border-gray-700 ${className}`}>
      <button
        onClick={() => onChange('list')}
        className={`flex items-center justify-center p-2 ${
          viewMode === 'list'
            ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        title="List view"
        aria-label="List view"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center p-2 ${
          viewMode === 'grid'
            ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        title="Grid view"
        aria-label="Grid view"
      >
        <Grid className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PDFViewToggle;
