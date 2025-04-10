import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../../core/hooks/useDebounce';
import { supabase } from '../../../lib/supabase';
import { Search as SearchIcon } from 'lucide-react';
import LoadingIndicator from '../../../core/components/LoadingIndicator';
import HymnsGrid from '../components/HymnsGrid';
import EmptyState from '../components/EmptyState';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  number?: number;
  slug?: string;
  type: 'hymn' | 'author' | 'theme';
}

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Thực hiện tìm kiếm mỗi khi debouncedQuery thay đổi
  React.useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      
      setIsLoading(true);
      setHasSearched(true);
      
      try {
        // Tìm kiếm thánh ca
        const { data: hymns, error: hymnsError } = await supabase
          .from('hymns')
          .select('id, title, subtitle, number, slug')
          .or(`title.ilike.%${debouncedQuery}%,subtitle.ilike.%${debouncedQuery}%`)
          .eq('published', true)
          .limit(30);
        
        if (hymnsError) throw hymnsError;
        
        const hymnResults: SearchResult[] = (hymns || []).map(hymn => ({
          ...hymn,
          type: 'hymn'
        }));
        
        setResults(hymnResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
      
      // Cập nhật search params trên URL
      setSearchParams({ q: debouncedQuery });
    }
    
    performSearch();
  }, [debouncedQuery]);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tìm kiếm thánh ca</h1>
      
      <div className="mb-8 max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Nhập tiêu đề, số bài, tác giả..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Nhập ít nhất 2 ký tự để tìm kiếm thánh ca phù hợp.
        </p>
      </div>
      
      {isLoading ? (
        <LoadingIndicator message="Đang tìm kiếm..." />
      ) : results.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Tìm thấy {results.length} kết quả cho "{debouncedQuery}"
          </h2>
          <HymnsGrid hymns={results} />
        </>
      ) : hasSearched && (
        <EmptyState 
          title="Không tìm thấy kết quả nào"
          description="Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả."
        />
      )}
    </div>
  );
};

export default Search;
