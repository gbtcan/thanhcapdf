import { getSupabasePdfUrl } from './pdfConfig';

/**
 * Simple cache system for PDF blobs and documents
 */

// Interface for cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

// Cache duration constants
const DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PDF_BLOB_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize caches
const blobCache = new Map<string, CacheEntry<Blob>>();
const documentCache = new Map<string, CacheEntry<any>>();

/**
 * Get PDF blob from cache or fetch and cache it
 * @param url - PDF URL
 * @returns Promise resolving to the PDF blob
 */
export async function getPdfBlob(url: string): Promise<Blob> {
  // Normalize URL
  const fullUrl = url.startsWith('http') ? url : getSupabasePdfUrl(url);
  
  // Check cache
  const cachedBlob = blobCache.get(fullUrl);
  if (cachedBlob && cachedBlob.expires > Date.now()) {
    return cachedBlob.data;
  }
  
  // Fetch PDF
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Cache the blob
    blobCache.set(fullUrl, {
      data: blob,
      timestamp: Date.now(),
      expires: Date.now() + PDF_BLOB_CACHE_DURATION
    });
    
    return blob;
  } catch (error) {
    console.error('Error fetching PDF blob:', error);
    throw error;
  }
}

/**
 * Cache a PDF.js document
 * @param url - PDF URL
 * @param document - PDF.js document object
 * @param duration - Cache duration in milliseconds
 */
export function cachePdfDocument(url: string, document: any, duration = DEFAULT_CACHE_DURATION): void {
  // Normalize URL
  const fullUrl = url.startsWith('http') ? url : getSupabasePdfUrl(url);
  
  documentCache.set(fullUrl, {
    data: document,
    timestamp: Date.now(),
    expires: Date.now() + duration
  });
}

/**
 * Get cached PDF.js document
 * @param url - PDF URL
 * @returns Cached document or null if not found or expired
 */
export function getCachedPdfDocument(url: string): any | null {
  // Normalize URL
  const fullUrl = url.startsWith('http') ? url : getSupabasePdfUrl(url);
  
  const cachedDoc = documentCache.get(fullUrl);
  if (cachedDoc && cachedDoc.expires > Date.now()) {
    return cachedDoc.data;
  }
  
  return null;
}

/**
 * Clear the PDF cache
 * @param type - Type of cache to clear ('blob', 'document', or 'all')
 */
export function clearPdfCache(type: 'blob' | 'document' | 'all' = 'all'): void {
  if (type === 'blob' || type === 'all') {
    blobCache.clear();
  }
  
  if (type === 'document' || type === 'all') {
    documentCache.clear();
  }
}

/**
 * Get cache statistics
 * @returns Object with cache statistics
 */
export function getPdfCacheStats(): {
  blobCacheSize: number;
  documentCacheSize: number;
  oldestBlobEntry: number | null;
  oldestDocumentEntry: number | null;
} {
  let oldestBlobTime: number | null = null;
  let oldestDocTime: number | null = null;
  
  // Find oldest blob entry
  blobCache.forEach(entry => {
    if (oldestBlobTime === null || entry.timestamp < oldestBlobTime) {
      oldestBlobTime = entry.timestamp;
    }
  });
  
  // Find oldest document entry
  documentCache.forEach(entry => {
    if (oldestDocTime === null || entry.timestamp < oldestDocTime) {
      oldestDocTime = entry.timestamp;
    }
  });
  
  return {
    blobCacheSize: blobCache.size,
    documentCacheSize: documentCache.size,
    oldestBlobEntry: oldestBlobTime,
    oldestDocumentEntry: oldestDocTime
  };
}
