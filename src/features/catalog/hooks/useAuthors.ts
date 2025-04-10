import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuthors } from '../api/catalogApi';
import { Author } from '../types';

/**
 * Hook để quản lý danh sách tác giả với tìm kiếm và phân trang
 */
export function useAuthors(initialSearch: string = '') {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch authors
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['authors', page, pageSize, search, sortBy, sortDirection],
    queryFn: () => fetchAuthors({
      search,
      page,
      pageSize,
      sortBy,
      sortDirection
    })
  });

  return {
    authors: data?.authors || [],
    totalAuthors: data?.total || 0,
    isLoading,
    error,
    refetch
  };
}
