import { useQuery } from '@tanstack/react-query';
import { fetchThemeDetail, fetchThemeHymns } from '../api/catalogApi';

interface UseThemeDetailParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'title' | 'created_at' | 'view_count';
  sortDirection?: 'asc' | 'desc';
}

export function useThemeDetail(
  themeId?: string | number,
  {
    page = 0,
    pageSize = 9,
    sortBy = 'title',
    sortDirection = 'asc'
  }: UseThemeDetailParams = {}
) {
  // Fetch theme details
  const themeQuery = useQuery({
    queryKey: ['theme', themeId],
    queryFn: () => fetchThemeDetail(themeId!),
    enabled: !!themeId
  });
  
  // Fetch hymns with this theme
  const hymnsQuery = useQuery({
    queryKey: ['theme-hymns', themeId, page, pageSize, sortBy, sortDirection],
    queryFn: () => fetchThemeHymns(themeId!, { page, pageSize, sortBy, sortDirection }),
    enabled: !!themeId && !themeQuery.isLoading && !themeQuery.error,
    keepPreviousData: true
  });
  
  return {
    theme: themeQuery.data,
    hymns: hymnsQuery.data?.hymns || [],
    totalHymns: hymnsQuery.data?.total || 0,
    isLoading: themeQuery.isLoading || hymnsQuery.isLoading,
    error: themeQuery.error || hymnsQuery.error,
    refetch: () => {
      themeQuery.refetch();
      hymnsQuery.refetch();
    }
  };
}
