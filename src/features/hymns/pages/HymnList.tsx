import React, { useState, useCallback, useMemo } from 'react';
import MainLayout from '../../layouts/components/MainLayout';
import HymnListFilters from '../components/HymnListFilters';
import HymnCard from '../components/HymnCard';
import { Pagination } from '../../../core/components/ui/pagination';
import { useHymnsList } from '../hooks/useHymnsList';
import { useThemes } from '../../catalog/hooks/useThemes';
import { useAuthors } from '../../catalog/hooks/useAuthors';
import { Loader2, Music } from 'lucide-react';
import { useStableObject } from '../../../core/hooks/useOptimized';

const HymnList: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'title',
    sortOrder: 'asc' as 'asc' | 'desc',
    themeId: '',
    authorId: ''
  });
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Stable filter object to prevent unnecessary re-renders
  const stableFilters = useStableObject(filters);
  
  // Fetch data
  const { hymns, totalHymns, isLoading, error, refetch } = useHymnsList({
    ...stableFilters,
    page,
    pageSize
  });
  
  const { themes } = useThemes();
  const { authors } = useAuthors();
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0); // Reset to first page when filters change
  }, []);
  
  // Handle filter reset
  const handleReset = useCallback(() => {
    setFilters({
      search: '',
      sortBy: 'title',
      sortOrder: 'asc',
      themeId: '',
      authorId: ''
    });
    setPage(0);
  }, []);
  
  // Memoize the list of hymns to prevent unnecessary re-renders
  const hymnsList = useMemo(() => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hymns.map(hymn => (
          <HymnCard key={hymn.id} hymn={hymn} />
        ))}
      </div>
    );
  }, [hymns]);
  
  // Memoize empty state
  const emptyState = useMemo(() => (
    <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
      <Music className="h-12 w-12 mx-auto text-gray-400" />
      <h3 className="mt-4 text-lg font-medium">Không tìm thấy thánh ca</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Không tìm thấy thánh ca nào phù hợp với các bộ lọc. Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
      </p>
    </div>
  ), []);
  
  const fetchHymnsWithRelations = async () => {
    const { data } = await supabase
      .from('hymns')
      .select(`
        *,
        hymn_authors(
          authors(*)
        ),
        hymn_themes(
          themes(*)
        )
      `)
      .order('title')
      .limit(20);
      
    // Định dạng lại kết quả
    return data?.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map(item => item.authors) || [],
      themes: hymn.hymn_themes?.map(item => item.themes) || []
    })) || [];
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Danh sách thánh ca</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Xem và tìm kiếm thánh ca từ thư viện của chúng tôi
            </p>
          </div>
          
          {/* Filters */}
          <HymnListFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={refetch}
            onReset={handleReset}
            themes={themes || []}
            authors={authors || []}
          />
          
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hymns.length > 0 ? (
            <>
              {hymnsList}
              
              {/* Pagination */}
              {totalHymns > pageSize && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    pageSize={pageSize}
                    totalItems={totalHymns}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              )}
            </>
          ) : (
            emptyState
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HymnList;
