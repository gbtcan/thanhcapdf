import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Tag, Filter, ChevronDown, ChevronUp, 
  Trash2, Eye, AlertTriangle, XCircle, Check,
  Pin, Star
} from 'lucide-react';
import { useDebounce } from '../../utils/hooks';
import { fetchPosts, deletePost, fetchForumTags, togglePinPost, toggleFeaturePost } from '../../lib/forumService';
import { formatRelativeTime } from '../../utils/dateUtils';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import ForumStats from '../../components/admin/ForumStats';
import ForumAnalytics from '../../components/admin/ForumAnalytics';

const AdminForum: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'comments'>('latest');
  
  // Pagination settings
  const PAGE_SIZE = 10;
  
  // Debounce search query
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Fetch posts with filters
  const { 
    data: postsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['admin-forum-posts', page, debouncedQuery, tagFilter, sortBy],
    queryFn: () => fetchPosts({
      page,
      limit: PAGE_SIZE,
      searchQuery: debouncedQuery,
      tagId: tagFilter,
      sortBy
    })
  });
  
  // Fetch available tags
  const { data: tags } = useQuery({
    queryKey: ['forum-tags'],
    queryFn: () => fetchForumTags()
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
    }
  });
  
  // Add pin mutation
  const pinMutation = useMutation({
    mutationFn: ({postId, isPinned}: {postId: string, isPinned: boolean}) => 
      togglePinPost(postId, isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
    }
  });

  // Add feature mutation
  const featureMutation = useMutation({
    mutationFn: ({postId, isFeatured}: {postId: string, isFeatured: boolean}) => 
      toggleFeaturePost(postId, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
    }
  });

  // Handle delete confirmation
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
  };
  
  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete);
      setPostToDelete(null);
    }
  };
  
  const cancelDelete = () => {
    setPostToDelete(null);
  };
  
  // Handle pin/unpin
  const handlePinToggle = (postId: string, currentlyPinned: boolean) => {
    pinMutation.mutate({
      postId,
      isPinned: !currentlyPinned
    });
  };

  // Handle feature/unfeature
  const handleFeatureToggle = (postId: string, currentlyFeatured: boolean) => {
    featureMutation.mutate({
      postId,
      isFeatured: !currentlyFeatured
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTagFilter(undefined);
    setSortBy('latest');
    setPage(1);
  };
  
  // Calculate pagination
  const totalPages = postsData ? Math.ceil(postsData.totalCount / PAGE_SIZE) : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Forum</h1>
        <Link
          to="/admin/forum/tags"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Tag className="h-4 w-4 mr-2" />
          Manage Tags
        </Link>
      </div>
      
      {/* Forum Statistics Dashboard */}
      <ForumStats />
      
      {/* Forum Activity Analytics */}
      <ForumAnalytics />
      
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
              className="flex items-center px-4 py-2 border rounded-lg border-gray-300 text-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
            
            {(debouncedQuery || tagFilter || sortBy !== 'latest') && (
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
                  className={`px-3 py-1.5 rounded text-sm ${
                    sortBy === 'latest'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    sortBy === 'popular'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Most Liked
                </button>
                <button
                  onClick={() => setSortBy('comments')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    sortBy === 'comments'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Most Comments
                </button>
              </div>
            </div>
            
            {/* Tag filter */}
            {tags && tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setTagFilter(tagFilter === tag.id ? undefined : tag.id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tagFilter === tag.id
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Posts table */}
      {error ? (
        <AlertBanner
          type="error"
          title="Failed to load discussions"
          message={error instanceof Error ? error.message : 'Unknown error occurred'}
        />
      ) : isLoading ? (
        <div className="py-12">
          <LoadingIndicator size="large" message="Loading discussions..." />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {postsData?.posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-indigo-600">{post.title}</div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex mt-1 space-x-1">
                        {post.tags.map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{post.user?.name || 'Anonymous'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatRelativeTime(new Date(post.created_at))}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post._count?.comments || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post._count?.likes || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/forum/post/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Eye className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => handlePinToggle(post.id, post.is_pinned)}
                      className={`mr-3 ${
                        post.is_pinned 
                          ? 'text-amber-500 hover:text-amber-700' 
                          : 'text-gray-400 hover:text-amber-500'
                      }`}
                      title={post.is_pinned ? "Unpin post" : "Pin post"}
                    >
                      <Pin className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleFeatureToggle(post.id, post.is_featured)}
                      className={`mr-3 ${
                        post.is_featured 
                          ? 'text-yellow-500 hover:text-yellow-700' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={post.is_featured ? "Unfeature post" : "Feature post"}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((page - 1) * PAGE_SIZE) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * PAGE_SIZE, postsData?.totalCount || 0)}</span> of{' '}
                    <span className="font-medium">{postsData?.totalCount || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Previous</span>
                      &lsaquo;
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = page <= 3 
                        ? i + 1 
                        : page >= totalPages - 2 
                          ? totalPages - 4 + i 
                          : page - 2 + i;
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Next</span>
                      &rsaquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {postToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Discussion</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this discussion? This action cannot be undone and all associated comments will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <LoadingIndicator size="small" color="white" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForum;
