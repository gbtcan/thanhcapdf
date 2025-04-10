import React from 'react';
import { Link } from 'react-router-dom';
import { RecommendedItem } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendedHymnsProps {
  items: RecommendedItem[];
  isLoading?: boolean;
}

const RecommendedHymns: React.FC<RecommendedHymnsProps> = ({
  items,
  isLoading = false
}) => {
  // Get reason text
  const getReasonText = (reason?: string) => {
    switch (reason) {
      case 'popular':
        return 'Phổ biến';
      case 'seasonal':
        return 'Theo mùa';
      case 'recent':
        return 'Mới thêm';
      case 'personalized':
        return 'Dành cho bạn';
      default:
        return 'Đề xuất';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Thánh ca đề xuất</h3>
        </div>
        
        <Link 
          to="/hymns" 
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center"
        >
          Xem tất cả
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-md overflow-hidden">
              <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Không có đề xuất</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Chúng tôi đang chuẩn bị đề xuất phù hợp cho bạn.
          </p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link 
              key={`${item.type}-${item.id}`}
              to={`/hymns/${item.id}`}
              className="group relative rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-750">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl text-gray-300 dark:text-gray-600">♪</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded px-2 py-0.5">
                  <span className="text-xs text-white">{getReasonText(item.reason)}</span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedHymns;
