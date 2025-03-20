import { pdfjs } from 'react-pdf';
import { configurePdfWorker, PDF_JS_VERSION } from './pdfWorkerLoader';
import { supabase } from '../../lib/supabase';

// Re-export the PDF version for consistency
export { PDF_JS_VERSION } from './pdfWorkerLoader';

// Basic configuration constants
export const PDF_JS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}`;
export const PDF_JS_WORKER_URL = `${PDF_JS_CDN}/pdf.worker.min.js`;
export const DEFAULT_PDF_ZOOM = 1.0;
export const ZOOM_SCALES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];
export const MAX_PDF_SIZE = 30 * 1024 * 1024;
export const SAFE_PDF_EXTENSIONS = ['.pdf'];
export const PDF_MIME_TYPES = ['application/pdf', 'application/x-pdf'];
export const TRUSTED_DOMAINS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'storage.cloud.google.com',
  'documentcloud.adobe.com',
  'amazonaws.com',
  's3.amazonaws.com',
  'fwoxlggleieoztmcvsju.supabase.co',
];

// Default PDF.js options
export const DEFAULT_PDF_OPTIONS = {
  cMapUrl: `${PDF_JS_CDN}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `${PDF_JS_CDN}/standard_fonts/`,
  disableRange: false,
  disableStream: false,
  disableAutoFetch: false,
};

// PDF viewer configurations
export const PDF_VIEWER_OPTIONS = {
  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/'
};

// Worker URL path for PDF.js
export const PDF_WORKER_URL = '/pdf-viewer/pdf.worker.min.js';

/**
 * Configure PDF.js worker
 */
export { configurePdfWorker };

/**
 * Get PDF.js configuration options
 * @returns Common options for PDF.js documents
 */
export function getPdfOptions() {
  return {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/cmaps/`,
    cMapPacked: true,
    disableRange: true,
    rangeChunkSize: 65536,
  };
}

/**
 * Test if a PDF URL is accessible
 * @param url URL to test
 * @returns true if the URL is accessible
 */
export async function testPdfUrl(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const processedUrl = processPdfUrl(url);
    const response = await fetch(processedUrl, {
      method: 'HEAD',
      headers: { 'Accept': 'application/pdf' },
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) return false;

    const contentType = response.headers.get('Content-Type');
    if (contentType && PDF_MIME_TYPES.some((mime) => contentType.includes(mime))) {
      return true;
    }

    return SAFE_PDF_EXTENSIONS.some((ext) => processedUrl.toLowerCase().endsWith(ext)) || isValidPdfUrl(processedUrl);
  } catch (error) {
    console.error('Error testing PDF URL:', error);
    return false;
  }
}

/**
 * Get a direct URL for viewing a PDF in a specified viewer
 * @param pdfUrl URL of the PDF to view
 * @param viewer Viewer to use
 * @returns Viewer URL
 */
export function getDirectPdfViewerUrl(
  pdfUrl: string,
  viewer: 'default' | 'google' | 'pdfjs' = 'default'
): string {
  if (!pdfUrl) return '';

  const processedUrl = processPdfUrl(pdfUrl);

  // Handle specific URL types
  if (processedUrl.includes('drive.google.com/file') && processedUrl.includes('view')) {
    return processedUrl;
  }
  if (processedUrl.includes('drive.google.com')) {
    const fileId = processedUrl.match(/[-\w]{25,}/);
    if (fileId) return `https://drive.google.com/file/d/${fileId[0]}/preview`;
  }
  if (processedUrl.includes('supabase.co/storage/v1/object/public')) {
    return processedUrl;
  }
  if (processedUrl.includes('github.com') || processedUrl.includes('raw.githubusercontent.com')) {
    return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(processedUrl)}`;
  }

  // Viewer-specific handling
  const encodedUrl = encodeURIComponent(processedUrl);
  switch (viewer) {
    case 'google':
      return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodedUrl}`;
    case 'pdfjs':
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedUrl}`;
    default:
      return processedUrl;
  }
}

/**
 * Process PDF URL handling both regular and Supabase URLs
 * @param url URL to process
 */
export function processPdfUrl(url: string): string {
  if (!url) return '';
  if (url.includes('supabase.co/storage/v1/object/public')) return url;
  if (!url.includes('://')) {
    return `https://fwoxlggleieoztmcvsju.supabase.co/storage/v1/object/public/hymn/pdf/${url}`;
  }
  return url;
}

/**
 * Get proper URL for Supabase PDF files
 * @param url PDF URL to process
 */
export function getSupabasePdfUrl(url: string): string {
  // If URL is already a Supabase storage URL, use it directly
  if (url.includes('supabase.co/storage/v1/object/public')) {
    return url;
  }
  
  // If this is just a filename, construct the full Supabase URL
  if (!url.includes('://')) {
    return `https://fwoxlggleieoztmcvsju.supabase.co/storage/v1/object/public/hymn/pdf/${url}`;
  }
  
  return url;
}

