import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Music, User, BookOpen, MessageSquare, Trash2 } from 'lucide-react';
import { FavoriteItem } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useFavorites } from '../hooks/useFavorites';

interface FavoritesListProps {
  items?: FavoriteItem[];
  emptyMessage?: string;
  showRemoveButton?: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  items,
  emptyMessage = 'Bạn chưa có mục yêu thích nào.',
  showRemoveButton = true
}) => {
  const { favorites, localFavorites, isLoading, toggleFavorite } = useFavorites();
  
  // Use provided items or fall back to favorites from the hook
  const favItems = items || favorites || localFavorites;
  
  // Handle removing an item
  const handleRemove = (item: FavoriteItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id, item.type, item.title);
  };
  
  // Function to get icon for different item types
  const getItemIcon = (type: string) => {
    switch(type) {
      case 'hymn':
        return <Music className="h-5 w-5 text-blue-500" />;
      case 'author':
        return <User className="h-5 w-5 text-green-500" />;
      case 'theme':
        return <BookOpen className="h-5 w-5 text-amber-500" />;
      case 'post':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Heart className="h-5 w-5 text-red-500" />;
    }
  };
  
  // Get URL for different item types
  const getItemUrl = (item: FavoriteItem) => {
    switch(item.type) {
      case 'hymn':
        return `/hymns/${item.id}`;
      case 'author':
        return `/authors/${item.id}`;
      case 'theme':
        return `/themes/${item.id}`;
      case 'post':
        return `/community/posts/${item.id}`;
      default:
        return '#';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="text-center p-8 text-gray-600 dark:text-gray-400">
        <Heart className="h-12 w-12 mx-auto mb-3 animate-pulse text-red-200 dark:text-red-900" />
        <p>Đang tải danh sách yêu thích...</p>
      </div>
    );
  }
  
  // Empty state
  if (!favItems || favItems.length === 0) {
    return (
      <div className="text-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {favItems.map((item) => (
          <Link 
            key={`${item.type}-${item.id}`} 
            to={getItemUrl(item)}
            className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 relative"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {getItemIcon(item.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </h3>
                
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="capitalize mr-2">
                    {item.type === 'hymn' 
                      ? 'Bài hát' 
                      : item.type === 'author'
                        ? 'Tác giả'
                        : item.type === 'theme'
                          ? 'Chủ đề'
                          : 'Bài viết'
                    }
                  </span>
                  <span>•</span>
                  <span className="ml-2">
                    Đã thêm {formatDistanceToNow(new Date(item.added_at), {
                      addSuffix: true,
                      locale: vi
                    })}
                  </span>
                </div>
              </div>
              
              {showRemoveButton && (
                <button
                  onClick={(e) => handleRemove(item, e)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                  title="Xóa khỏi yêu thích"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
