import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import HymnList from '../../components/hymns/HymnList';
import HymnSearch from '../../components/hymns/HymnSearch';
import { searchHymns } from '../../utils/searchUtils';
import { HymnWithRelations } from '../../types';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;
  
  // Execute search when query changes
  const { data, isLoading, error } = useQuery({
    queryKey: ['hymn-search', searchQuery],
    queryFn: () => searchQuery ? searchHymns(searchQuery) : Promise.resolve([]),
    enabled: searchQuery.length > 1
  });
  
  // Calculate pagination data
  const totalResults = data?.length || 0;
  const totalPages = Math.ceil(totalResults / PAGE_SIZE);
  const paginatedData = data?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  
  const handleSearch = (params: any) => {
    setSearchQuery(params.query || '');
    setCurrentPage(1);
    
    // Update URL parameters
    if (params.query) {
      setSearchParams({ q: params.query });
    } else {
      setSearchParams({});
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <PageLayout 
      title="Search Hymns" 
      description="Search for Catholic hymns by keywords, author, theme, or tags"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Hymns</h1>
          <p className="mt-1 text-gray-600">
            Find hymns by title, lyrics, author, theme, or tags
          </p>
        </div>
        
        {/* Search form */}
        <HymnSearch 
          onSearch={handleSearch}
          initialSearchParams={searchQuery}
        />
        
        {/* Results */}
        <div>
          {error ? (
            <AlertBanner
              type="error"
              title="Error"
              message="Failed to load search results. Please try again."
            />
          ) : isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingIndicator size="large" message="Searching..." />
            </div>
          ) : data && data.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              </div>
              <HymnList hymns={paginatedData || []} />
              
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
          ) : searchQuery ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 text-gray-300 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="h-16 w-16 text-gray-300 mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter search terms</h3>
              <p className="text-gray-500">Type keywords to search for hymns</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Search;