/**
 * Get the public URL for a PDF file from Supabase
 * @param path - Path to the PDF file in storage
 * @returns Public URL for the PDF file
 */
export function getSupabasePdfUrl(path: string): string {
  // Handle if path is already a complete URL
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path;
  }
  
  // Extract bucket and file path
  let bucket = 'hymn-files';
  let filePath = path;
  
  if (path.includes('/')) {
    const parts = path.split('/');
    if (parts.length > 1) {
      bucket = parts[0];
      filePath = parts.slice(1).join('/');
    }
  }
  
  // Get public URL from Supabase
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

/**
 * Check if a file exists in Supabase storage
 * @param path - Path to the file in storage
 * @returns Boolean indicating if file exists
 */
export async function checkPdfExists(path: string): Promise<boolean> {
  try {
    // Extract bucket and file path
    let bucket = 'hymn-files';
    let filePath = path;
    
    if (path.includes('/')) {
      const parts = path.split('/');
      if (parts.length > 1) {
        bucket = parts[0];
        filePath = parts.slice(1).join('/');
      }
    }
    
    // Check file existence
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath, { transform: { width: 10, height: 10, quality: 10 } });
      
    return !error && !!data;
  } catch (error) {
    console.error('Error checking PDF existence:', error);
    return false;
  }
}

/**
 * Generate a thumbnail URL for a PDF file
 * @param pdfId - ID of the PDF file
 * @returns URL for the thumbnail image
 */
export function getPdfThumbnailUrl(pdfId: string): string {
  return `/api/pdf-thumbnails/${pdfId}`;
}

/**
 * Determine if a URL points to a supported PDF
 * @param url URL to check
 */
export function isValidPdfUrl(url: string): boolean {
  if (!url) return false;
  const hasValidExtension = SAFE_PDF_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));
  const isTrustedSource = TRUSTED_DOMAINS.some((domain) => url.includes(domain));
  return hasValidExtension || isTrustedSource;
}

/**
 * Sanitize PDF URL to prevent common security issues
 * @param url PDF URL to sanitize
 */
export function sanitizePdfUrl(url: string): string {
  if (typeof url !== 'string') return '';
  let sanitized = url.trim();
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) return '';
  if (
    sanitized.toLowerCase().includes('javascript:') ||
    sanitized.toLowerCase().includes('data:') ||
    sanitized.toLowerCase().includes('vbscript:')
  ) {
    return '';
  }
  return sanitized;
}

/**
 * PDF configuration and utility functions
 */

// Base URL for PDF.js components
export const PDF_VIEWER_URL = '/pdf-viewer';
export const PDF_WORKER_URL = `${PDF_VIEWER_URL}/pdf.worker.min.js`;
export const PDF_CSS_URL = `${PDF_VIEWER_URL}/pdf_viewer.css`;

// PDF.js version
export const PDF_JS_VERSION = '3.11.174'; 

/**
 * Get the public URL for a PDF file stored in Supabase
 * @param path - Path to the PDF in storage
 * @returns Full URL to access the PDF
 */
export function getSupabasePdfUrl(path: string): string {
  // If the path is already a full URL, return it
  if (path.startsWith('http')) {
    return path;
  }

  // Otherwise, construct the URL with the Supabase storage endpoint
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  // Handle both storage/ and object/ paths
  if (path.includes('storage/')) {
    return path;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

/**
 * Configuration for the PDF viewer
 */
export const pdfViewerConfig = {
  cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
  cMapPacked: true,
  workerSrc: PDF_WORKER_URL,
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@latest/standard_fonts/',
  enableXfa: true,
  useWorkerFetch: true,
  isEvalSupported: false
};

/**
 * Get file extension from URL or path
 * @param url - URL or file path
 * @returns File extension (lowercase, without the dot)
 */
export function getFileExtension(url: string): string {
  const parts = url.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Check if a URL points to a PDF file
 * @param url - URL to check
 * @returns True if the URL likely points to a PDF
 */
export function isPdfUrl(url: string): boolean {
  return getFileExtension(url) === 'pdf';
}

// Export default object with all functions and constants
export default {
  PDF_JS_VERSION,
  PDF_JS_CDN,
  PDF_JS_WORKER_URL,
  DEFAULT_PDF_ZOOM,
  ZOOM_SCALES,
  MAX_PDF_SIZE,
  DEFAULT_PDF_OPTIONS,
  SAFE_PDF_EXTENSIONS,
  PDF_MIME_TYPES,
  TRUSTED_DOMAINS,
  getDirectPdfViewerUrl,
  testPdfUrl,
  sanitizePdfUrl,
  processPdfUrl,
  isValidPdfUrl,
  getSupabasePdfUrl,
  checkPdfExists,
  getPdfThumbnailUrl,
  getPdfOptions,
  PDF_VIEWER_URL,
  PDF_CSS_URL,
  pdfViewerConfig,
  getFileExtension,
  isPdfUrl,
};