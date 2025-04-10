import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchThemes } from '../api/catalogApi';
import { Theme } from '../types';

/**
 * Hook để quản lý danh sách chủ đề với tìm kiếm và phân trang
 */
export function useThemes(initialSearch: string = '') {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch themes
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['themes', page, pageSize, search, sortBy, sortDirection],
    queryFn: () => fetchThemes({
      search,
      page,
      pageSize,
      sortBy,
      sortDirection
    })
  });

  return {
    themes: data?.themes || [],
    totalThemes: data?.total || 0,
    isLoading,
    error,
    refetch,
    setPage,
    setPageSize,
    setSearch,
    setSortBy,
    setSortDirection
  };
}
