import { useState, useEffect } from 'react';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { HymnFilterOptions, Hymn, HymnFilters } from '../types';
import { fetchHymns } from '../api/hymnApi';
import { useDebounce } from '../../../core/hooks';

/**
 * Hook cơ bản để lấy danh sách thánh ca với React Query
 */
export function useBasicHymnsList(
  page: number = 0,
  pageSize: number = 12,
  filters?: HymnFilters
): UseQueryResult<{ hymns: Hymn[], total: number }> {
  return useQuery({
    queryKey: ['hymns', page, pageSize, filters],
    queryFn: () => fetchHymns(page, pageSize, filters),
    keepPreviousData: true,
  });
}

/**
 * Hook nâng cao để quản lý danh sách thánh ca với bộ lọc và phân trang
 */
export function useHymnsList(initialFilters?: HymnFilterOptions) {
  // State for filtering and pagination
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<HymnFilterOptions>(initialFilters || {});
  
  // Debounce search term to avoid too many requests
  const debouncedSearchTerm = useDebounce(filters.searchTerm || '', 500);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);
  
  // Create actual filter object with debounced search term
  const actualFilters = {
    ...filters,
    searchTerm: debouncedSearchTerm
  };
  
  // Fetch data - cần truyền tham số đúng định dạng
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['hymns', page, actualFilters],
    queryFn: () => {
      const filters = {
        search: actualFilters.searchTerm,
        author: actualFilters.authorId,
        theme: actualFilters.themeId,
        tag: actualFilters.tagId,
        status: actualFilters.status,
        sortBy: actualFilters.sortBy || 'title', 
        sortDirection: actualFilters.sortDirection || 'asc'
      };
      return fetchHymns(page, 12, filters);
    },
    keepPreviousData: true
  });
  
  // Calculate pagination info
  const totalPages = data?.total ? Math.ceil(data.total / 12) : 0;
  const hasNextPage = page < totalPages - 1;
  const hasPreviousPage = page > 0;
  
  // Page navigation functions
  const nextPage = () => {
    if (hasNextPage) {
      setPage(p => p + 1);
    }
  };
  
  const previousPage = () => {
    if (hasPreviousPage) {
      setPage(p => p - 1);
    }
  };
  
  const goToPage = (pageNumber: number) => {
    const safePageNumber = Math.max(0, Math.min(pageNumber, totalPages - 1));
    setPage(safePageNumber);
  };
  
  // Update filters
  const updateFilters = (newFilters: Partial<HymnFilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  return {
    hymns: data?.data || [],
    isLoading,
    error,
    page,
    totalPages,
    totalItems: data?.total || 0,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage,
    filters,
    updateFilters,
    refetch
  };
}
