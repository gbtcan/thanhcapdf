import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, fetchRecommendedHymns } from '../api/dashboardApi';
import { useAuth } from '../../../contexts/AuthContext';
import { QuickAction } from '../types';
import { useNavigate } from 'react-router-dom';

export function useDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Fetch dashboard stats if user is authenticated
  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: isAuthenticated && !!user?.id
  });
  
  // Fetch recommended hymns
  const { data: recommendations, isLoading: loadingRecommendations, error: recommendationsError } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => fetchRecommendedHymns(user?.id || ''),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Define quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'search',
      label: 'Tìm kiếm',
      icon: 'search',
      action: () => navigate('/search')
    },
    {
      id: 'favorites',
      label: 'Yêu thích',
      icon: 'heart',
      action: () => navigate(isAuthenticated ? '/user/favorites' : '/login')
    },
    {
      id: 'browse',
      label: 'Duyệt tất cả',
      icon: 'library',
      action: () => navigate('/hymns')
    },
    {
      id: 'random',
      label: 'Ngẫu nhiên',
      icon: 'shuffle',
      action: () => navigate('/random')
    },
  ];
  
  return {
    stats,
    recommendations,
    quickActions,
    isLoading: loadingStats || loadingRecommendations,
    error: statsError || recommendationsError
  };
}
