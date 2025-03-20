import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, Edit, Bookmark, BookmarkCheck } from 'lucide-react';
import { fetchHymnById, incrementHymnView, toggleHymnFavorite } from '../lib/hymnService';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import HymnDetail from '../components/HymnDetail';
import AlertBanner from '../components/AlertBanner';
import LoadingIndicator from '../components/LoadingIndicator';

const HymnDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Redirect if no ID
  if (!id) {
    navigate('/hymns');
    return null;
  }
  
  // Fetch hymn details
  const { data: hymn, isLoading, error, refetch } = useQuery({
    queryKey: ['hymn', id],
    queryFn: () => fetchHymnById(id),
    staleTime: 60000, // 1 minute
    enabled: !!id
  });
  
  // Check if hymn is in user's favorites
  const isFavorite = !!hymn?.user_favorite;
  
  // Handle view increment
  useEffect(() => {
    if (id) {
      // Small delay to avoid incrementing on quick navigation
      const timeoutId = setTimeout(() => {
        incrementHymnView(id).catch(err => {
          console.error('Error incrementing view count:', err);
        });
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [id]);
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!id || !isAuthenticated) return;
      return toggleHymnFavorite(id);
    },
    onSuccess: () => {
      refetch();
    }
  });
  
  // Handle toggle favorite
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/hymns/${id}` } });
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };
  
  // Define breadcrumbs
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Hymns', href: '/hymns' },
    { name: hymn?.title || 'Hymn Details', href: `/hymns/${id}` }
  ];
  
  // Check user permissions for editing
  const canEdit = isAuthenticated && 
    (user?.roles?.name === 'administrator' || user?.roles?.name === 'editor');
  
  return (
    <PageLayout
      title={hymn?.title || 'Hymn Details'}
      description={`${hymn?.title || 'Hymn'} - ${hymn?.authors?.map(a => a.name).join(', ') || 'Unknown Author'}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/hymns"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to hymns
          </Link>
          
          <div className="flex space-x-2">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isPending}
              className={`p-2 rounded-md ${
                isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' 
                  : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
            
            {/* Edit button (admin only) */}
            {canEdit && (
              <Link
                to={`/admin/hymns/edit/${id}`}
                className="p-2 rounded-md text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                title="Edit hymn"
              >
                <Edit className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <AlertBanner
            type="error"
            title="Error Loading Hymn"
            message="There was a problem loading this hymn. Please try again."
            className="mb-6"
          />
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="py-12">
            <LoadingIndicator size="large" message="Loading hymn details..." center />
          </div>
        ) : (
          <HymnDetail hymnId={id} />
        )}
      </div>
    </PageLayout>
  );
};

export default HymnDetailPage;
