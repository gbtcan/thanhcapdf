import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTags } from '../hooks/useTags';
import { LoadingIndicator, NetworkErrorBoundary } from '../../../core/components';
import { Search, Tag as TagIcon, AlertTriangle, ArrowRight } from 'lucide-react';
import { useDebounce } from '../../../core/hooks/useDebounce';

const TagsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const { tags, isLoading, error } = useTags(debouncedQuery);
  
  // Group tags by first letter for alphabetical listing
  const groupedTags = tags.reduce<Record<string, typeof tags>>((acc, tag) => {
    const firstChar = tag.name.charAt(0).toUpperCase();
    if (!acc[firstChar]) {
      acc[firstChar] = [];
    }
    acc[firstChar].push(tag);
    return acc;
  }, {});
  
  // Sort the keys (letters) alphabetically
  const sortedLetters = Object.keys(groupedTags).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Thẻ Tag Thánh Ca
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Khám phá thánh ca theo các thẻ tag chuyên dụng
        </p>
      </div>
      
      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <NetworkErrorBoundary>
        {isLoading ? (
          <LoadingIndicator message="Đang tải danh sách tag..." />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Lỗi khi tải danh sách tag
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-200">
                Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
              </p>
            </div>
          </div>
        ) : tags.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center">
            <TagIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">
              Không tìm thấy tag nào
            </h3>
            {searchQuery && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Không có tag nào khớp với "{searchQuery}"
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Alphabet index */}
            {!searchQuery && (
              <div className="py-2 px-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-center sm:justify-start">
                {sortedLetters.map(letter => (
                  <a key={letter} href={`#letter-${letter}`} className="px-2 py-1 rounded text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
                    {letter}
                  </a>
                ))}
              </div>
            )}
            
            {/* Tag groups or search results */}
            <div className="p-6">
              {searchQuery ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {tags.map(tag => (
                    <TagItem key={tag.id} tag={tag} />
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedLetters.map(letter => (
                    <div key={letter} id={`letter-${letter}`} className="scroll-mt-20">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {letter}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {groupedTags[letter].map(tag => (
                          <TagItem key={tag.id} tag={tag} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </NetworkErrorBoundary>
    </div>
  );
};

// Tag item component
interface TagItemProps {
  tag: {
    id: string | number;
    name: string;
    hymn_count?: number;
  };
}

const TagItem: React.FC<TagItemProps> = ({ tag }) => {
  return (
    <Link
      to={`/tags/${tag.id}`}
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
    >
      <div className="flex items-center">
        <TagIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2 flex-shrink-0" />
        <span className="font-medium text-gray-800 dark:text-gray-200">{tag.name}</span>
      </div>
      <div className="flex items-center">
        {tag.hymn_count !== undefined && (
          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
            {tag.hymn_count} bài
          </span>
        )}
        <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 ml-2" />
      </div>
    </Link>
  );
};

export default TagsPage;
