import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Hymn } from '../types';
import HymnCard from './HymnCard';
import Pagination from './Pagination';
import LoadingIndicator from './LoadingIndicator';
import AlertBanner from './AlertBanner';
import { ArrowDownAZ, SortAsc } from 'lucide-react';

interface HymnListProps {
  title?: string;
  themeId?: string | number;
  authorId?: string | number;
  limit?: number;
  showPagination?: boolean;
  emptyMessage?: string;
  showSorting?: boolean;
}

const HymnList: React.FC<HymnListProps> = ({
  title,
  themeId,
  authorId,
  limit = 10,
  showPagination = true,
  emptyMessage = "No hymns found",
  showSorting = true
}) => {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'title' | 'newest' | 'popular'>('title');
  
  // Calculate pagination parameters
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Fetch hymns based on filters
  const {
    data: hymnsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['hymns-list', themeId, authorId, sortBy, page, limit],
    queryFn: async () => {
      try {
        let query = supabase
          .from('hymns_new')
          .select(`
            id,
            title,
            lyrics,
            created_at,
            updated_at,
            hymn_authors(author_id, authors(id, name)),
            hymn_themes(theme_id, themes(id, name)),
            hymn_pdf_files(id, pdf_path)
          `, { count: 'exact' });
        
        // Apply theme filter
        if (themeId) {
          query = query.eq('hymn_themes.theme_id', themeId);
        }
        
        // Apply author filter
        if (authorId) {
          query = query.eq('hymn_authors.author_id', authorId);
        }
        
        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            // Use a subquery to count views
            query = query.order('id', { foreignTable: 'hymn_views', ascending: false });
            break;
          case 'title':
          default:
            query = query.order('title');
            break;
        }
        
        // Apply pagination
        query = query.range(from, to);
        
        // Execute query
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Transform data to proper Hymn objects with nested relations
        const hymns = data.map(hymn => ({
          ...hymn,
          authors: hymn.hymn_authors?.map((ha) => ha.authors) || [],
          themes: hymn.hymn_themes?.map((ht) => ht.themes) || [],
          pdf_files: hymn.hymn_pdf_files?.map(pdf => ({
            ...pdf,
            file_url: pdf.pdf_path
          })) || []
        }));
        
        const totalPages = count ? Math.ceil(count / limit) : 0;
        
        return { 
          data: hymns, 
          count, 
          totalPages 
        };
      } catch (error) {
        console.error('Error fetching hymns:', error);
        throw error;
      }
    },
    keepPreviousData: true
  });

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as any);
    setPage(1);
  };

  return (
    <div className="w-full">
      {/* Title and sorting options */}
      {(title || showSorting) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          
          {showSorting && (
            <div className="flex items-center">
              <ArrowDownAZ className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm text-sm"
              >
                <option value="title">Sort by Title</option>
                <option value="newest">Sort by Newest</option>
                <option value="popular">Sort by Popularity</option>
              </select>
            </div>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex justify-center">
          <LoadingIndicator size="medium" message="Loading hymns..." />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <AlertBanner 
          type="error"
          title="Error loading hymns"
          message="There was a problem loading the hymns. Please try again later."
        />
      )}
      
      {/* Empty state */}
      {!isLoading && !error && (!hymnsData || hymnsData.data.length === 0) && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      )}
      
      {/* Hymn cards */}
      {!isLoading && !error && hymnsData && hymnsData.data.length > 0 && (
        <>
          <div className="space-y-4">
            {hymnsData.data.map((hymn) => (
              <HymnCard key={hymn.id} hymn={hymn} />
            ))}
          </div>
          
          {/* Pagination */}
          {showPagination && hymnsData.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={hymnsData.totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
};

export default HymnList;