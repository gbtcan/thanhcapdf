/**
 * API functions for the Hymns feature
 */
import { supabaseClient } from '../../../lib/supabase/client';
import { Hymn, HymnWithRelations, HymnFilters, PdfFile, AudioFile, HymnDetail } from '../types';
import { handleSupabaseError } from '../../../core/utils/error-handler';
import { supabase } from '../../../lib/supabase';

// Remove duplicate function declarations and keep only the more complete versions

/**
 * Fetch a list of hymns based on filters
 */
export async function fetchHymns(
  page = 0, 
  pageSize = 10, 
  filters?: HymnFilters
): Promise<{ hymns: HymnWithRelations[], total: number }> {
  try {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    // Đơn giản hóa truy vấn - sử dụng cú pháp cơ bản hơn
    let query = supabaseClient
      .from('hymns_new')
      .select(`
        *,
        hymn_authors(
          authors(id, name)
        ),
        hymn_themes(
          themes(id, name)
        ),
        hymn_tags(
          tags(id, name)
        ),
        hymn_pdf_files(*),
        hymn_audio_files(*)
      `, { count: 'exact' });
      
    // Apply filters
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    if (filters?.author) {
      query = query.eq('hymn_authors.author_id', filters.author);
    }
    
    if (filters?.theme) {
      query = query.eq('hymn_themes.theme_id', filters.theme);
    }
    
    if (filters?.tag) {
      query = query.eq('hymn_tags.tag_id', filters.tag);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    // Apply sorting
    const sortField = filters?.sortBy || 'title';
    const sortOrder = filters?.sortDirection === 'desc' ? { ascending: false } : { ascending: true };
    query = query.order(sortField, sortOrder);

    const { data, error, count } = await query.range(start, end);
    
    if (error) throw error;
    
    // Định dạng lại kết quả để khớp với cấu trúc HymnWithRelations
    const processedHymns = data?.map(hymn => ({
      ...hymn,
      authors: hymn.hymn_authors?.map(item => item.authors) || [],
      themes: hymn.hymn_themes?.map(item => item.themes) || [],
      tags: hymn.hymn_tags?.map(item => item.tags) || [],
      pdf_files: hymn.hymn_pdf_files || [],
      audio_files: hymn.hymn_audio_files || [],
    })) || [];
    
    return {
      hymns: processedHymns,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching hymns:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single hymn by ID with related data
 */
export async function fetchHymnById(id: string): Promise<Hymn | null> {
  try {
    const { data, error } = await supabaseClient
      .from('hymns_new')
      .select(`
        *,
        authors:hymn_authors!hymn_authors_hymn_id_fkey(
          author:authors!hymn_authors_author_id_fkey(*)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Hymn;
  } catch (error) {
    console.error('Error fetching hymn:', error);
    return null;
  }
}

/**
 * Fetch hymn with full details by ID
 */
export async function fetchHymnWithDetails(id: string): Promise<HymnDetail | null> {
  try {
    // Get hymn base data
    const { data: hymn, error: hymnError } = await supabaseClient
      .from('hymns_new')
      .select(`
        id, title, lyrics, view_count, created_at, updated_at, created_by
      `)
      .eq('id', id)
      .single();
      
    if (hymnError) throw hymnError;
    if (!hymn) return null;
    
    // Get authors
    const { data: authors, error: authorsError } = await supabaseClient
      .from('hymn_authors')
      .select(`
        authors:authors!hymn_authors_author_id_fkey(id, name, biography)
      `)
      .eq('hymn_id', id);
      
    if (authorsError) throw authorsError;
    
    // Get themes
    const { data: themes, error: themesError } = await supabaseClient
      .from('hymn_themes')
      .select(`
        themes:themes!hymn_themes_theme_id_fkey(id, name, description)
      `)
      .eq('hymn_id', id);
      
    if (themesError) throw themesError;
    
    // Get PDF files
    const { data: pdfFiles, error: pdfError } = await supabaseClient
      .from('hymn_pdf_files')
      .select('*')
      .eq('hymn_id', id);
      
    if (pdfError) throw pdfError;
    
    // Return detailed hymn object
    return {
      ...hymn,
      authors: authors?.map(a => a.authors) || [],
      themes: themes?.map(t => t.themes) || [],
      pdf_files: pdfFiles || []
    };
  } catch (error) {
    console.error('Error fetching hymn details:', error);
    return null;
  }
}

// Rest of the functions...

/**
 * Increment hymn view count and record view in hymn_views table
 */
export async function incrementHymnView(hymnId: string, userId?: string): Promise<boolean> {
  try {
    // Use the public_increment_hymn_view RPC function 
    // Only passing hymnId as that's the only parameter the function accepts
    const { error } = await supabaseClient
      .rpc('public_increment_hymn_view', { 
        hymn_id: hymnId
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return false;
  }
}

// Continue with other functions...

/**
 * Create a new hymn
 */
export async function createHymn(hymn: Partial<Hymn>): Promise<Hymn> {
  try {
    const { data, error } = await supabaseClient
      .from('hymns_new') // Updated to use hymns_new
      .insert(hymn)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating hymn:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update an existing hymn
 */
export async function updateHymn(id: string, updates: Partial<Hymn>): Promise<Hymn> {
  try {
    const { data, error } = await supabaseClient
      .from('hymns_new') // Updated to use hymns_new
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating hymn ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a hymn
 */
export async function deleteHymn(id: string): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('hymns_new') // Updated to use hymns_new
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting hymn ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Upload a PDF file for a hymn
 */
export async function uploadHymnPdf(
  hymnId: string, 
  file: File, 
  fileName?: string
): Promise<PdfFile> {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `hymns/${hymnId}/${Date.now()}.${fileExt}`;
    
    // Upload to storage
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('hymn-pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (storageError) throw storageError;
    
    // Create record in database
    const fileRecord = {
      hymn_id: hymnId,
      file_key: storageData.path,
      title: fileName || file.name,
      file_type: file.type,
      size_bytes: file.size
    };
    
    const { data, error } = await supabaseClient
      .from('hymn_pdf_files')
      .insert(fileRecord)
      .select()
      .single();
      
    if (error) throw error;
    
    // Get public URL
    const { data: publicUrlData } = supabaseClient
      .storage
      .from('hymn-pdfs')
      .getPublicUrl(storageData.path);
    
    return {
      ...data,
      file_url: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error(`Error uploading PDF for hymn ${hymnId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch PDF files for a hymn
 */
export async function fetchHymnPdfFiles(hymnId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('hymn_pdf_files')
      .select(`
        *,
        uploader:uploaded_by(
          id, email
        )
      `)
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process data to add URL and uploader info
    const processedData = data.map(pdf => {
      // Get public URL
      const { publicUrl } = supabaseClient
        .storage
        .from('hymn-files')
        .getPublicUrl(pdf.pdf_path).data;
      
      return {
        ...pdf,
        url: publicUrl,
        file_name: pdf.pdf_path.split('/').pop() || 'unknown.pdf',
        uploader: pdf.uploader ? {
          id: pdf.uploader.id,
          name: pdf.uploader.email,
          avatar: null
        } : undefined
      };
    });
    
    return processedData;
  } catch (error) {
    console.error('Error fetching PDF files:', error);
    throw error;
  }
}

/**
 * Fetch Audio files for a hymn
 */
export async function fetchHymnAudioFiles(hymnId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('hymn_audio_files')
      .select(`
        *,
        uploader:uploaded_by(
          id, email
        )
      `)
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process data to add URL and uploader info
    const processedData = data.map(audio => {
      // Get public URL
      const { publicUrl } = supabaseClient
        .storage
        .from('hymn-files')
        .getPublicUrl(audio.audio_path).data;
      
      return {
        ...audio,
        url: publicUrl,
        file_name: audio.audio_path.split('/').pop() || 'unknown.mp3',
        uploader: audio.uploader ? {
          id: audio.uploader.id,
          name: audio.uploader.email,
          avatar: null
        } : undefined
      };
    });
    
    return processedData;
  } catch (error) {
    console.error('Error fetching audio files:', error);
    throw error;
  }
}

/**
 * Fetch Video links for a hymn
 */
export async function fetchHymnVideoLinks(hymnId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('hymn_video_links')
      .select(`
        *,
        uploader:uploaded_by(
          id, email
        )
      `)
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process data to add thumbnail and uploader info
    const processedData = data.map(video => {
      // Try to get YouTube thumbnail
      let thumbnail_url = undefined;
      
      if (video.source === 'youtube' || video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')) {
        let videoId = '';
        
        if (video.video_url.includes('youtube.com/watch')) {
          try {
            const url = new URL(video.video_url);
            videoId = url.searchParams.get('v') || '';
          } catch (e) {}
        } else if (video.video_url.includes('youtu.be/')) {
          const parts = video.video_url.split('youtu.be/');
          if (parts.length > 1) {
            videoId = parts[1].split('?')[0];
          }
        }
        
        if (videoId) {
          thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      
      return {
        ...video,
        thumbnail_url,
        uploader: video.uploader ? {
          id: video.uploader.id,
          name: video.uploader.email,
          avatar: null
        } : undefined
      };
    });
    
    return processedData;
  } catch (error) {
    console.error('Error fetching video links:', error);
    throw error;
  }
}

/**
 * Fetch Presentation files for a hymn
 */
export async function fetchHymnPresentationFiles(hymnId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('hymn_presentation_files')
      .select(`
        *,
        uploader:uploaded_by(
          id, email
        )
      `)
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Process data to add uploader info
    const processedData = data.map(presentation => {
      return {
        ...presentation,
        file_name: presentation.presentation_url.split('/').pop() || 'unknown.pptx',
        uploader: presentation.uploader ? {
          id: presentation.uploader.id,
          name: presentation.uploader.email,
          avatar: null
        } : undefined
      };
    });
    
    return processedData;
  } catch (error) {
    console.error('Error fetching presentation files:', error);
    throw error;
  }
}

/**
 * Fetch related hymns
 */
export async function fetchRelatedHymns(hymnId: string, limit: number = 5) {
  try {
    // First fetch the hymn's themes and tags
    const { data: hymnData, error: hymnError } = await supabaseClient
      .from('hymns_new')
      .select(`
        hymn_themes(theme_id),
        hymn_tags(tag_id)
      `)
      .eq('id', hymnId)
      .single();
    
    if (hymnError) throw hymnError;
    
    // Extract theme and tag IDs
    const themeIds = hymnData.hymn_themes?.map((t: any) => t.theme_id) || [];
    const tagIds = hymnData.hymn_tags?.map((t: any) => t.tag_id) || [];
    
    if (themeIds.length === 0 && tagIds.length === 0) {
      // If no themes or tags, fetch random popular hymns
      const { data, error } = await supabaseClient
        .from('hymns_new')
        .select(`
          *,
          hymn_authors!hymn_authors_hymn_id_fkey(
            authors!hymn_authors_author_id_fkey(id, name)
          )
        `)
        .neq('id', hymnId)
        .order('view_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Process the results
      return data.map((hymn: any) => ({
        ...hymn,
        authors: hymn.hymn_authors?.map((item: any) => ({ 
          id: item.authors.id, 
          name: item.authors.name 
        })) || []
      }));
    }
    
    // If has themes or tags, fetch related hymns
    const query = supabaseClient.rpc('get_related_hymns', {
      p_hymn_id: hymnId,
      p_theme_ids: themeIds,
      p_tag_ids: tagIds,
      p_limit: limit
    });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching related hymns:', error);
    return [];
  }
}

/**
 * Check if a user has favorited a hymn
 */
export async function checkHymnFavorite(hymnId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from('hymn_likes')
      .select('id')
      .eq('hymn_id', hymnId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking hymn favorite:', error);
    return false;
  }
}

// Thêm vào cuối file để đặt alias cho fetchHymns
export const getHymns = fetchHymns;
export const getHymnById = fetchHymnById;
