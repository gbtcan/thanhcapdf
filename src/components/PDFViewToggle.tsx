import React from 'react';
import { Grid, List } from 'lucide-react';

interface PDFViewToggleProps {
  viewMode: 'list' | 'grid';
  onChange: (mode: 'list' | 'grid') => void;
  className?: string;
}

const PDFViewToggle: React.FC<PDFViewToggleProps> = ({
  viewMode,
  onChange,
  className = ''
}) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`px-3 py-2 text-sm font-medium rounded-l-md border border-gray-300 
          ${viewMode === 'list' 
            ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
            : 'bg-white text-gray-700 hover:bg-gray-50'}`}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </button>
      
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`px-3 py-2 text-sm font-medium rounded-r-md border border-gray-300 
          ${viewMode === 'grid' 
            ? 'bg-indigo-50 text-indigo-600 border-indigo-300' 
            : 'bg-white text-gray-700 hover:bg-gray-50'}`}
      >
        <Grid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </button>
    </div>
  );
};

export default PDFViewToggle;
