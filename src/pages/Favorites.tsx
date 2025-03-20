import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Music, User, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useFavorites from '../hooks/useFavorites';
import PageLayout from '../components/PageLayout';

const Favorites: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    favorites, 
    isLoading, 
    error,
    removeFromFavorites
  } = useFavorites();
  
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  // Handle removing a favorite
  const handleRemove = async (hymnId: string) => {
    setRemovingId(hymnId);
    try {
      await removeFromFavorites(hymnId);
    } finally {
      setRemovingId(null);
    }
  };

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ message: "Please login to view your favorites" }} />;
  }

  return (
    <PageLayout title="My Favorites">
      {/* Loading state */}
      {(authLoading || isLoading) && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span>Failed to load favorites: {error.message}</span>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!authLoading && !isLoading && !error && favorites.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No favorites yet</h3>
          <p className="mt-1 text-gray-500">
            Start adding favorites by exploring our hymns collection
          </p>
          <Link
            to="/songs"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Hymns
          </Link>
        </div>
      )}
      
      {/* Favorites list */}
      {!authLoading && !isLoading && !error && favorites.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {favorites.map(favorite => (
              <li key={favorite.hymnId} className="hover:bg-gray-50">
                <Link to={`/songs/${favorite.hymnId}`} className="block">
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-4">
                        <Music className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-indigo-700">{favorite.hymn.title}</h3>
                        {favorite.hymn.authors && favorite.hymn.authors.length > 0 && (
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>By: {favorite.hymn.authors.map(author => author.name).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(favorite.hymnId);
                        }}
                        className="ml-2 text-gray-400 hover:text-red-600 focus:outline-none"
                        disabled={removingId === favorite.hymnId}
                      >
                        {removingId === favorite.hymnId ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageLayout>
  );
};

export default Favorites;
