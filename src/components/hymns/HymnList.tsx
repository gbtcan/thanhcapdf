import React from 'react';
import HymnCard from './HymnCard';
import { HymnWithRelations } from '../../types';
import { Book } from 'lucide-react';

interface HymnListProps {
  hymns: HymnWithRelations[];
  emptyMessage?: string;
  isLoading?: boolean;
  layout?: 'grid' | 'list';
  className?: string;
}

const HymnList: React.FC<HymnListProps> = ({
  hymns,
  emptyMessage = 'No hymns found',
  isLoading = false,
  layout = 'grid',
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="p-6 animate-pulse">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
            </div>
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hymns.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Book className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">{emptyMessage}</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {hymns.map(hymn => (
          <HymnCard key={hymn.id} hymn={hymn} />
        ))}
      </div>
    );
  }

  // List layout
  return (
    <div className={`space-y-4 ${className}`}>
      {hymns.map(hymn => (
        <HymnCard
          key={hymn.id}
          hymn={hymn}
          className="border border-gray-100 dark:border-gray-700"
        />
      ))}
    </div>
  );
};

export default HymnList;
