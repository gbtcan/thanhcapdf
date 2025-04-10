import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Heart, Eye, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Badge } from '../../../core/components/ui/badge';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';

interface MusicCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  viewCount?: number;
  authorName?: string;
  authorId?: string;
  className?: string;
  showFavorite?: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({
  id,
  title,
  imageUrl,
  viewCount,
  authorName,
  authorId,
  className,
  showFavorite = true,
}) => {
  return (
    <div className={cn(
      "relative group bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <Link to={`/hymns/${id}`} className="block">
        {/* Card Top - Image/Preview */}
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>
      </Link>
      
      {/* Card Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/hymns/${id}`} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            <h3 className="font-medium line-clamp-1" title={title}>
              {title}
            </h3>
          </Link>
          
          {showFavorite && (
            <FavoriteButton hymnId={id} size="sm" showLabel={false} />
          )}
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          {authorName && (
            <Link 
              to={authorId ? `/authors/${authorId}` : '#'} 
              className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Users className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[120px]">{authorName}</span>
            </Link>
          )}
          
          {viewCount !== undefined && (
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{viewCount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
