import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Music, Book, Plus } from 'lucide-react';
import { fetchHymns } from '../lib/hymnService';
import PageLayout from '../components/PageLayout';
import HymnSearch from '../components/hymns/HymnSearch';
import HymnList from '../components/hymns/HymnList';
import LoadingIndicator from '../components/LoadingIndicator';
import AlertBanner from '../components/AlertBanner';
import { HymnSearchParams } from '../types/hymns';
import { useAuth } from '../contexts/AuthContext';

const Hymns: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<HymnSearchParams>({
    query: searchParams.get('q') || undefined,
    authorId: searchParams.get('authorId') || undefined,
    themeId: searchParams.get('themeId') || undefined,
    tagId: searchParams.get('tagId') || undefined,
    sortBy: (searchParams.get('sortBy') as 'title' | 'newest' | 'popular') || 'title',
    page: currentPage,
    limit: 10
  });
  
  // Fetch hymns based on search query
  const { data, isLoading, error } = useQuery({
    queryKey: ['hymns', searchQuery],
    queryFn: () => fetchHymns(searchQuery),
    keepPreviousData: true
  });

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery.query) params.set('q', searchQuery.query);
    if (searchQuery.authorId) params.set('authorId', searchQuery.authorId);
    if (searchQuery.themeId) params.set('themeId', searchQuery.themeId);
    if (searchQuery.tagId) params.set('tagId', searchQuery.tagId);
    if (searchQuery.sortBy !== 'title') params.set('sortBy', searchQuery.sortBy!);
    
    setSearchParams(params);
  }, [searchQuery, setSearchParams]);
  
  // Handle search submission
  const handleSearch = (params: HymnSearchParams) => {
    setCurrentPage(1);
    setSearchQuery({
      ...params,
      page: 1,
      limit: 10
    });
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchQuery(prev => ({
      ...prev,
      page
    }));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calculate total pages
  const totalPages = data ? Math.ceil(data.totalCount / 10) : 0;
  
  return (
    <PageLayout 
      title="Hymns" 
      description="Browse and search Catholic hymns by title, author, theme, and more"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catholic Hymns</h1>
            <p className="mt-1 text-gray-600">
              Browse our collection of hymns with sheet music and lyrics
            </p>
          </div>
          
          {/* Add new hymn button (admins and moderators only) */}
          {isAuthenticated && (userRole === 'administrator' || userRole === 'moderator') && (
            <a 
              href="/admin/hymns/new" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Hymn
            </a>
          )}
        </div>
        
        {/* Search and filters */}
        <HymnSearch 
          onSearch={handleSearch}
          initialSearchParams={searchQuery}
        />
        
        {/* Hymn list */}
        <div>
          {error ? (
            <AlertBanner
              type="error"
              title="Error"
              message="Failed to load hymns. Please try again later."
            />
          ) : isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingIndicator size="large" message="Loading hymns..." />
            </div>
          ) : data && data.hymns.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {data.totalCount} {data.totalCount === 1 ? 'hymn' : 'hymns'} found
              </div>
              <HymnList hymns={data.hymns} />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md mr-2 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-3 py-2 border rounded-md ${
                            currentPage === i + 1
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md ml-2 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hymns found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Hymns;
