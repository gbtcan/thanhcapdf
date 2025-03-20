import { pdfjs } from 'react-pdf';
import { getDirectPdfViewerUrl, testPdfUrl } from './pdf/pdfConfig';
import { analyzePdfError, loadPdfWithFallback, PdfErrorType } from './pdf/pdfErrorHandler';
import { cachePdf, getCachedPdf } from './pdf/pdfCache';
import { PDF_JS_VERSION, configurePdfWorker } from './pdf/pdfWorkerLoader';

/**
 * Configure PDF.js worker from multiple sources
 * This function will try to load the worker from different CDNs
 * and fall back to the local copy if necessary
 */
export function configurePdfWorker(): void {
  // If worker is already set up, don't reconfigure
  if (pdfjs.GlobalWorkerOptions.workerSrc) return;
  
  try {
    // First try using unpkg (primary CDN)
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  } catch (error) {
    console.error('Failed to set worker from unpkg, trying fallback CDN', error);
    try {
      // Then try using jsdelivr (fallback CDN)
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    } catch (fallbackError) {
      console.error('Failed to set worker from fallback CDN, using local copy', fallbackError);
      // Finally use local copy
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
  }
}

/**
 * Check if the URL is valid and accessible
 * @param url URL to check
 * @returns Promise that resolves to true if URL is accessible
 */
export async function isPdfAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking PDF accessibility:', error);
    return false;
  }
}

/**
 * Higher-level utility to load and process PDFs
 * Acts as an integration point between different PDF utilities
 */

/**
 * Load PDF from URL with enhanced error handling and caching
 * @param url URL of the PDF to load
 * @returns Object with PDF data and error information
 */
export async function loadPDF(url: string): Promise<{
  data: ArrayBuffer | null;
  error: string | null;
  errorType: PdfErrorType | null;
  directUrl: string | null;
}> {
  if (!url) {
    return {
      data: null,
      error: 'No URL provided',
      errorType: PdfErrorType.MISSING_PDF,
      directUrl: null
    };
  }
  
  try {
    // Try to get from cache first
    const cachedData = getCachedPdf(url);
    if (cachedData) {
      return {
        data: cachedData,
        error: null,
        errorType: null,
        directUrl: getDirectPdfViewerUrl(url)
      };
    }
    
    // Test if the URL is accessible
    const isAccessible = await testPdfUrl(url);
    if (!isAccessible) {
      return {
        data: null,
        error: 'PDF URL is not accessible',
        errorType: PdfErrorType.NETWORK,
        directUrl: getDirectPdfViewerUrl(url) // Still provide direct URL as fallback
      };
    }
    
    // Try to load the PDF
    const pdfData = await loadPdfWithFallback(url);
    
    // Cache the PDF data for future use
    cachePdf(url, pdfData);
    
    return {
      data: pdfData,
      error: null,
      errorType: null,
      directUrl: getDirectPdfViewerUrl(url)
    };
  } catch (error) {
    const pdfError = analyzePdfError(error, url);
    
    return {
      data: null,
      error: pdfError.message,
      errorType: pdfError.type,
      directUrl: getDirectPdfViewerUrl(url) // Still provide direct URL as fallback
    };
  }
}

/**
 * Get a list of supported PDF viewer fallback options
 * @returns Array of viewer options and their capabilities
 */
export function getPdfViewerOptions(): Array<{
  name: string;
  description: string;
  supportsCORS: boolean;
  supportsPassword: boolean;
}> {
  return [
    {
      name: 'Browser Built-in',
      description: 'Uses your browser\'s built-in PDF viewer',
      supportsCORS: false,
      supportsPassword: true
    },
    {
      name: 'PDF.js',
      description: 'Mozilla\'s PDF.js viewer',
      supportsCORS: true,
      supportsPassword: false
    },
    {
      name: 'Google Drive Viewer',
      description: 'View PDFs through Google Drive',
      supportsCORS: true,
      supportsPassword: false
    }
  ];
}

/**
 * Initialize PDF.js with proper worker and configurations
 */
export async function initPdf() {
  // Configure PDF.js worker
  configurePdfWorker();
  
  // Preload common PDF.js components
  await preloadPdfComponents();
  
  console.log(`PDF.js initialized (version ${PDF_JS_VERSION})`);
  return true;
}

/**
 * Preload PDF.js components to improve first render performance
 */
async function preloadPdfComponents() {
  try {
    // Import necessary PDF.js components in background
    await Promise.all([
      import('react-pdf'),
      import('./pdf/pdfWorkerLoader').then(module => module.preloadPdfWorker())
    ]);
  } catch (err) {
    console.error('Error preloading PDF components:', err);
  }
}

/**
 * Load a PDF document from a URL
 * @param url URL of the PDF to load
 * @returns Promise resolving to the loaded PDF document data
 */
export async function loadPdfDocument(url: string) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.arrayBuffer();
    
    // Cache the PDF data for future use
    cachePdf(url, data);
    
    // Return the loaded document
    return await pdfjs.getDocument({ data }).promise;
  } catch (error) {
    console.error('Error loading PDF document:', error);
    throw error;
  }
}

/**
 * Extract text from a PDF
 * @param url URL of the PDF to extract text from
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPdf(url: string): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument(url).promise;
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Check if PDF is viewable in the current environment
 */
export function isPdfViewSupported(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for basic browser features needed for PDF.js
  const hasRequiredFeatures = [
    typeof Uint8Array !== 'undefined',
    typeof Blob !== 'undefined',
    typeof Promise !== 'undefined'
  ].every(Boolean);
  
  return hasRequiredFeatures;
}

/**
 * Get a direct view URL for the PDF (possibly using an external service for compatibility)
 */
export function getViewableUrl(url: string): string {
  // For Google Drive links, convert to preview URL
  if (url.includes('drive.google.com') && !url.includes('/view')) {
    // Extract file ID and convert to preview URL
    const matches = url.match(/[-\w]{25,}/);
    if (matches && matches.length > 0) {
      return `https://drive.google.com/file/d/${matches[0]}/preview`;
    }
  }
  
  // For PDFs from common sources, return directly
  const trustedSources = [
    'supabase.co',
    'supabase.io',
    'amazonaws.com',
    'blob:',
    'data:',
    window.location.origin
  ];
  
  if (trustedSources.some(source => url.includes(source))) {
    return url;
  }
  
  // For other URLs, use Google's PDF viewer for better compatibility
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}
