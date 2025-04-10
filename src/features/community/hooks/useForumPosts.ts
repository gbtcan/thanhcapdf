import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getForumPosts } from '../api/communityApi';
import { ForumPostFilter } from '../types';

/**
 * Hook to fetch and filter forum posts
 */
export function useForumPosts(initialFilter: ForumPostFilter = {}) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<ForumPostFilter>(initialFilter);
  const pageSize = 10;
  
  // Fetch posts
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['forum-posts', filter, page],
    queryFn: () => getForumPosts(filter, page, pageSize),
    keepPreviousData: true
  });
  
  // Pagination functions
  const nextPage = () => {
    if (data && data.posts.length === pageSize) {
      setPage(p => p + 1);
    }
  };
  
  const previousPage = () => {
    setPage(p => Math.max(0, p - 1));
  };
  
  const goToPage = (newPage: number) => {
    setPage(Math.max(0, newPage));
  };
  
  // Update filters
  const updateFilter = (newFilter: Partial<ForumPostFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setPage(0); // Reset to first page when filters change
  };
  
  return {
    posts: data?.posts || [],
    totalPosts: data?.count || 0,
    isLoading,
    error,
    page,
    pageSize,
    totalPages: data?.count ? Math.ceil(data.count / pageSize) : 0,
    nextPage,
    previousPage,
    goToPage,
    filter,
    updateFilter,
    refetch
  };
}
