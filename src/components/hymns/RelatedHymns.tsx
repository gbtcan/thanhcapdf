import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Music, ArrowRight } from 'lucide-react';
import { fetchRelatedHymns } from '../../lib/hymnService';
import LoadingIndicator from '../LoadingIndicator';

interface RelatedHymnsProps {
  hymnId: string;
  themeIds?: string[];
  authorIds?: string[];
  limit?: number;
  className?: string;
}

const RelatedHymns: React.FC<RelatedHymnsProps> = ({
  hymnId,
  themeIds = [],
  authorIds = [],
  limit = 5,
  className = ''
}) => {
  // Fetch related hymns
  const { data: relatedHymns, isLoading, error } = useQuery({
    queryKey: ['related-hymns', hymnId, themeIds, authorIds],
    queryFn: () => fetchRelatedHymns(hymnId, { themeIds, authorIds, limit }),
    enabled: !!hymnId && (themeIds.length > 0 || authorIds.length > 0)
  });
  
  // If no filters provided or no results
  if ((!themeIds.length && !authorIds.length) || 
      (!isLoading && !error && (!relatedHymns || relatedHymns.length === 0))) {
    return null;
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Related Hymns</h3>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <LoadingIndicator size="small" center message="Loading related hymns..." />
        ) : error ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
            Failed to load related hymns
          </p>
        ) : relatedHymns && relatedHymns.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {relatedHymns.map(hymn => (
              <li key={hymn.id} className="py-3 first:pt-0 last:pb-0">
                <Link 
                  to={`/hymns/${hymn.id}`} 
                  className="flex items-start group"
                >
                  <Music className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div className="ml-3 flex-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {hymn.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hymn.authors?.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
            No related hymns found
          </p>
        )}
        
        {/* Link to browse more */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Link 
            to="/hymns" 
            className="flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Browse more hymns
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelatedHymns;
