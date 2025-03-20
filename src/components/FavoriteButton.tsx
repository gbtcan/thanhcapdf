import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useFavorites from '../hooks/useFavorites';

interface FavoriteButtonProps {
  hymnId: string;
  className?: string;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  hymnId,
  className = '',
  showText = false,
  size = 'medium'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { checkIsFavorite, toggleFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFavorite = checkIsFavorite(hymnId);
  
  // Size classes configuration
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };
  
  // Handle click - toggle favorite or redirect to login
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/songs/${hymnId}` } });
      return;
    }
    
    setIsLoading(true);
    try {
      await toggleFavorite(hymnId);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center focus:outline-none ${className}`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <Loader2 className={`${sizeClasses[size]} animate-spin text-gray-400`} />
      ) : (
        <Heart 
          className={`${sizeClasses[size]} ${
            isFavorite 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 hover:text-red-500'
          }`} 
        />
      )}
      
      {showText && (
        <span className={`ml-1 text-sm ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}>
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
