import { supabase } from '../../../lib/supabase';
import { 
  PdfResource, 
  AudioResource,
  VideoResource,
  PresentationResource,
  ResourceFilter 
} from '../types';

/**
 * API functions for resource management
 */

/**
 * Get PDF resources for a hymn
 */
export async function getPdfResources(hymnId: string): Promise<PdfResource[]> {
  try {
    const { data, error } = await supabase
      .from('hymn_pdf_files')
      .select('*')
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching PDF resources:', error);
    throw error;
  }
}

/**
 * Get audio resources for a hymn
 */
export async function getAudioResources(hymnId: string): Promise<AudioResource[]> {
  try {
    const { data, error } = await supabase
      .from('hymn_audio_files')
      .select('*')
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audio resources:', error);
    throw error;
  }
}

/**
 * Get video resources for a hymn
 */
export async function getVideoResources(hymnId: string): Promise<VideoResource[]> {
  try {
    const { data, error } = await supabase
      .from('hymn_video_links')
      .select('*')
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching video resources:', error);
    throw error;
  }
}

/**
 * Upload a new PDF file
 */
export async function uploadPdfFile(
  file: File, 
  hymnId: string, 
  description: string, 
  userId: string
): Promise<PdfResource> {
  try {
    // 1. Upload the file to storage
    const filePath = `pdf/${hymnId}/${new Date().getTime()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // 2. Create database record
    const { data, error } = await supabase
      .from('hymn_pdf_files')
      .insert({
        hymn_id: hymnId,
        pdf_path: filePath,
        description,
        created_at: new Date().toISOString(),
        uploaded_by: userId
      })
      .select()
      .single();
      
    if (error) {
      // Rollback storage upload if database insert fails
      await supabase.storage
        .from('resources')
        .remove([filePath]);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}

/**
 * Delete a resource (and its file if applicable)
 */
export async function deleteResource(
  resourceId: string, 
  resourceType: 'pdf' | 'audio' | 'video' | 'presentation', 
  userId: string,
  isAdmin = false
): Promise<boolean> {
  try {
    let table: string;
    let pathField: string;
    
    switch (resourceType) {
      case 'pdf':
        table = 'hymn_pdf_files';
        pathField = 'pdf_path';
        break;
      case 'audio':
        table = 'hymn_audio_files';
        pathField = 'audio_path';
        break;
      case 'video':
        table = 'hymn_video_links';
        pathField = 'video_url';
        break;
      case 'presentation':
        table = 'hymn_presentation_files';
        pathField = 'presentation_url';
        break;
      default:
        throw new Error('Invalid resource type');
    }
    
    // Get resource details
    const { data: resource, error: fetchError } = await supabase
      .from(table)
      .select(`*, ${pathField}`)
      .eq('id', resourceId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Check permissions
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    if (!isAdmin && resource.uploaded_by !== userId) {
      throw new Error('You don\'t have permission to delete this resource');
    }
    
    // Delete database record
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', resourceId);
      
    if (deleteError) throw deleteError;
    
    // Delete file from storage if it's a local file (not external URL)
    if ((resourceType === 'pdf' || resourceType === 'audio') && resource[pathField]) {
      await supabase.storage
        .from('resources')
        .remove([resource[pathField]]);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${resourceType} resource:`, error);
    throw error;
  }
}
