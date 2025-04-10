import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Filter, SlidersHorizontal, TrendingUp, Clock, Bookmark, Music } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import LoadingIndicator from '../../../core/components/LoadingIndicator';
import { Link } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu
interface Hymn {
  id: string;
  title: string;
  subtitle?: string;
  number?: number;
  slug?: string;
  view_count: number;
  authors?: {author: {id: string, name: string}}[];
}

interface HymnFilters {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  themeId?: string;
  authorId?: string;
}

const HymnsPage: React.FC = () => {
  // State cho dữ liệu và filtering
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0); // Thêm state này
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [themes, setThemes] = useState<Array<{ id: string; name: string }>>([]);
  const [authors, setAuthors] = useState<Array<{ id: string; name: string }>>([]);
  const [filters, setFilters] = useState<HymnFilters>({
    search: '',
    sortBy: 'title',
    sortOrder: 'asc',
    themeId: undefined,
    authorId: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Hàm tải dữ liệu thánh ca
  const fetchHymns = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Đã cập nhật truy vấn chỉ lấy các cột có trong database
      let query = supabase
        .from('hymns_new')
        .select(`
          id, title, view_count, created_at
        `);
      
      // Áp dụng các filter
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      // Áp dụng thể loại/chủ đề nếu được chọn
      if (filters.themeId) {
        const themeHymnsQuery = supabase
          .from('hymn_themes')
          .select('hymn_id')
          .eq('theme_id', filters.themeId);
        
        query = query.in('id', themeHymnsQuery);
      }
      
      // Áp dụng tác giả nếu được chọn
      if (filters.authorId) {
        const authorHymnsQuery = supabase
          .from('hymn_authors')
          .select('hymn_id')
          .eq('author_id', filters.authorId);
        
        query = query.in('id', authorHymnsQuery);
      }
      
      // Áp dụng sắp xếp
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
      
      // Thực hiện query
      const { data, count, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      // Sau khi lấy dữ liệu hymns, ta cần thực hiện các truy vấn bổ sung để lấy thông tin tác giả
      const hymnsWithAuthorInfo = await Promise.all((data || []).map(async (hymn) => {
        // Lấy ID của các tác giả liên quan đến bài hát
        const { data: hymn_authors } = await supabase
          .from('hymn_authors')
          .select('author_id')
          .eq('hymn_id', hymn.id);
        
        const authorIds = hymn_authors?.map(item => item.author_id) || [];
        
        // Nếu có tác giả, lấy thông tin chi tiết
        let authors = [];
        if (authorIds.length > 0) {
          const { data: authorsData } = await supabase
            .from('authors')
            .select('id, name')
            .in('id', authorIds);
            
          authors = authorsData || [];
        }
        
        return {
          ...hymn,
          authors
        };
      }));
      
      setHymns(hymnsWithAuthorInfo);
      setTotalCount(count || 0); // Giờ đây setTotalCount đã được định nghĩa
      
    } catch (err) {
      console.error('Error fetching hymns:', err);
      setError('Không thể tải danh sách thánh ca. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Tải danh sách chủ đề và tác giả cho bộ lọc
  const fetchFilterOptions = async () => {
    try {
      const [themesResponse, authorsResponse] = await Promise.all([
        supabase.from('themes').select('id, name').order('name'),
        supabase.from('authors').select('id, name').order('name')
      ]);
      
      if (themesResponse.error) throw themesResponse.error;
      if (authorsResponse.error) throw authorsResponse.error;
      
      setThemes(themesResponse.data || []);
      setAuthors(authorsResponse.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters: Partial<HymnFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Reset bộ lọc
  const handleResetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'title',
      sortOrder: 'asc',
      themeId: undefined,
      authorId: undefined
    });
  };
  
  // Tải dữ liệu khi component mount hoặc khi bộ lọc thay đổi
  useEffect(() => {
    fetchHymns();
  }, [filters]);
  
  // Tải các tùy chọn bộ lọc khi component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách thánh ca</h1>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </Button>
      </div>
      
      {/* Filter section - Style like MuseScore */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 mb-6' : 'max-h-0'}`}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sắp xếp theo
              </label>
              <select 
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="title">Tên thánh ca</option>
                <option value="view_count">Lượt xem</option>
                <option value="created_at">Ngày tạo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chủ đề
              </label>
              <select
                value={filters.themeId || ""}
                onChange={(e) => handleFilterChange({ themeId: e.target.value || undefined })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tất cả chủ đề</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tác giả
              </label>
              <select
                value={filters.authorId || ""}
                onChange={(e) => handleFilterChange({ authorId: e.target.value || undefined })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tất cả tác giả</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            
            <Button onClick={fetchHymns}>
              Áp dụng
            </Button>
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      <form 
        className="mb-6 relative"
        onSubmit={(e) => {
          e.preventDefault();
          fetchHymns();
        }}
      >
        <Search className="absolute top-1/2 transform -translate-y-1/2 left-4 h-5 w-5 text-gray-400" />
        <input
          type="search"
          placeholder="Tìm kiếm thánh ca..."
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
          className="pl-12 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 bg-white dark:bg-gray-800"
        />
      </form>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <LoadingIndicator message="Đang tải danh sách thánh ca..." />
      ) : hymns.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Không tìm thấy thánh ca nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Thử thay đổi các bộ lọc hoặc tìm kiếm với từ khóa khác.
          </p>
          <Button onClick={handleResetFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Hiển thị {hymns.length} thánh ca
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hymns.map((hymn) => (
              <Link 
                key={hymn.id} 
                to={`/hymns/${hymn.slug || hymn.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="bg-gray-100 dark:bg-gray-700 h-48 relative flex items-center justify-center">
                  <Music className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  {hymn.number && (
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      #{hymn.number}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{hymn.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{hymn.subtitle || '\u00A0'}</p>
                  
                  <div className="flex items-center mt-2 justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center truncate">
                      {hymn.authors && hymn.authors[0] ? (
                        <>
                          <span className="truncate max-w-[120px]">{hymn.authors[0].author.name}</span>
                        </>
                      ) : (
                        'Không rõ tác giả'
                      )}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>{hymn.view_count || 0}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HymnsPage;
