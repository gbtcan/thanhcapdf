import React from 'react';
import { Link } from 'react-router-dom';
import { HymnWithRelations } from '../types';
import { FavoriteButton } from '../../favorites/components';
import { Music, User } from 'lucide-react';
import { Card, CardContent } from '../../../core/components/ui/card';

interface Hymn {
  id: string;
  title: string;
  subtitle?: string;
  number?: number;
  slug?: string;
}

interface HymnsGridProps {
  hymns: HymnWithRelations[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const HymnsGrid: React.FC<HymnsGridProps> = ({ 
  hymns, 
  isLoading = false,
  emptyMessage = 'Không tìm thấy thánh ca nào.'
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (hymns.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Music className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
          {emptyMessage}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {hymns.map((hymn) => (
        <Link 
          key={hymn.id} 
          to={`/hymns/${hymn.slug || hymn.id}`}
        >
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <h3 className="text-lg font-medium mb-1">{hymn.title}</h3>
              {hymn.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {hymn.subtitle}
                </p>
              )}
              {hymn.number && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  #{hymn.number}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default HymnsGrid;
