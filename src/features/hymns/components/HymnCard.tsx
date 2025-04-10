import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Music, Users } from 'lucide-react';
import { Card, CardContent } from '../../../core/components/ui/card';
import { cn } from '../../../lib/utils';
import { useStableObject } from '../../../core/hooks';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';
import { useHymnAuthors } from '../utils/useHymnAuthors';

interface HymnCardProps {
  hymn: {
    id: string;
    title: string;
    number?: number;
    view_count?: number;
    authors?: { author: {id: string; name: string} }[];
  };
  className?: string;
  showFavorite?: boolean;
}

interface Author {
  id: string;
  name: string;
}

const HymnCard: React.FC<HymnCardProps> = ({ hymn, className, showFavorite = true }) => {
  // Optimize to prevent unnecessary re-renders when hymn object reference changes but content is the same
  const stableHymn = useStableObject(hymn);
  
  // Nếu authors đã được cung cấp qua props, sử dụng nó
  // Nếu không, tải thông tin tác giả bằng hook
  const hasAuthorsFromProps = stableHymn.authors && stableHymn.authors.length > 0;
  const { authorMap = {} as Record<string, Author[]> } = !hasAuthorsFromProps ? useHymnAuthors(stableHymn.id) : { authorMap: {} };
  
  // Lấy danh sách tác giả từ props hoặc từ hook
  const authors = hasAuthorsFromProps && stableHymn.authors 
    ? stableHymn.authors.map(a => a.author) 
    : (authorMap[stableHymn.id] || []);
  
  // Hiển thị tên tác giả đầu tiên nếu có
  const authorName = authors.length > 0 ? authors[0].name : '';
  
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      {/* Card wrapped in Link instead of nested Links */}
      <Link to={`/hymns/${stableHymn.id}`} className="block">
        <div className="h-32 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <Music className="h-12 w-12 text-indigo-400 dark:text-indigo-600" />
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="block font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {stableHymn.title}
            </span>
            
            {showFavorite && (
              <div onClick={(e) => e.stopPropagation()}>
                <FavoriteButton hymnId={stableHymn.id} size="sm" showLabel={false} />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-600 dark:text-gray-400 flex items-center">
              {authorName && (
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                  <Users className="h-3.5 w-3.5 mr-1" />
                  <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {authorName}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              <span>{stableHymn.view_count?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default HymnCard;
