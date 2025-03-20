import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, User, ChevronRight, Music } from 'lucide-react';
import { getPopularHymns } from '../../lib/services/hymnService';
import LoadingIndicator from '../common/LoadingIndicator';

const FeaturedHymns: React.FC = () => {
  // Fetch popular hymns with error handling
  const { data: hymns, isLoading, error } = useQuery({
    queryKey: ['popular-hymns'],
    queryFn: async () => {
      try {
        return await getPopularHymns(5);
      } catch (err) {
        console.error('Error loading popular hymns:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false // Don't retry on error
  });
  
  // If there's an error or no hymns, don't show the section
  if ((error || !hymns || hymns.length === 0) && !isLoading) {
    return null;
  }
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popular Hymns</h2>
            <p className="mt-2 text-lg text-gray-600">
              Our most viewed and downloaded hymns
            </p>
          </div>
          <Link
            to="/hymns"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 hover:text-indigo-900"
          >
            View all hymns
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingIndicator size="large" message="Loading popular hymns..." />
          </div>
        ) : hymns && hymns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hymns.map((hymn) => (
              <Link
                key={hymn.id}
                to={`/hymns/${hymn.id}`}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {hymn.title}
                  </h3>
                  
                  {/* Display authors if available */}
                  {hymn.authors && hymn.authors.length > 0 && (
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <User className="h-4 w-4 mr-2" />
                      <span>{hymn.authors.map(a => a.name).join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Display preview of lyrics if available */}
                  {hymn.lyrics && (
                    <p className="text-gray-600 line-clamp-3 mb-4 text-sm">
                      {hymn.lyrics}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{hymn.view_count || 0} views</span>
                    </div>
                    
                    {/* Count PDF files if available */}
                    {hymn.pdf_files && hymn.pdf_files.length > 0 && (
                      <div className="flex items-center text-indigo-600">
                        <Music className="h-4 w-4 mr-1" />
                        <span>{hymn.pdf_files.length} sheet{hymn.pdf_files.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No featured hymns available yet</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHymns;
