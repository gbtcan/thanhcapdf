import { useQuery } from '@tanstack/react-query';
import { getPopularThemes } from '../api/catalogApi';

/**
 * Hook to fetch popular themes for homepage or widgets
 */
export function usePopularThemes(limit?: number) {
  const {
    data: themes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['popular-themes', limit],
    queryFn: () => getPopularThemes(limit),
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
  
  return {
    themes: themes || [],
    isLoading,
    error
  };
}
