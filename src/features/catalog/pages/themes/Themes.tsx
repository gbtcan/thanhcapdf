import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { Palette, ArrowRight } from 'lucide-react';
import { Button } from '../../../../core/components/ui/button';
import PageHeader from '../../components/PageHeader';
import LoadingIndicator from '../../../../core/components/LoadingIndicator';

interface Theme {
  id: string;
  name: string;
  description?: string;
  hymn_count?: number;
}

const Themes: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Lấy danh sách chủ đề
        // Sửa lại câu truy vấn để chỉ định rõ mối quan hệ giữa themes và hymn_themes
        const { data, error } = await supabase
          .from('themes')
          .select('id, name, description');
          
        if (error) throw error;
        
        // Lấy số lượng thánh ca cho từng chủ đề bằng truy vấn riêng
        const themesWithCount = await Promise.all(
          (data || []).map(async (theme) => {
            // Đếm số lượng hymn cho mỗi chủ đề
            const { count, error: countError } = await supabase
              .from('hymn_themes')
              .select('*', { count: 'exact', head: true })
              .eq('theme_id', theme.id);
              
            if (countError) {
              console.error(`Error counting hymns for theme ${theme.id}:`, countError);
              return { ...theme, hymn_count: 0 };
            }
            
            return { ...theme, hymn_count: count || 0 };
          })
        );
        
        // Sắp xếp theo số lượng thánh ca (từ cao đến thấp)
        const sortedThemes = themesWithCount.sort((a, b) => 
          (b.hymn_count || 0) - (a.hymn_count || 0)
        );
        
        setThemes(sortedThemes);
      } catch (err) {
        console.error('Error fetching themes:', err);
        setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-800 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Palette className="h-6 w-6 mr-2 text-indigo-600" />
          <h1 className="text-2xl font-bold">Chủ đề thánh ca</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchThemes()}
          disabled={isLoading}
        >
          <ArrowRight className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>
      
      {themes.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
          <p className="text-gray-800 dark:text-gray-400">Không có chủ đề nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h2 className="text-lg font-bold">{theme.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{theme.description}</p>
              <p className="text-gray-600 dark:text-gray-400">Số lượng thánh ca: {theme.hymn_count}</p>
              <Link to={`/themes/${theme.id}`} className="text-indigo-600 dark:text-indigo-400">
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Themes;
