import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import HymnCard from './HymnCard';
import { Skeleton } from '../../../core/components/ui/skeleton';
import EmptyState from './EmptyState';

interface RecentHymnsSectionProps {
  limit?: number;
}

interface Hymn {
  id: string;
  title: string;
  created_at: string;
  // Remove slug property as it doesn't exist in database
  authors?: {author: {id: string, name: string}}[];
}

const RecentHymnsSection: React.FC<RecentHymnsSectionProps> = ({ limit = 4 }) => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchRecentHymns() {
      setIsLoading(true);
      try {
        // Remove slug from the query since it doesn't exist
        const { data, error } = await supabase
          .from('hymns_new')
          .select(`
            id, title, created_at,
            hymn_authors!hymn_authors_hymn_id_fkey(
              author:authors!hymn_authors_author_id_fkey(id, name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        setHymns(data || []);
      } catch (err) {
        console.error('Error fetching recent hymns:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch hymns'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecentHymns();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-48">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Không thể tải dữ liệu" message="Đã xảy ra lỗi khi tải danh sách thánh ca mới." />;
  }

  if (!hymns.length) {
    return <EmptyState title="Không tìm thấy thánh ca" message="Hiện chưa có thánh ca mới nào." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {hymns.map((hymn) => (
        // Removed the wrapping Link component to avoid nested anchors
        <HymnCard hymn={hymn} key={hymn.id} />
      ))}
    </div>
  );
};

export default RecentHymnsSection;
