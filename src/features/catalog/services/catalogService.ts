/**
 * Service for catalog data (authors, themes, tags)
 */
import { supabase } from '../../../lib/supabase';
import { Author, Theme, Tag } from '../../hymns/types';

/**
 * Get all authors
 */
export async function getAllAuthors(page = 0, pageSize = 20): Promise<{
  authors: Author[];
  totalCount: number;
  hasMore: boolean;
}> {
  try {
    const { data, error, count } = await supabase
      .from('authors')
      .select('*', { count: 'exact' })
      .order('name')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) throw error;
    
    // Get hymn count for each author
    for (const author of data || []) {
      const { count: hymnCount } = await supabase
        .from('hymn_authors')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', author.id);
        
      author.hymn_count = hymnCount || 0;
    }
    
    return {
      authors: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > (page + 1) * pageSize
    };
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
}

/**
 * Get author by ID with their hymns
 */
export async function getAuthorById(id: string, hymnPage = 0, hymnPageSize = 8): Promise<{
  author: Author;
  hymns: any[];
  totalHymns: number;
  hasMoreHymns: boolean;
}> {
  try {
    // Get author details
    const { data: author, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Get hymns by author with pagination
    const { data: hymnLinks, count } = await supabase
      .from('hymn_authors')
      .select('hymn_id', { count: 'exact' })
      .eq('author_id', id)
      .range(hymnPage * hymnPageSize, (hymnPage + 1) * hymnPageSize - 1);
      
    // Get full hymn data
    let hymns = [];
    if (hymnLinks && hymnLinks.length > 0) {
      const hymnIds = hymnLinks.map(link => link.hymn_id);
      
      const { data: hymnData } = await supabase
        .from('hymns_new')
        .select('*')
        .in('id', hymnIds);
        
      hymns = hymnData || [];
      
      // Enrich with basic relations
      for (const hymn of hymns) {
        // Add authors
        const { data: authorData } = await supabase
          .from('hymn_authors')
          .select('authors(id, name)')
          .eq('hymn_id', hymn.id);
          
        hymn.authors = authorData?.map((a: any) => ({ author: a.authors })) || [];
        
        // Add PDF count
        const { data: pdfData } = await supabase
          .from('hymn_pdf_files')
          .select('id')
          .eq('hymn_id', hymn.id);
          
        hymn.pdf_files = pdfData || [];
      }
    }
    
    return {
      author,
      hymns,
      totalHymns: count || 0,
      hasMoreHymns: (count || 0) > (hymnPage + 1) * hymnPageSize
    };
  } catch (error) {
    console.error(`Error fetching author ${id}:`, error);
    throw error;
  }
}

/**
 * Get all themes with hymn counts
 */
export async function getAllThemes(page = 0, pageSize = 20): Promise<{
  themes: Theme[];
  totalCount: number;
  hasMore: boolean;
}> {
  // Similar to getAllAuthors but for themes
  try {
    const { data, error, count } = await supabase
      .from('themes')
      .select('*', { count: 'exact' })
      .order('name')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) throw error;
    
    // Get hymn count for each theme
    for (const theme of data || []) {
      const { count: hymnCount } = await supabase
        .from('hymn_themes')
        .select('*', { count: 'exact', head: true })
        .eq('theme_id', theme.id);
        
      theme.hymn_count = hymnCount || 0;
    }
    
    // Assign random colors for UI
    const themeColors = ['blue', 'green', 'purple', 'pink', 'yellow', 'red', 'indigo', 'teal', 'orange', 'cyan'];
    
    (data || []).forEach((theme, index) => {
      theme.color = themeColors[index % themeColors.length];
    });
    
    return {
      themes: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > (page + 1) * pageSize
    };
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
}

/**
 * Get popular themes (ones with most hymns)
 */
export async function getPopularThemes(limit = 6): Promise<Theme[]> {
  try {
    // Get all themes
    const { data: themes } = await supabase
      .from('themes')
      .select('*')
      .order('name');
      
    const themeList = themes || [];
    
    // Get hymn count for each theme
    for (const theme of themeList) {
      const { count } = await supabase
        .from('hymn_themes')
        .select('*', { count: 'exact', head: true })
        .eq('theme_id', theme.id);
        
      theme.hymn_count = count || 0;
    }
    
    // Sort by hymn count and limit
    themeList.sort((a, b) => (b.hymn_count || 0) - (a.hymn_count || 0));
    
    // Assign colors for UI
    const themeColors = ['blue', 'green', 'purple', 'pink', 'yellow', 'red', 'indigo', 'teal', 'orange', 'cyan'];
    
    themeList.slice(0, limit).forEach((theme, index) => {
      theme.color = themeColors[index % themeColors.length];
    });
    
    return themeList.slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular themes:', error);
    return [];
  }
}
