import React from 'react';
import { Link } from 'react-router-dom';
import { Music, FileText, Calendar, Eye, Tag } from 'lucide-react';
import { HymnWithRelations } from '../../types';
import { formatDate } from '../../utils/formatters';

interface HymnCardProps {
  hymn: HymnWithRelations;
  className?: string;
  showActions?: boolean;
}

const HymnCard: React.FC<HymnCardProps> = ({
  hymn,
  className = '',
  showActions = true
}) => {
  // Format authors list
  const authorNames = hymn.authors?.map(author => author.name).join(', ') || 'Unknown Author';
  
  // Format themes list
  const themeNames = hymn.themes?.map(theme => theme.name).join(', ') || 'No themes';
  
  // Count PDFs and other files
  const pdfCount = hymn.pdf_files?.length || 0;
  
  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <Link to={`/hymns/${hymn.id}`} className="block p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {hymn.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {authorNames}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {hymn.themes?.slice(0, 3).map(theme => (
                <span 
                  key={theme.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {theme.name}
                </span>
              ))}
              
              {hymn.themes && hymn.themes.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  +{hymn.themes.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 mt-1">
            <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
              {pdfCount > 0 && (
                <div className="flex items-center" title={`${pdfCount} PDF file${pdfCount !== 1 ? 's' : ''}`}>
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{pdfCount}</span>
                </div>
              )}
              
              {hymn.view_count !== undefined && (
                <div className="flex items-center" title={`${hymn.view_count} view${hymn.view_count !== 1 ? 's' : ''}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{hymn.view_count}</span>
                </div>
              )}
              
              {hymn.created_at && (
                <div className="flex items-center" title={`Added on ${formatDate(hymn.created_at)}`}>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(hymn.created_at, { dateStyle: 'short' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {hymn.lyrics && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {hymn.lyrics.substring(0, 150)}...
            </p>
          </div>
        )}
      </Link>
      
      {showActions && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">
              {themeNames}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              View details →
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HymnCard;
