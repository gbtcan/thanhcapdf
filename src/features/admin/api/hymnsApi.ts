// Giữ nguyên import nhưng giờ nó sẽ hoạt động vì chúng ta đã thêm export cần thiết
import { supabaseClient } from '../../../lib/supabase/client';
import { handleSupabaseError } from '../../../core/utils/error-handler';
import { 
  Hymn, 
  HymnFilterParams, 
  HymnFormData, 
  HymnPdfFile,
  HymnAudioFile,
  HymnVideoLink,
  HymnPresentationFile
} from '../types/hymns';
import { StorageError } from '@supabase/storage-js';

// Define intermediate types for raw data from Supabase
interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

interface UserData {
  id: string;
  email: string;
  profiles?: UserProfile | null;
}

interface HymnRow extends Omit<Hymn, 'author'> {
  user?: UserData | null;
}

interface PdfFileRow extends Omit<HymnPdfFile, 'url' | 'file_name' | 'uploader'> {
  uploader?: UserData | null;
}

interface AudioFileRow extends Omit<HymnAudioFile, 'url' | 'file_name' | 'uploader'> {
  uploader?: UserData | null;
}

interface VideoLinkRow extends Omit<HymnVideoLink, 'thumbnail_url' | 'uploader'> {
  uploader?: UserData | null;
}

interface PresentationFileRow extends Omit<HymnPresentationFile, 'url' | 'file_name' | 'uploader'> {
  uploader?: UserData | null;
}

/**
 * Fetch paginated hymns with filtering
 */
