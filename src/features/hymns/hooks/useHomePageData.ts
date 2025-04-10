import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useHomePageData() {
  return useQuery({
    queryKey: ['homePageData'],
    queryFn: async () => {
      // Get popular hymns
      const { data: popularHymns } = await supabase
        .from('hymns_new')
        .select(`
          id, title, view_count,
          hymn_authors(
            authors(id, name)
          )
        `)
        .order('view_count', { ascending: false })
        .limit(8);
      
      // Get recent hymns
      const { data: recentHymns } = await supabase
        .from('hymns_new')
        .select(`
          id, title, created_at,
          hymn_authors(
            authors(id, name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(8);
      
      // Get popular themes
      const { data: popularThemes } = await supabase
        .from('themes')
        .select(`
          id, name, icon,
          hymn_themes(count)
        `)
        .order('id')
        .limit(6);
      
      return {
        popularHymns: popularHymns?.map(hymn => ({
          ...hymn,
          authors: hymn.hymn_authors?.map(item => item.authors) || []
        })) || [],
        recentHymns: recentHymns?.map(hymn => ({
          ...hymn,
          authors: hymn.hymn_authors?.map(item => item.authors) || []
        })) || [],
        popularThemes: popularThemes?.map(theme => ({
          ...theme,
          count: theme.hymn_themes?.[0]?.count || 0
        })) || []
      };
    },
    staleTime: 300000 // 5 minutes
  });
}
