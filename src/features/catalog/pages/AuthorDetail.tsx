import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Music, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useAuthorDetail } from '../hooks';
import { HymnCard } from '../../hymns/components';
import { formatDate } from '../../../utils/formatters';
import { LoadingIndicator } from '../../../core/components';

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    author,
    authorLoading,
    authorError,
    hymns,
    hymnsLoading,
    totalHymns,
    hasMoreHymns,
    nextPage
  } = useAuthorDetail(id);
  
  // Loading state
  if (authorLoading) {
    return <LoadingIndicator message="Đang tải thông tin tác giả..." />;
  }
  
  // Error state
  if (authorError || !author) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300">
          <p className="font-medium">Lỗi khi tải thông tin tác giả</p>
          <p className="mt-1">{authorError instanceof Error ? authorError.message : 'Không tìm thấy tác giả'}</p>
          <Link 
            to="/authors" 
            className="mt-4 inline-flex items-center text-red-600 dark:text-red-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách tác giả
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/authors" 
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Danh sách tác giả
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Author header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row">
            {/* Author image/avatar */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {author.image_url ? (
                <img 
                  src={author.image_url} 
                  alt={author.name}
                  className="h-32 w-32 rounded-lg object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <User className="h-16 w-16 text-indigo-500" />
                </div>
              )}
            </div>
            
            {/* Author info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {author.name}
              </h1>
              
              <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {(author.birth_year || author.death_year) && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {author.birth_year && author.death_year
                      ? `${author.birth_year} - ${author.death_year}`
                      : author.birth_year
                        ? `Sinh: ${author.birth_year}`
                        : `Mất: ${author.death_year}`
                    }
                  </div>
                )}
                
                {author.country && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {author.country}
                  </div>
                )}
                
                <div className="flex items-center">
                  <Music className="h-4 w-4 mr-1" />
                  {author.hymn_count || totalHymns} bài hát
                </div>
              </div>
              
              {author.created_at && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Thêm vào: {formatDate(author.created_at)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Author biography */}
        {author.biography && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Tiểu sử
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {author.biography.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {/* Author's hymns */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Music className="h-5 w-5 mr-2 text-indigo-600" />
            Bài hát của {author.name}
          </h2>
          
          {hymnsLoading ? (
            <LoadingIndicator message="Đang tải bài hát..." />
          ) : hymns.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">Chưa có bài hát nào</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Không tìm thấy bài hát nào của tác giả này
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
    </div>
  );
};

export default AuthorDetail;
