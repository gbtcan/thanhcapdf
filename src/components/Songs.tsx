import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { HymnWithRelations, HymnAuthorRelation } from '../types';

const Songs = () => {
  const { data: hymns, isLoading, error } = useQuery<HymnWithRelations[]>({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymns')
        .select(`
          *,
          hymn_authors(
            authors(*)
          ),
          hymn_categories(
            categories(*)
          ),
          pdf_files(*)
        `)
        .order('title');

      if (error) throw error;
      return data || []; // Add fallback to prevent null
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error fetching songs:', error);
    return <div>Error loading songs: {(error as Error).message}</div>;
  }

  return (
    <div>
      {hymns && hymns.length === 0 ? (
        <div>No songs found.</div>
      ) : (
        hymns?.map((hymn) => (
          <Link key={hymn.id} to={`/songs/${hymn.id}`}>
            <div>
              <h2>{hymn.title}</h2>
              <p>
                {/* Fix: Correctly access author names with explicit typing */}
                {hymn.hymn_authors?.map((item: HymnAuthorRelation) => 
                  item.authors?.name
                ).filter(Boolean).join(', ') || 'Unknown Author'}
              </p>
              <Music className="h-5 w-5" />
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default Songs;
