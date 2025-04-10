import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/components/MainLayout';
import { useSearch } from '../hooks/useSearch';
import SearchInput from '../components/SearchInput';
import SearchResults from '../components/SearchResults';
import SearchHistory from '../components/SearchHistory';
import { Loader2, Search as SearchIcon } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(searchQuery);
  
  const { 
    results, 
    totalResults, 
    isLoading, 
    error, 
    search,
    searchHistory,
    clearHistory
  } = useSearch();
  
  // Perform search when query from URL changes
  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      search(searchQuery);
    }
  }, [searchQuery, search]);
  
  // Handle search submission
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setSearchParams({ q: newQuery });
    search(newQuery);
  };
  
  // Clear search query and results
  const handleClearSearch = () => {
    setQuery('');
    setSearchParams({});
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Tìm kiếm</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tìm kiếm thánh ca, tác giả, chủ đề và bài viết
            </p>
          </div>
          
          {/* Search form */}
          <SearchInput 
            query={query}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
          
          {/* Search content */}
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 dark:text-red-400">
                <p>Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.</p>
              </div>
            ) : searchQuery ? (
              <SearchResults 
                results={results}
                totalResults={totalResults}
                query={searchQuery}
              />
            ) : (
              <div className="space-y-8">
                {searchHistory.length > 0 && (
                  <SearchHistory 
                    history={searchHistory} 
                    onSelect={handleSearch}
                    onClear={clearHistory} 
                  />
                )}
                
                {/* Empty state when no search query */}
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <SearchIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">
                    Tìm kiếm thánh ca, tác giả, hoặc chủ đề
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Nhập từ khóa vào ô tìm kiếm để bắt đầu. Bạn có thể tìm theo tên thánh ca, 
                    tác giả, chủ đề hoặc nội dung.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
