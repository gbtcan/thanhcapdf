import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getPopularThemes } from '../services/catalogService';
import ThemeCard from './ThemeCard';
import { LoadingIndicator } from '../../../core/components';

const ThemesCarousel: React.FC = () => {
  const { data: themes, isLoading } = useQuery({
    queryKey: ['popular-themes'],
    queryFn: () => getPopularThemes(6),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chủ đề phổ biến</h2>
        <Link 
          to="/themes" 
          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
        >
          Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      {isLoading ? (
        <LoadingIndicator message="Đang tải chủ đề..." />
      ) : themes && themes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chưa có chủ đề nào</p>
        </div>
      )}
    </section>
  );
};

export default ThemesCarousel;
