import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Filter, SortAsc, MessageSquare, ThumbsUp, Clock, Tag } from 'lucide-react';
import { fetchPosts, fetchForumTags } from '../../lib/forumService';
import PageLayout from '../../components/PageLayout';
import PostCard from '../../components/forum/PostCard';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../contexts/AuthContext';

const Forum: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('tagId');
  const hymnId = searchParams.get('hymnId');
  const searchQuery = searchParams.get('q');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'comments'>('latest');
  const [showFilters, setShowFilters] = useState(false);
  
  const { isAuthenticated } = useAuth();
  
  // Fetch posts based on filters
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = useQuery({
    queryKey: ['posts', currentPage, postsPerPage, sortBy, tagId, hymnId, searchQuery],
    queryFn: () => fetchPosts({
      page: currentPage,
      limit: postsPerPage,
      sortBy,
      tagId: tagId || undefined,
      hymnId: hymnId || undefined,
      searchQuery: searchQuery || undefined
    })
  });
  
  // Fetch forum tags for filtering
  const {
    data: tags = [],
    isLoading: tagsLoading
  } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: fetchForumTags
  });

  // Create URL with updated parameters
  const createUrlWithParams = (params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    return `?${newSearchParams.toString()}`;
  };

  // Handle sort change
  const handleSortChange = (newSort: 'latest' | 'popular' | 'comments') => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Handle tag filter click
  const handleTagFilter = (id: string) => {
    const newParams = createUrlWithParams({ tagId: id === tagId ? undefined : id });
    window.history.pushState({}, '', newParams);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Calculate pagination values
  const totalPosts = postsData?.totalCount || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Determine page title and description
  let pageTitle = 'Community Forum';
  let pageDescription = 'Join discussions about Catholic hymns and liturgical music.';
  
  if (hymnId) {
    pageTitle = 'Hymn Discussions';
    pageDescription = 'Posts and discussions related to this hymn.';
  } else if (tagId) {
    const selectedTag = tags.find(tag => tag.id === tagId);
    if (selectedTag) {
      pageTitle = `${selectedTag.name} Discussions`;
      pageDescription = `Posts tagged with ${selectedTag.name}`;
    }
  } else if (searchQuery) {
    pageTitle = `Search Results: "${searchQuery}"`;
    pageDescription = `Forum posts matching your search query`;
  }

  return (
    <PageLayout title={pageTitle} description={pageDescription}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Forum Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pageTitle}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pageDescription}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {isAuthenticated && (
              <Link
                to="/forum/new"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm flex items-center text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Post
              </Link>
            )}
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSortChange('latest')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    sortBy === 'latest'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Latest
                </button>
                
                <button
                  onClick={() => handleSortChange('popular')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    sortBy === 'popular'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Popular
                </button>
                
                <button
                  onClick={() => handleSortChange('comments')}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    sortBy === 'comments'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
                      : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Most Discussed
                </button>
              </div>
            </div>
            
            {/* Tags filter */}
            {!tagsLoading && tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tag</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagFilter(tag.id)}
                      className={`px-2.5 py-1 text-xs rounded-full flex items-center ${
                        tag.id === tagId
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                      {tag.id === tagId && (
                        <span className="ml-1 text-xs">&times;</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error state */}
        {postsError && (
          <AlertBanner
            type="error"
            title="Error loading posts"
            message="There was a problem loading the forum posts. Please try again later."
            className="mb-6"
          />
        )}
        
        {/* Loading state */}
        {postsLoading && (
          <div className="flex justify-center py-12">
            <LoadingIndicator size="large" message="Loading forum posts..." />
          </div>
        )}
        
        {/* Empty state */}
        {!postsLoading && postsData && postsData.posts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || tagId || hymnId 
                ? "There are no posts matching your current filters."
                : "Be the first to start a discussion in our community forum!"}
            </p>
            
            {isAuthenticated ? (
              <Link
                to="/forum/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create a New Post
              </Link>
            ) : (
              <Link
                to="/auth/login?redirect=/forum/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign in to Post
              </Link>
            )}
          </div>
        )}
        
        {/* Posts Grid */}
        {!postsLoading && postsData && postsData.posts.length > 0 && (
          <div className="space-y-4 mb-8">
            {postsData.posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                showExcerpt={true}
                showAuthor={true}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Forum;
