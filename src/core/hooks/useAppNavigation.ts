import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

/**
 * Custom hook for app navigation with route constants
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation functions
  const goToHome = () => navigate(ROUTES.HOME);
  
  const goToHymns = () => navigate(ROUTES.HYMNS);
  const goToHymnDetail = (id: string) => navigate(ROUTES.HYMN_DETAIL(id));
  
  const goToAuthors = () => navigate(ROUTES.AUTHORS);
  const goToAuthorDetail = (id: string) => navigate(ROUTES.AUTHOR_DETAIL(id));
  
  const goToThemes = () => navigate(ROUTES.THEMES);
  const goToThemeDetail = (id: string) => navigate(ROUTES.THEME_DETAIL(id));
  
  const goToCommunity = () => navigate(ROUTES.COMMUNITY);
  const goToCommunityPost = (id: string) => navigate(ROUTES.COMMUNITY_POST(id));
  const goToNewPost = () => navigate(ROUTES.COMMUNITY_NEW_POST);
  
  const goToLogin = (redirectTo?: string) => {
    if (redirectTo) {
      navigate(`${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(redirectTo)}`);
    } else {
      navigate(ROUTES.AUTH.LOGIN);
    }
  };
  
  const goToRegister = () => navigate(ROUTES.AUTH.REGISTER);
  const goToForgotPassword = () => navigate(ROUTES.AUTH.FORGOT_PASSWORD);
  
  const goToProfile = () => navigate(ROUTES.USER.PROFILE);
  const goToFavorites = () => navigate(ROUTES.USER.FAVORITES);
  const goToSettings = () => navigate(ROUTES.USER.SETTINGS);
  
  const goToAdminDashboard = () => navigate(ROUTES.ADMIN.DASHBOARD);
  const goToAdminHymns = () => navigate(ROUTES.ADMIN.HYMNS);
  const goToAdminNewHymn = () => navigate(ROUTES.ADMIN.HYMN_NEW);
  const goToAdminEditHymn = (id: string) => navigate(ROUTES.ADMIN.HYMN_EDIT(id));
  
  const goToSearch = (query: string, type: string = 'all') => {
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}&type=${type}`);
  };
  
  const goBack = () => navigate(-1);
  
  // Helper to get redirect URL from location state or query params
  const getRedirectUrl = (): string | null => {
    // Check for redirect in query params
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    if (redirectParam) {
      return decodeURIComponent(redirectParam);
    }
    
    // Check for redirect in state
    if (location.state && typeof location.state === 'object' && 'from' in location.state) {
      return location.state.from as string;
    }
    
    return null;
  };
  
  return {
    // Basic navigation
    navigate,
    goBack,
    getRedirectUrl,
    currentPath: location.pathname,
    
    // App navigation
    goToHome,
    
    // Hymns
    goToHymns,
    goToHymnDetail,
    
    // Catalog
    goToAuthors,
    goToAuthorDetail,
    goToThemes,
    goToThemeDetail,
    
    // Community
    goToCommunity,
    goToCommunityPost,
    goToNewPost,
    
    // Auth
    goToLogin,
    goToRegister,
    goToForgotPassword,
    
    // User
    goToProfile,
    goToFavorites,
    goToSettings,
    
    // Admin
    goToAdminDashboard,
    goToAdminHymns,
    goToAdminNewHymn,
    goToAdminEditHymn,
    
    // Search
    goToSearch,
  };
}
