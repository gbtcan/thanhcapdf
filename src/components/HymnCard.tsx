import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Music, FileText, Eye } from 'lucide-react';
import { Hymn } from '../types';
import { useFavorite } from '../utils/hooks';

interface HymnCardProps {
  hymn: Hymn;
  showActions?: boolean;
}

const HymnCard: React.FC<HymnCardProps> = ({ hymn, showActions = true }) => {
  const { isFavorited, toggleFavorite, isLoading } = useFavorite(hymn.id);
  
  // Handle favorite click
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (!isLoading) {
      toggleFavorite();
    }
  };

  // Get first few lines of lyrics if available
  const getLyricsPreview = () => {
    if (!hymn.lyrics) return 'No lyrics available';
    
    const lines = hymn.lyrics.split('\n').filter(line => line.trim());
    const preview = lines.slice(0, 3).join('\n');
    
    if (lines.length > 3) {
      return `${preview}\n...`;
    }
    
    return preview;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/hymns/${hymn.id}`} className="block">
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
            {hymn.title}
          </h3>
          
          {hymn.authors && hymn.authors.length > 0 && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              By {hymn.authors.map((author, idx) => (
                <span key={author.id}>
                  {idx > 0 && ", "}
                  {author.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Categories tags */}
          {hymn.categories && hymn.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {hymn.categories.slice(0, 3).map(category => (
                <span 
                  key={category.id}
                  className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                >
                  {category.name}
                </span>
              ))}
              {hymn.categories.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  +{hymn.categories.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {/* Lyrics preview */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-serif whitespace-pre-line line-clamp-3">
            {getLyricsPreview()}
          </div>
          
          {/* Stats & actions */}
          <div className="mt-4 flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{hymn.view_count || 0}</span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>{hymn.pdf_files?.length || 0} files</span>
              </div>
            </div>
            
            {/* Actions */}
            {showActions && (
              <div className="flex space-x-2">
                <button
                  onClick={handleFavorite}
                  className={`p-1.5 rounded-full ${
                    isFavorited
                      ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400'
                      : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 dark:hover:text-pink-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span className="sr-only">
                    {isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HymnCard;
