import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Tag, Filter, ChevronDown, ChevronUp, 
  PlusCircle, Music, Calendar, TrendingUp, XCircle
} from 'lucide-react';
import { useDebounce } from '../utils/hooks';
import PageLayout from '../components/PageLayout';
import LoadingIndicator from '../components/LoadingIndicator';
import AlertBanner from '../components/AlertBanner';
import PostList from '../components/forum/PostList';
import ForumSidebar from '../components/forum/ForumSidebar';
import ForumNav from '../components/forum/ForumNav';
import { fetchPosts, fetchForumStatistics, fetchPopularTags } from '../lib/forumService';
import { useAuth } from '../contexts/AuthContext';
import type { ForumTagWithCount } from '../types/forum';

const Forum = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract search parameters
  const initialQuery = searchParams.get('q') || '';
  const initialHymnId = searchParams.get('hymn') || undefined;
  const initialTagId = searchParams.get('tag') || undefined;
  const initialSortBy = (searchParams.get('sort') || 'latest') as 'latest' | 'popular' | 'comments';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [hymnId, setHymnId] = useState<string | undefined>(initialHymnId);
  const [tagId, setTagId] = useState<string | undefined>(initialTagId);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'comments'>(initialSortBy);
  const [page, setPage] = useState(initialPage);
  
  // Pagination
  const PAGE_SIZE = 10;
  
  // Debounce search to prevent excessive API calls
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (hymnId) params.set('hymn', hymnId);
    if (tagId) params.set('tag', tagId);
    if (sortBy !== 'latest') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [debouncedQuery, hymnId, tagId, sortBy, page, setSearchParams]);
  
  // Fetch posts with filters
  const { 
    data: postsData,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['forum-posts', debouncedQuery, hymnId, tagId, sortBy, page],
    queryFn: () => fetchPosts({
      hymnId,
      tagId,
      searchQuery: debouncedQuery,
      sortBy,
      page,
      limit: PAGE_SIZE
    })
  });
  
  // Fetch popular tags
  const { 
    data: popularTags,
    isLoading: tagsLoading
  } = useQuery<ForumTagWithCount[]>({
    queryKey: ['popular-tags'],
    queryFn: () => fetchPopularTags(10)
  });
  
  // Fetch forum statistics
  const { 
    data: forumStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['forum-statistics'],
    queryFn: () => fetchForumStatistics()
  });
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setHymnId(undefined);
    setTagId(undefined);
    setSortBy('latest');
    setPage(1);
    setShowFilters(false);
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calculate pagination info
  const totalPages = postsData ? Math.ceil(postsData.totalCount / PAGE_SIZE) : 0;
  const showingFrom = postsData && postsData.totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingTo = postsData ? Math.min(page * PAGE_SIZE, postsData.totalCount) : 0;
  
  // Check if any filters are active
  const hasActiveFilters = !!debouncedQuery || !!hymnId || !!tagId || sortBy !== 'latest';
  
  return (
    <PageLayout title="Discussion Forum">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Page header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Discussion Forum
            </h1>
            
            {isAuthenticated && (
              <Link 
                to="/forum/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Discussion
              </Link>
            )}
          </div>
          
          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-2 border rounded-lg ${
                    showFilters || hasActiveFilters
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                )}
              </div>
            </div>
            
            {/* Extended filters */}
            {showFilters && (
              <div className="mt-4 space-y-4">
                {/* Sort options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSortBy('latest')}
                      className={`px-3 py-1.5 rounded text-sm flex items-center ${
                        sortBy === 'latest'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Latest
                    </button>
                    <button
                      onClick={() => setSortBy('popular')}
                      className={`px-3 py-1.5 rounded text-sm flex items-center ${
                        sortBy === 'popular'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Most Liked
                    </button>
                    <button
                      onClick={() => setSortBy('comments')}
                      className={`px-3 py-1.5 rounded text-sm flex items-center ${
                        sortBy === 'comments'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <Music className="h-4 w-4 mr-1" />
                      Most Comments
                    </button>
                  </div>
                </div>
                
                {/* Tag filter */}
                {popularTags && popularTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Tag
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => setTagId(tagId === tag.id ? undefined : tag.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tagId === tag.id
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.name}
                          <span className="ml-1 text-xs">({tag._count.posts})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Results count */}
          {postsData && !postsLoading && (
            <div className="bg-white px-4 py-3 rounded-lg shadow flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{showingFrom}</span> to{' '}
                <span className="font-medium">{showingTo}</span> of{' '}
                <span className="font-medium">{postsData.totalCount}</span> discussions
              </p>
              
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
          
          {/* Posts list */}
          {postsError ? (
            <AlertBanner
              type="error"
              title="Failed to load discussions"
              message={postsError instanceof Error ? postsError.message : 'Unknown error occurred'}
            />
          ) : postsLoading ? (
            <div className="py-12">
              <LoadingIndicator size="large" message="Loading discussions..." />
            </div>
          ) : (
            <PostList 
              posts={postsData?.posts || []}
              showHymnTitle={true}
              emptyMessage={
                hasActiveFilters 
                  ? "No discussions match your search criteria" 
                  : "Be the first to start a discussion!"
              }
            />
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show first, last, current, and adjacent pages
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          page === pageNum
                            ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && page > 3) ||
                    (pageNum === totalPages - 1 && page < totalPages - 2)
                  ) {
                    return <span key={pageNum} className="px-2">...</span>;
                  } else {
                    return null;
                  }
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <ForumNav />
          <ForumSidebar 
            statistics={forumStats} 
            isLoading={statsLoading}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Forum;
