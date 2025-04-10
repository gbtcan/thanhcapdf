import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import HymnCard from './HymnCard';
import { Skeleton } from '../../../core/components/ui/skeleton';
import EmptyState from './EmptyState';

interface PopularHymnsSectionProps {
  limit?: number;
}

interface Hymn {
  id: string;
  title: string;
  view_count: number;
  // Remove slug property as it doesn't exist in database
  authors?: {author: {id: string, name: string}}[];
}

const PopularHymnsSection: React.FC<PopularHymnsSectionProps> = ({ limit = 5 }) => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchPopularHymns() {
      setIsLoading(true);
      try {
        // Remove slug from the query since it doesn't exist
        const { data, error } = await supabase
          .from('hymns_new')
          .select(`
            id, title, view_count,
            hymn_authors!hymn_authors_hymn_id_fkey(
              author:authors!hymn_authors_author_id_fkey(id, name)
            )
          `)
          .order('view_count', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        setHymns(data || []);
      } catch (err) {
        console.error('Error fetching popular hymns:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch hymns'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPopularHymns();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-48">
            <Skeleton className="h-full w-full" />
          </div>
        ))} 
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Không thể tải dữ liệu" message="Đã xảy ra lỗi khi tải danh sách thánh ca phổ biến." />;
  }

  if (!hymns.length) {
    return <EmptyState title="Không tìm thấy thánh ca" message="Hiện chưa có thánh ca nào." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {hymns.map((hymn) => (
        // Remove the Link wrapper since HymnCard already has a Link inside it
        <HymnCard hymn={hymn} key={hymn.id} />
      ))}
    </div>
  );
};

export default PopularHymnsSection;
