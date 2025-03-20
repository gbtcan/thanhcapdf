import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchBookmarkedPosts } from '../lib/bookmarkService';
import PageLayout from '../components/PageLayout';
import PostList from '../components/forum/PostList';
import LoadingIndicator from '../components/LoadingIndicator';
import AlertBanner from '../components/AlertBanner';

const ForumBookmarks: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  
  // Fetch bookmarked posts
  const {
    data: bookmarksData,
    isLoading: bookmarksLoading,
    error: bookmarksError
  } = useQuery({
    queryKey: ['bookmarked-posts', user?.id, currentPage],
    queryFn: () => fetchBookmarkedPosts(user!.id, currentPage),
    enabled: !!user?.id && isAuthenticated,
    keepPreviousData: true
  });
  
  // Calculate total pages
  const totalPages = bookmarksData?.totalCount 
    ? Math.ceil(bookmarksData.totalCount / 10)
    : 1;
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };
  
  // If not authenticated, redirect to login
  if (!authLoading && !isAuthenticated) {
    return (
      <PageLayout title="Bookmarked Discussions">
        <div className="max-w-4xl mx-auto">
          <AlertBanner
            type="info"
            title="Authentication Required"
            message="Please sign in to view your bookmarks"
          />
          <div className="mt-4 flex justify-center">
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Bookmarked Discussions">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/forum"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Forum
          </Link>
        </div>
        
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookmarked Discussions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Access the discussions you've saved for later
          </p>
        </div>
        
        {/* Posts list */}
        {bookmarksError ? (
          <AlertBanner
            type="error"
            title="Failed to load your bookmarks"
            message={bookmarksError instanceof Error ? bookmarksError.message : 'Unknown error occurred'}
          />
        ) : authLoading || bookmarksLoading ? (
          <div className="py-12">
            <LoadingIndicator size="large" message="Loading your bookmarks..." />
          </div>
        ) : (
          <div>
            <PostList 
              posts={bookmarksData?.posts || []}
              showHymnTitle={true}
              emptyMessage="You haven't bookmarked any discussions yet"
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                        currentPage === i + 1
                          ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ForumBookmarks;
