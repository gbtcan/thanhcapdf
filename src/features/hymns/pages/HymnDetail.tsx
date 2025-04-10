import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import HymnDetailView from '../components/HymnDetailView';
import HymnNotFound from '../components/HymnNotFound';
import LoadingIndicator from '../../../core/components/LoadingIndicator';

const HymnDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hymn, setHymn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchHymnData() {
      if (!id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('hymns_new')
          .select(`
            id, title, lyrics, view_count, created_at,
            hymn_authors!hymn_authors_hymn_id_fkey(
              author:authors!hymn_authors_author_id_fkey(id, name)
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          setNotFound(true);
        } else {
          setHymn(data);
          
          // Fixed: Properly handle RPC call with try-catch
          try {
            // Increment view count
            await supabase.rpc('increment_hymn_view', { hymn_id: id });
          } catch (rpcError) {
            console.error('Error incrementing view count:', rpcError);
            // We don't need to set the main error state here as this is a non-critical operation
          }
        }
      } catch (err) {
        console.error('Error fetching hymn:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch hymn'));
        
        if ((err as any)?.code === 'PGRST116') {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchHymnData();
  }, [id]);

  if (isLoading) {
    return <LoadingIndicator message="Đang tải thông tin thánh ca..." />;
  }

  if (notFound) {
    return <HymnNotFound id={id} />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-md">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Lỗi khi tải thánh ca</h2>
        <p className="text-red-600 dark:text-red-200">{error.message}</p>
      </div>
    );
  }

  return <HymnDetailView hymn={hymn} />;
};

export default HymnDetail;
