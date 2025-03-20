import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Music, Trash2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Favorite, HymnWithRelations } from '../types';
import LoadingIndicator from './LoadingIndicator';
import AlertBanner from './AlertBanner';
import { formatDisplayDate } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

interface UserFavoritesProps {
  userId: string;
}

const UserFavorites: React.FC<UserFavoritesProps> = ({ userId }) => {
  const { user } = useAuth();
  const isOwnProfile = user?.id === userId;

  // Fetch user favorites
  const {
    data: favorites,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-favorites', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          hymn:hymn_id (
            id,
            title,
            hymn_authors:hymn_authors(authors(id, name)),
            hymn_categories:hymn_categories(categories(id, name))
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform nested data for easier handling
      return data.map((favorite: any) => ({
        id: favorite.id,
        created_at: favorite.created_at,
        hymn: {
          ...favorite.hymn,
          authors: favorite.hymn?.hymn_authors?.map((ha: any) => ha.authors) || [],
          categories: favorite.hymn?.hymn_categories?.map((hc: any) => hc.categories) || []
        }
      }));
    },
    enabled: !!userId
  });

  // Remove favorite mutation
  const removeFavorite = async (favoriteId: string | number) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      
      if (error) throw error;
      
      // Refresh favorites after removing
      refetch();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator size="medium" message="Loading favorites..." />
      </div>
    );
  }

  if (error) {
    return (
      <AlertBanner
        type="error"
        title="Error loading favorites"
        message="There was a problem loading the favorites. Please try again later."
      />
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Heart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No favorites yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {isOwnProfile 
            ? "You haven't favorited any hymns yet. Browse the hymns collection and click the heart icon to add favorites."
            : "This user hasn't favorited any hymns yet."}
        </p>
        <Link
          to="/hymns"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Music className="h-4 w-4 mr-1" />
          Browse Hymns
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Favorites {favorites && <span className="text-gray-500 dark:text-gray-400 font-normal">({favorites.length})</span>}
        </h3>
      </div>
      
      <div className="space-y-4">
        {favorites.map((favorite) => (
          <div 
            key={favorite.id}
            className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 flex flex-col sm:flex-row gap-4 sm:items-center shadow-sm"
          >
            {/* Hymn details */}
            <div className="flex-1 min-w-0">
              <Link 
                to={`/hymns/${favorite.hymn.id}`} 
                className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {favorite.hymn.title}
              </Link>
              
              {favorite.hymn.authors && favorite.hymn.authors.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  By {favorite.hymn.authors.map((author, idx) => (
                    <span key={author.id}>
                      {idx > 0 && ", "}
                      {author.name}
                    </span>
                  ))}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {favorite.hymn.categories && favorite.hymn.categories.map(category => (
                  <Link 
                    key={category.id}
                    to={`/hymns?category=${category.id}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Added to favorites on {formatDisplayDate(favorite.created_at)}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 self-end sm:self-center">
              <Link
                to={`/hymns/${favorite.hymn.id}`}
                className="inline-flex items-center p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                title="View hymn"
              >
                <LinkIcon className="h-4 w-4" />
              </Link>
              
              {isOwnProfile && (
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="inline-flex items-center p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserFavorites;
