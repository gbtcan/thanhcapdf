import { GlobalWorkerOptions } from 'pdfjs-dist';

/**
 * PDF.js worker loader utility
 * Handles loading and configuration of the PDF.js worker script
 */

// Export the PDF.js version for use in other modules
export const PDF_JS_VERSION = '3.4.120';

// Worker URL based on the version
export const PDF_JS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.js`;

/**
 * Configure the PDF.js worker
 * This must be called before using PDF.js
 * 
 * @param workerUrl - URL to the PDF.js worker script
 */
export function configurePdfWorker(workerUrl = '/pdf-viewer/pdf.worker.min.js'): void {
  if (!GlobalWorkerOptions.workerSrc) {
    console.log('Configuring PDF.js worker:', workerUrl);
    GlobalWorkerOptions.workerSrc = workerUrl;
  }
}

/**
 * Load the PDF.js worker asynchronously
 * 
 * @returns A promise that resolves when the worker is loaded
 */
export async function loadPdfWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Worker is loaded automatically on first PDF operation
      // We just need to make sure the URL is set correctly
      configurePdfWorker();
      resolve();
    } catch (error) {
      console.error('Failed to configure PDF.js worker:', error);
      reject(error);
    }
  });
}

/**
 * Check if the PDF.js worker is ready
 * 
 * @returns True if the worker is configured
 */
export function isPdfWorkerReady(): boolean {
  return !!GlobalWorkerOptions.workerSrc;
}

/**
 * Get worker version info
 * 
 * @returns Version info object
 */
export function getPdfWorkerInfo(): { workerSrc: string | undefined } {
  return {
    workerSrc: GlobalWorkerOptions.workerSrc
  };
}

export default {
  PDF_JS_VERSION,
  PDF_JS_WORKER_URL,
  loadPdfWorker,
  configurePdfWorker,
  isPdfWorkerReady,
  getPdfWorkerInfo
};
