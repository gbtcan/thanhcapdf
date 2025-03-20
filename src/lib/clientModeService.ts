import { supabase } from './supabase';
import { clientConfig } from '../config/clientConfig';

/**
 * Check if a table exists in the database
 * @param tableName The name of the table to check
 * @returns true if the table exists, false otherwise
 */
export async function tableExists(tableName: string): Promise<boolean> {
  if (clientConfig.clientSideOnly) {
    // In client-side only mode, assume tables don't exist if they're special tables
    const specialTables = ['categories', 'pdf_views', 'hymn_views', 'reactions'];
    if (specialTables.includes(tableName)) {
      return false;
    }
    
    // For other tables, try a simple query
    try {
      const { error } = await supabase
        .from(tableName)
        .select('id', { count: 'exact', head: true })
        .limit(0);
      
      return !error;
    } catch {
      return false;
    }
  }
  
  // Normal mode - actually check if the table exists
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .limit(0);
    
    return !error || (error.code !== '42P01' && error.code !== 'PGRST301');
  } catch {
    return false;
  }
}

/**
 * Check if a column exists in a table
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  if (clientConfig.clientSideOnly) {
    // In client-side only mode, assume special columns don't exist
    const specialColumns = {
      'posts': ['is_featured'],
      'hymn_views': ['session_id'],
      'hymns': ['view_count']
    };
    
    if (specialColumns[tableName]?.includes(columnName)) {
      return false;
    }
  }
  
  // For other columns, assume they exist
  return true;
}

/**
 * Check if a URL is accessible
 * @param url URL to check
 * @returns Promise resolving to true if URL is accessible
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    // For Supabase storage URLs, check using the Supabase client
    if (url.includes('supabase.co/storage/v1/object/public/')) {
      const parts = url.split('/public/');
      if (parts.length === 2) {
        const bucketAndPath = parts[1].split('/');
        const bucket = bucketAndPath[0];
        const path = bucketAndPath.slice(1).join('/').split('?')[0]; // Remove query params
        
        const { data, error } = await supabase.storage
          .from(bucket)
          .download(path);
          
        return !error && !!data;
      }
      return false;
    }
    
    // For other URLs, use a HEAD request
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'cors'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking URL accessibility:', error);
    return false;
  }
}
