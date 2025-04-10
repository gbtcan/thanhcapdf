import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentActivity, getMostViewedHymns } from '../api/adminApi';

/**
 * Hook for fetching admin dashboard statistics
 */
export function useDashboardStats() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => getDashboardStats(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const activityQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'activity'],
    queryFn: () => getRecentActivity(10),
    staleTime: 1000 * 60 // 1 minute
  });
  
  const viewsQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'mostViewed'],
    queryFn: () => getMostViewedHymns(5),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  return {
    stats: statsQuery.data,
    activity: activityQuery.data || [],
    mostViewed: viewsQuery.data || [],
    isLoading: statsQuery.isLoading || activityQuery.isLoading || viewsQuery.isLoading,
    isError: statsQuery.isError || activityQuery.isError || viewsQuery.isError,
    refetch: () => {
      statsQuery.refetch();
      activityQuery.refetch();
      viewsQuery.refetch();
    }
  };
}
