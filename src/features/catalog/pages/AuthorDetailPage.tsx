import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthorDetail } from '../hooks/useAuthorDetail';
import { HymnCard } from '../../hymns/components';
import { LoadingIndicator, NetworkErrorBoundary, AlertBanner } from '../../../core/components';
import { Calendar, ExternalLink, ArrowLeft, BookOpen, User, Share2, Clock } from 'lucide-react';
import { ShareButton } from '../../social/components';
import { formatDate } from '../../../core/utils/formatters';

const AuthorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { author, hymns, isLoading, error } = useAuthorDetail(id);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingIndicator message="Đang tải thông tin tác giả..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AlertBanner
          type="error"
          title="Không thể tải thông tin tác giả"
          message="Đã xảy ra lỗi khi tải thông tin tác giả. Vui lòng thử lại sau."
        />
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Handle not found state
  if (!author) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-8 text-center">
          <User className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Không tìm thấy tác giả
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tác giả bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              to="/authors"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tất cả tác giả
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/authors"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tất cả tác giả
        </Link>
      </div>
      
      {/* Author header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {author.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                {(author.birth_year || author.death_year) && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {author.birth_year ? author.birth_year : '?'} 
                    {author.death_year ? ` - ${author.death_year}` : ''}
                  </div>
                )}
                
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  {hymns.length} thánh ca
                </div>
                
                {author.created_at && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Đăng tải ngày {formatDate(author.created_at)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <ShareButton
                url={window.location.href}
                title={`Tác giả: ${author.name}`}
                description={`Tìm hiểu về tác giả ${author.name} và các thánh ca của họ.`}
              />
            </div>
          </div>
          
          {/* Biography */}
          {author.biography && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Tiểu sử
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                {author.biography}
              </div>
            </div>
          )}
          
          {/* External links */}
          {author.external_url && (
            <div className="mt-6">
              <a 
                href={author.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Thông tin chi tiết về tác giả
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Author hymns */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Thánh ca của {author.name} ({hymns.length})
        </h2>
        
        <NetworkErrorBoundary>
          {hymns.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
                Chưa có thánh ca nào
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tác giả này hiện chưa có thánh ca nào trong hệ thống.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hymns.map(hymn => (
                <HymnCard key={hymn.id} hymn={hymn} />
              ))}
            </div>
          )}
        </NetworkErrorBoundary>
      </div>
    </div>
  );
};

export default AuthorDetailPage;
