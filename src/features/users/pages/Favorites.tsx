import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { RefreshCw, Heart, BookOpen, Music, Search, X } from 'lucide-react';
import HymnCard from '../../hymns/components/HymnCard';
import { LoadingIndicator } from '../../../core/components';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch user favorites
  const { data, isLoading, error } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // First get the liked hymn IDs
      const { data: likeData, error: likeError } = await supabase
        .from('hymn_likes')
        .select('hymn_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (likeError) throw likeError;
      
      if (!likeData || likeData.length === 0) {
        return { hymns: [], likedAt: {} };
      }
      
      // Extract hymn IDs and create a map of hymn_id to created_at for sorting
      const hymnIds = likeData.map(like => like.hymn_id);
      const likedAt = likeData.reduce((acc, like) => {
        acc[like.hymn_id] = like.created_at;
        return acc;
      }, {} as Record<string, string>);
      
      // Fetch the full hymn data
      const { data: hymns, error: hymnsError } = await supabase
        .from('hymns_new')
        .select(`
          *,
          pdf_files:hymn_pdf_files(id)
        `)
        .in('id', hymnIds);
        
      if (hymnsError) throw hymnsError;
      
      // For each hymn, fetch authors
      const enrichedHymns = await Promise.all((hymns || []).map(async (hymn) => {
        try {
          const { data: authorData } = await supabase
            .from('hymn_authors')
            .select('authors(id, name)')
            .eq('hymn_id', hymn.id);
            
          return {
            ...hymn,
            authors: authorData?.map(a => ({ author: a.authors })) || []
          };
        } catch (e) {
          console.warn(`Error fetching authors for hymn ${hymn.id}:`, e);
          return {
            ...hymn,
            authors: []
          };
        }
      }));
      
      // Sort hymns based on when they were liked
      enrichedHymns.sort((a, b) => {
        const dateA = new Date(likedAt[a.id]).getTime();
        const dateB = new Date(likedAt[b.id]).getTime();
        return dateB - dateA;
      });
      
      return { hymns: enrichedHymns, likedAt };
    },
    enabled: !!user?.id
  });
  
  // Filter hymns based on search term
  const filteredHymns = data?.hymns.filter(hymn => 
    searchTerm === '' || 
    hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Heart className="h-5 w-5 mr-2 fill-red-500 text-red-500" />
            Bài hát yêu thích
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Danh sách các bài hát bạn đã đánh dấu yêu thích
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm bài hát yêu thích..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <LoadingIndicator message="Đang tải danh sách yêu thích..." />
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Có lỗi xảy ra khi tải danh sách yêu thích
          </p>
        </div>
      ) : (
        <>
          {filteredHymns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHymns.map(hymn => (
                <HymnCard 
                  key={hymn.id} 
                  hymn={hymn} 
                  showActions={true}
                  showFavorite={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {searchTerm ? (
                <>
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Không tìm thấy bài hát
                  </h2>
                  <p className="text-gray-500">
                    Không có bài hát yêu thích nào khớp với "{searchTerm}"
                  </p>
                </>
              ) : (
                <>
                  <Heart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chưa có bài hát yêu thích
                  </h2>
                  <p className="text-gray-500 mb-4">
                    Bạn chưa đánh dấu bài hát nào là yêu thích
                  </p>
                  <a 
                    href="/hymns"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Music className="h-4 w-4 mr-1.5" />
                    Khám phá bài hát
                  </a>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
