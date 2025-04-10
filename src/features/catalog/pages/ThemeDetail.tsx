import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Music, ArrowLeft } from 'lucide-react';
import { useThemeDetail } from '../hooks';
import { HymnCard } from '../../hymns/components';
import { LoadingIndicator } from '../../../core/components';
import { getThemeColor } from '../utils/themeColors';

const ThemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    theme,
    themeLoading,
    themeError,
    hymns,
    hymnsLoading,
    totalHymns,
    hasMoreHymns,
    nextPage
  } = useThemeDetail(id);
  
  // Loading state
  if (themeLoading) {
    return <LoadingIndicator message="Đang tải thông tin chủ đề..." />;
  }
  
  // Error state
  if (themeError || !theme) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300">
          <p className="font-medium">Lỗi khi tải thông tin chủ đề</p>
          <p className="mt-1">{themeError instanceof Error ? themeError.message : 'Không tìm thấy chủ đề'}</p>
          <Link 
            to="/themes" 
            className="mt-4 inline-flex items-center text-red-600 dark:text-red-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách chủ đề
          </Link>
        </div>
      </div>
    );
  }
  
  // Get theme color
  const themeColor = getThemeColor(theme.color || 'blue');
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/themes" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Danh sách chủ đề
        </Link>
      </div>
      
      {/* Theme header */}
      <div className={`${themeColor.bgLight} dark:${themeColor.bgDark} rounded-lg border ${themeColor.border} dark:${themeColor.borderDark} p-6 mb-8`}>
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${themeColor.bg} rounded-full p-3 mr-4`}>
            <BookOpen className={`h-6 w-6 ${themeColor.text}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {theme.name}
            </h1>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Music className="h-4 w-4 mr-1" />
              <span>{totalHymns} bài hát</span>
            </div>
          </div>
        </div>
        
        {theme.description && (
          <div className="mt-4 text-gray-700 dark:text-gray-300">
            {theme.description}
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Music className="h-5 w-5 mr-2 text-indigo-600" />
          Bài hát thuộc chủ đề {theme.name}
        </h2>
        
        {hymnsLoading ? (
          <LoadingIndicator message="Đang tải bài hát..." />
        ) : hymns.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Chưa có bài hát nào</h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Chưa có bài hát nào thuộc chủ đề này
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hymns.map((hymn) => (
                <HymnCard 
                  key={hymn.id} 
                  hymn={hymn} 
                  showActions={true}
                />
              ))}
            </div>
            
            {hasMoreHymns && (
              <div className="mt-8 text-center">
                <button
                  onClick={nextPage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Xem thêm bài hát
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeDetail;
