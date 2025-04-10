import { useQuery } from '@tanstack/react-query';
import { fetchTags } from '../api/catalogApi';

export function useTags(search: string = '') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tags', search],
    queryFn: () => fetchTags(search),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return {
    tags: data || [],
    isLoading,
    error
  };
}