export async function fetchHymns(params: HymnFilterParams = {}): Promise<{ data: Hymn[], total: number }> {
  try {
    const {
      search = '',
      status = 'published',
      sortBy = 'title',
      sortOrder = 'asc',
      page = 0,
      pageSize = 10
    } = params;

    let query = supabaseClient
      .from('hymns_new')
      .select(`
        *,
        user:created_by(id, email, profiles(full_name, avatar_url))
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,lyrics.ilike.%${search}%`);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Format response
    const hymns = data?.map((hymn: HymnRow) => ({
      ...hymn,
      author: hymn.user ? {
        id: hymn.user.id,
        email: hymn.user.email,
        name: hymn.user.profiles?.full_name || hymn.user.email,
        avatar: hymn.user.profiles?.avatar_url
      } : undefined
    }));

    return {
      data: hymns || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching hymns:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single hymn by ID with all associated files
 */
export async function fetchHymnById(id: string): Promise<{
  hymn: Hymn,
  pdfFiles: HymnPdfFile[],
  audioFiles: HymnAudioFile[],
  videoLinks: HymnVideoLink[],
  presentationFiles: HymnPresentationFile[]
}> {
  try {
    // Execute queries in parallel
    const [hymnResult, pdfFilesResult, audioFilesResult, videoLinksResult, presentationFilesResult] = await Promise.all([
      // Fetch hymn details
      supabaseClient
        .from('hymns_new')
        .select(`
          *,
          user:created_by(id, email, profiles(full_name, avatar_url))
        `)
        .eq('id', id)
        .single(),
      
      // Fetch PDF files
      supabaseClient
        .from('hymn_pdf_files')
        .select(`
          *,
          uploader:uploaded_by(id, email, profiles(full_name, avatar_url))
        `)
        .eq('hymn_id', id)
        .order('created_at', { ascending: false }),
      
      // Fetch Audio files
      supabaseClient
        .from('hymn_audio_files')
        .select(`
          *,
          uploader:uploaded_by(id, email, profiles(full_name, avatar_url))
        `)
        .eq('hymn_id', id)
        .order('created_at', { ascending: false }),
      
      // Fetch Video links
      supabaseClient
        .from('hymn_video_links')
        .select(`
          *,
          uploader:uploaded_by(id, email, profiles(full_name, avatar_url))
        `)
        .eq('hymn_id', id)
        .order('created_at', { ascending: false }),
      
      // Fetch Presentation files
      supabaseClient
        .from('hymn_presentation_files')
        .select(`
          *,
          uploader:uploaded_by(id, email, profiles(full_name, avatar_url))
        `)
        .eq('hymn_id', id)
        .order('created_at', { ascending: false })
    ]);

    // Handle errors
    if (hymnResult.error) throw hymnResult.error;
    if (pdfFilesResult.error) throw pdfFilesResult.error;
    if (audioFilesResult.error) throw audioFilesResult.error;
    if (videoLinksResult.error) throw videoLinksResult.error;
    if (presentationFilesResult.error) throw presentationFilesResult.error;

    // If hymn not found
    if (!hymnResult.data) {
      throw new Error('Hymn not found');
    }

    // Process hymn data
    const hymn: Hymn = {
      ...hymnResult.data,
      author: hymnResult.data.user ? {
        id: hymnResult.data.user.id,
        email: hymnResult.data.user.email,
        name: hymnResult.data.user.profiles?.full_name || hymnResult.data.user.email,
        avatar: hymnResult.data.user.profiles?.avatar_url
      } : undefined
    };

    // Process PDF files
    const pdfFiles: HymnPdfFile[] = pdfFilesResult.data?.map((pdf: PdfFileRow) => {
      // Get file name from path
      const file_name = pdf.pdf_path.split('/').pop() || 'unknown.pdf';
      
      return {
        ...pdf,
        file_name,
        url: getPdfUrl(pdf.pdf_path),
        uploader: pdf.uploader ? {
          id: pdf.uploader.id,
          name: pdf.uploader.profiles?.full_name || pdf.uploader.email,
          avatar: pdf.uploader.profiles?.avatar_url
        } : undefined
      };
    }) || [];

    // Process Audio files
    const audioFiles: HymnAudioFile[] = audioFilesResult.data?.map((audio: AudioFileRow) => {
      // Get file name from path
      const file_name = audio.audio_path.split('/').pop() || 'unknown.mp3';
      
      return {
        ...audio,
        file_name,
        url: getAudioUrl(audio.audio_path),
        uploader: audio.uploader ? {
          id: audio.uploader.id,
          name: audio.uploader.profiles?.full_name || audio.uploader.email,
          avatar: audio.uploader.profiles?.avatar_url
        } : undefined
      };
    }) || [];

    // Process Video links
    const videoLinks: HymnVideoLink[] = videoLinksResult.data?.map((video: VideoLinkRow) => {
      // Get thumbnail if it's a YouTube video
      const thumbnail_url = getVideoThumbnail(video.video_url, video.source);
      
      return {
        ...video,
        thumbnail_url,
        uploader: video.uploader ? {
          id: video.uploader.id,
          name: video.uploader.profiles?.full_name || video.uploader.email,
          avatar: video.uploader.profiles?.avatar_url
        } : undefined
      };
    }) || [];

    // Process Presentation files
    const presentationFiles: HymnPresentationFile[] = presentationFilesResult.data?.map((presentation: PresentationFileRow) => {
      // Get file name from url
      const file_name = presentation.presentation_url.split('/').pop() || 'unknown.pptx';
      
      return {
        ...presentation,
        file_name,
        url: presentation.presentation_url,
        uploader: presentation.uploader ? {
          id: presentation.uploader.id,
          name: presentation.uploader.profiles?.full_name || presentation.uploader.email,
          avatar: presentation.uploader.profiles?.avatar_url
        } : undefined
      };
    }) || [];

    // Link PDFs to Audio files and Video links
    if (pdfFiles.length > 0) {
      const pdfMap = new Map(pdfFiles.map(pdf => [pdf.id, pdf]));
      
      audioFiles.forEach(audio => {
        if (audio.pdf_id && pdfMap.has(audio.pdf_id)) {
          audio.linked_pdf = pdfMap.get(audio.pdf_id);
        }
      });
      
      videoLinks.forEach(video => {
        if (video.pdf_id && pdfMap.has(video.pdf_id)) {
          video.linked_pdf = pdfMap.get(video.pdf_id);
        }
      });
    }

    return {
      hymn,
      pdfFiles,
      audioFiles,
      videoLinks,
      presentationFiles
    };
  } catch (error) {
    console.error(`Error fetching hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Create a new hymn
 */
export async function createHymn(hymnData: HymnFormData, userId: string): Promise<Hymn> {
  try {
    const { data, error } = await supabaseClient
      .from('hymns_new')
      .insert([{
        ...hymnData,
        created_by: userId,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create hymn');
    
    return data as Hymn;
  } catch (error) {
    console.error('Error creating hymn:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update a hymn
 */
export async function updateHymn(id: string, hymnData: Partial<HymnFormData>): Promise<Hymn> {
  try {
    const { data, error } = await supabaseClient
      .from('hymns_new')
      .update({ 
        ...hymnData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update hymn');
    
    return data as Hymn;
  } catch (error) {
    console.error(`Error updating hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a hymn and all associated files
 */
export async function deleteHymn(id: string): Promise<void> {
  try {
    // Deleting the hymn should cascade delete all related files due to foreign key constraints
    const { error } = await supabaseClient
      .from('hymns_new')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Upload a PDF file for a hymn
 */
export async function uploadPdfFile(
  hymnId: string, 
  file: File, 
  description: string | undefined, 
  userId: string
): Promise<HymnPdfFile> {
  try {
    // 1. Upload file to Storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const filePath = `hymns/${hymnId}/pdf/${fileName}`;
    
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('hymn-files')
      .upload(filePath, file);
    
    if (storageError) throw storageError;
    
    // 2. Create database record
    const { data, error } = await supabaseClient
      .from('hymn_pdf_files')
      .insert([{
        hymn_id: hymnId,
        pdf_path: filePath,
        description,
        uploaded_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      // Cleanup storage if database insert fails
      await supabaseClient.storage.from('hymn-files').remove([filePath]);
      throw error;
    }
    
    if (!data) throw new Error('Failed to create PDF file record');
    
    // Add URL and file name to the returned data
    return {
      ...data,
      url: getPdfUrl(filePath),
      file_name: fileName
    };
  } catch (error) {
    console.error('Error uploading PDF file:', error);
    if (error instanceof StorageError) {
      throw new Error(`Storage error: ${error.message}`);
    }
    throw handleSupabaseError(error);
  }
}

/**
 * Upload an audio file for a hymn
 */
export async function uploadAudioFile(
  hymnId: string, 
  file: File, 
  description: string | undefined,
  pdfId: string | undefined, 
  userId: string
): Promise<HymnAudioFile> {
  try {
    // 1. Upload file to Storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const filePath = `hymns/${hymnId}/audio/${fileName}`;
    
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('hymn-files')
      .upload(filePath, file);
    
    if (storageError) throw storageError;
    
    // 2. Create database record
    const { data, error } = await supabaseClient
      .from('hymn_audio_files')
      .insert([{
        hymn_id: hymnId,
        audio_path: filePath,
        description,
        pdf_id: pdfId || null,
        uploaded_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      // Cleanup storage if database insert fails
      await supabaseClient.storage.from('hymn-files').remove([filePath]);
      throw error;
    }
    
    if (!data) throw new Error('Failed to create audio file record');
    
    // Add URL and file name to the returned data
    return {
      ...data,
      url: getAudioUrl(filePath),
      file_name: fileName
    };
  } catch (error) {
    console.error('Error uploading audio file:', error);
    if (error instanceof StorageError) {
      throw new Error(`Storage error: ${error.message}`);
    }
    throw handleSupabaseError(error);
  }
}

/**
 * Add a video link for a hymn
 */
export async function addVideoLink(
  hymnId: string,
  videoUrl: string,
  source: string | undefined,
  description: string | undefined,
  pdfId: string | undefined,
  userId: string
): Promise<HymnVideoLink> {
  try {
    const { data, error } = await supabaseClient
      .from('hymn_video_links')
      .insert([{
        hymn_id: hymnId,
        video_url: videoUrl,
        source,
        description,
        pdf_id: pdfId || null,
        uploaded_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create video link record');
    
    // Add thumbnail URL to the returned data
    return {
      ...data,
      thumbnail_url: getVideoThumbnail(videoUrl, source)
    };
  } catch (error) {
    console.error('Error adding video link:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Upload a presentation file for a hymn
 */
export async function uploadPresentationFile(
  hymnId: string,
  file: File,
  description: string | undefined,
  source: string | undefined,
  userId: string
): Promise<HymnPresentationFile> {
  try {
    // 1. Upload file to Storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const filePath = `hymns/${hymnId}/presentation/${fileName}`;
    
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('hymn-files')
      .upload(filePath, file);
    
    if (storageError) throw storageError;
    
    // Get public URL
    const { data: publicUrlData } = supabaseClient
      .storage
      .from('hymn-files')
      .getPublicUrl(filePath);
    
    const presentation_url = publicUrlData.publicUrl;
    
    // 2. Create database record
    const { data, error } = await supabaseClient
      .from('hymn_presentation_files')
      .insert([{
        hymn_id: hymnId,
        presentation_url,
        description,
        source,
        uploaded_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      // Cleanup storage if database insert fails
      await supabaseClient.storage.from('hymn-files').remove([filePath]);
      throw error;
    }
    
    if (!data) throw new Error('Failed to create presentation file record');
    
    // Add file name to the returned data
    return {
      ...data,
      file_name: fileName
    };
  } catch (error) {
    console.error('Error uploading presentation file:', error);
    if (error instanceof StorageError) {
      throw new Error(`Storage error: ${error.message}`);
    }
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a PDF file
 */
export async function deletePdfFile(id: string, filePath: string): Promise<void> {
  try {
    // 1. Delete database record
    const { error } = await supabaseClient
      .from('hymn_pdf_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // 2. Remove file from storage
    await supabaseClient.storage.from('hymn-files').remove([filePath]);
  } catch (error) {
    console.error(`Error deleting PDF file with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete an audio file
 */
export async function deleteAudioFile(id: string, filePath: string): Promise<void> {
  try {
    // 1. Delete database record
    const { error } = await supabaseClient
      .from('hymn_audio_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // 2. Remove file from storage
    await supabaseClient.storage.from('hymn-files').remove([filePath]);
  } catch (error) {
    console.error(`Error deleting audio file with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a video link
 */
export async function deleteVideoLink(id: string): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('hymn_video_links')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting video link with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a presentation file
 */
export async function deletePresentationFile(id: string): Promise<void> {
  try {
    // Note: For presentation files, we're storing the public URL in the database
    // We assume it could be an external URL, so we're not attempting to delete from storage
    
    const { error } = await supabaseClient
      .from('hymn_presentation_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting presentation file with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Helper function to get PDF URL from path
 */
function getPdfUrl(pdfPath: string): string {
  return supabaseClient.storage.from('hymn-files').getPublicUrl(pdfPath).data.publicUrl;
}

/**
 * Helper function to get audio URL from path
 */
function getAudioUrl(audioPath: string): string {
  return supabaseClient.storage.from('hymn-files').getPublicUrl(audioPath).data.publicUrl;
}

/**
 * Helper function to get video thumbnail
 */
function getVideoThumbnail(videoUrl: string, source?: string): string | undefined {
  if (source?.toLowerCase() === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    // Extract YouTube video ID
    let videoId = '';
    
    if (videoUrl.includes('youtube.com/watch')) {
      const url = new URL(videoUrl);
      videoId = url.searchParams.get('v') || '';
    } else if (videoUrl.includes('youtu.be/')) {
      const parts = videoUrl.split('youtu.be/');
      if (parts.length > 1) {
        videoId = parts[1].split('?')[0];
      }
    }
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  return undefined;
}
