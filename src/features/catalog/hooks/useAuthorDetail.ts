import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuthorDetail, fetchAuthorHymns } from '../api/catalogApi';

/**
 * Hook để lấy thông tin chi tiết về tác giả và các thánh ca của tác giả đó
 */
export function useAuthorDetail(authorId: string | number) {
  const [page, setPage] = useState(0);
  const pageSize = 8; // Hymns per page
  
  // Fetch author details
  const authorQuery = useQuery({
    queryKey: ['author', authorId],
    queryFn: () => fetchAuthorDetail(authorId),
    enabled: !!authorId
  });
  
  // Fetch hymns by this author
  const hymnsQuery = useQuery({
    queryKey: ['author-hymns', authorId, page],
    queryFn: () => fetchAuthorHymns(authorId, page, pageSize),
    enabled: !!authorId && !authorQuery.isLoading && !authorQuery.error,
    keepPreviousData: true
  });
  
  // Pagination functions
  const nextPage = () => {
    if (hymnsQuery.data?.hasMore) {
      setPage(p => p + 1);
    }
  };
  
  const previousPage = () => {
    if (page > 0) {
      setPage(p => p - 1);
    }
  };
  
  return {
    author: authorQuery.data,
    hymns: hymnsQuery.data?.hymns || [],
    totalHymns: hymnsQuery.data?.total || 0,
    isLoading: authorQuery.isLoading || hymnsQuery.isLoading,
    error: authorQuery.error || hymnsQuery.error,
    refetch: () => {
      authorQuery.refetch();
      hymnsQuery.refetch();
    }
  };
}
