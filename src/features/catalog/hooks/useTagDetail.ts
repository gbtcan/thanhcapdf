import { useQuery } from '@tanstack/react-query';
import { fetchTagDetail, fetchTagHymns } from '../api/catalogApi';

interface UseTagDetailParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'title' | 'created_at' | 'view_count';
  sortDirection?: 'asc' | 'desc';
}

export function useTagDetail(
  tagId?: string | number,
  {
    page = 0,
    pageSize = 9,
    sortBy = 'title',
    sortDirection = 'asc'
  }: UseTagDetailParams = {}
) {
  // Fetch tag details
  const tagQuery = useQuery({
    queryKey: ['tag', tagId],
    queryFn: () => fetchTagDetail(tagId!),
    enabled: !!tagId
  });
  
  // Fetch hymns with this tag
  const hymnsQuery = useQuery({
    queryKey: ['tag-hymns', tagId, page, pageSize, sortBy, sortDirection],
    queryFn: () => fetchTagHymns(tagId!, { page, pageSize, sortBy, sortDirection }),
    enabled: !!tagId && !tagQuery.isLoading && !tagQuery.error,
    keepPreviousData: true
  });
  
  return {
    tag: tagQuery.data,
    hymns: hymnsQuery.data?.hymns || [],
    totalHymns: hymnsQuery.data?.total || 0,
    isLoading: tagQuery.isLoading || hymnsQuery.isLoading,
    error: tagQuery.error || hymnsQuery.error,
    refetch: () => {
      tagQuery.refetch();
      hymnsQuery.refetch();
    }
  };
}
