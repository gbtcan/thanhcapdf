import { supabase } from '../lib/supabase';

/**
 * Interface for handling upload progress
 */
interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Upload a file to Supabase storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @param onProgress - Optional callback for upload progress
 * @returns Public URL of the uploaded file
 */
export async function uploadFileToStorage(
  file: File,
  bucket: string,
  path: string,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // Generate a unique file name to prevent overwrites
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;
  
  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      onUploadProgress: (progress) => {
        if (onProgress) {
          const percent = (progress.loaded / progress.total!) * 100;
          onProgress(Math.round(percent));
        }
      }
    });
  
  if (error) {
    throw error;
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl;
}

/**
 * Delete a file from Supabase storage
 * @param bucket - The storage bucket name
 * @param path - The full path to the file within the bucket
 * @returns Success status
 */
export async function deleteFileFromStorage(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    return !error;
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    return false;
  }
}

/**
 * Extract the storage path from a Supabase URL
 * @param url - The Supabase storage URL
 * @returns The extracted path or null if invalid URL
 */
export function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Find index after the bucket name
    const bucketIndex = pathSegments.findIndex(segment => 
      segment === 'storage' || segment === 'object'
    );
    
    if (bucketIndex === -1 || bucketIndex + 2 >= pathSegments.length) {
      return null;
    }
    
    // Skip the bucket name and return the rest of the path
    return pathSegments.slice(bucketIndex + 2).join('/');
  } catch (error) {
    console.error('Error extracting storage path:', error);
    return null;
  }
}
