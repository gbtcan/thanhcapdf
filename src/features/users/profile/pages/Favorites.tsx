import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../core/contexts/AuthContext';
import { Music, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../../../core/components/ui/button';
import { Card, CardContent } from '../../../../core/components/ui/card';

interface Favorite {
  id: string;
  hymn_id: string;
  user_id: string;
  created_at: string;
  hymn: {
    id: string;
    title: string;
    subtitle?: string;
    number?: number;
    slug?: string;
  };
}

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          hymn_id,
          user_id,
          created_at,
          hymn:hymn_id (
            id, title, subtitle, number, slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setFavorites(data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
        
      if (error) throw error;
      
      // Cập nhật UI
      setFavorites((prev) => prev.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Không thể xóa khỏi danh sách yêu thích. Vui lòng thử lại.');
    }
  };
  
  useEffect(() => {
    fetchFavorites();
  }, [user]);
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Danh sách yêu thích</h1>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchFavorites}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Đang tải danh sách yêu thích...</p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Music className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Chưa có bài hát yêu thích
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bạn chưa thêm bài hát nào vào danh sách yêu thích
          </p>
          <Button asChild>
            <Link to="/hymns">
              Khám phá thánh ca
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <Link 
                      to={`/hymns/${favorite.hymn?.slug || favorite.hymn_id}`}
                      className="block hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <h3 className="text-lg font-medium truncate">
                        {favorite.hymn.title}
                      </h3>
                      {favorite.hymn.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {favorite.hymn.subtitle}
                        </p>
                      )}
                    </Link>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    onClick={() => removeFavorite(favorite.id)}
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Xóa</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
