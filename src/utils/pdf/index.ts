/**
 * Index file for PDF utilities
 * Re-exports all PDF-related functions and constants
 */

// Export from pdfConfig
export * from './pdfConfig';

// Export from pdfWorkerLoader
export { 
  PDF_JS_VERSION,
  PDF_JS_WORKER_URL,
  loadPdfWorker,
  configurePdfWorker
} from './pdfWorkerLoader';

// Export from pdfCache if it exists
export * from './pdfCache';

// Export from pdfErrorHandler if it exists
export * from './pdfErrorHandler';

/**
 * Initialize all PDF utilities
 */
import { configurePdfWorker } from './pdfWorkerLoader';

export function initPdf(): Promise<boolean> {
  try {
    // Configure PDF.js worker
    const isConfigured = configurePdfWorker();
    
    // Return success result
    return Promise.resolve(isConfigured);
  } catch (error) {
    console.error('Error initializing PDF utilities:', error);
    return Promise.resolve(false);
  }
}

/**
 * Validate a PDF URL
 */
export function isValidPdfUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if URL is well-formed
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  
  // Check if URL ends with .pdf
  if (url.toLowerCase().endsWith('.pdf')) return true;
  
  // Check for common PDF hosting patterns
  const pdfPatterns = [
    'pdf',
    'document',
    'file',
    'view',
    'download',
    'storage'
  ];
  
  return pdfPatterns.some(pattern => url.toLowerCase().includes(pattern));
}
