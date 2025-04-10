/**
 * Hook for accessing and managing hymns
 */

import { useState, useEffect, useCallback } from 'react';
import { HymnFilters, HymnWithRelations } from '../types';
import { supabase } from '../../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Hymn, HymnFilters } from '../types';
import { fetchHymns } from '../api/hymnApi';

interface UseHymnsReturn {
  hymns: HymnWithRelations[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refresh: () => Promise<void>;
}

/**
 * Hook để lấy danh sách thánh ca có sử dụng query params
 */
export function useHymns(
  page: number = 0,
  pageSize: number = 12,
  filters?: HymnFilters
) {
  return useQuery({
    queryKey: ['hymns', page, pageSize, filters],
    queryFn: () => fetchHymns(page, pageSize, filters),
    keepPreviousData: true,
  });
}
