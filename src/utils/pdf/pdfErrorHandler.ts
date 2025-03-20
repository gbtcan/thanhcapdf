import { getCachedPdf } from './pdfCache';

/**
 * Error handling for PDF related operations
 */

// Define error types
export enum PdfErrorType {
  FILE_NOT_FOUND = 'fileNotFound',
  NETWORK_ERROR = 'networkError',
  INVALID_FILE = 'invalidFile',
  PARSING_ERROR = 'parsingError',
  RENDERING_ERROR = 'renderingError',
  PERMISSION_ERROR = 'permissionError',
  UNKNOWN_ERROR = 'unknownError'
}

// PDF error interface
export interface PdfError {
  type: PdfErrorType;
  message: string;
  code?: number;
  originalError?: any;
}

/**
 * Create a standardized PDF error object
 * 
 * @param type - Error type
 * @param message - Error message
 * @param originalError - Original error object
 * @returns Standardized PDF error
 */
export function createPdfError(
  type: PdfErrorType,
  message: string,
  originalError?: any
): PdfError {
  return {
    type,
    message,
    originalError,
    code: extractErrorCode(originalError)
  };
}

/**
 * Extract error code from various error types
 * 
 * @param error - Original error object
 * @returns Numeric error code or undefined
 */
function extractErrorCode(error: any): number | undefined {
  if (!error) return undefined;
  
  // Check for PDF.js error code
  if (typeof error.code === 'number') {
    return error.code;
  }
  
  // Check for HTTP status code
  if (error.status && typeof error.status === 'number') {
    return error.status;
  }
  
  return undefined;
}

/**
 * Convert raw errors to standardized PDF errors
 * 
 * @param error - Original error
 * @returns Standardized PDF error
 */
export function handlePdfError(error: any): PdfError {
  console.error('PDF Error:', error);
  
  if (!error) {
    return createPdfError(
      PdfErrorType.UNKNOWN_ERROR,
      'Unknown PDF error'
    );
  }
  
  // Network errors
  if (error.message?.includes('network') || 
      error.message?.includes('Network') ||
      error.name === 'AbortError' ||
      error.code === 'ECONNREFUSED') {
    return createPdfError(
      PdfErrorType.NETWORK_ERROR,
      'Unable to load PDF due to network issues',
      error
    );
  }
  
  // File not found errors
  if (error.status === 404 || 
      error.message?.includes('not found') ||
      error.message?.includes('404')) {
    return createPdfError(
      PdfErrorType.FILE_NOT_FOUND,
      'The requested PDF file could not be found',
      error
    );
  }
  
  // Permission errors
  if (error.status === 403 || 
      error.message?.includes('permission') ||
      error.message?.includes('forbidden') ||
      error.message?.includes('403')) {
    return createPdfError(
      PdfErrorType.PERMISSION_ERROR,
      'You do not have permission to access this PDF',
      error
    );
  }
  
  // Invalid PDF format
  if (error.message?.includes('invalid') || 
      error.message?.includes('format') ||
      error.message?.includes('malformed')) {
    return createPdfError(
      PdfErrorType.INVALID_FILE,
      'The file is not a valid PDF document',
      error
    );
  }
  
  // Parsing errors
  if (error.message?.includes('parse') || 
      error.message?.includes('syntax')) {
    return createPdfError(
      PdfErrorType.PARSING_ERROR,
      'Error parsing the PDF document',
      error
    );
  }
  
  // Rendering errors
  if (error.message?.includes('render') || 
      error.message?.includes('display')) {
    return createPdfError(
      PdfErrorType.RENDERING_ERROR,
      'Error rendering the PDF document',
      error
    );
  }
  
  // Unknown errors
  return createPdfError(
    PdfErrorType.UNKNOWN_ERROR,
    error.message || 'An unknown error occurred while processing the PDF',
    error
  );
}

/**
 * Get user-friendly error message
 * 
 * @param error - PDF error object
 * @returns User-friendly error message
 */
export function getPdfErrorMessage(error: PdfError): string {
  switch (error.type) {
    case PdfErrorType.FILE_NOT_FOUND:
      return 'The PDF file could not be found. It may have been moved or deleted.';
    case PdfErrorType.NETWORK_ERROR:
      return 'There was a network problem loading the PDF. Please check your internet connection and try again.';
    case PdfErrorType.INVALID_FILE:
      return 'The file is not a valid PDF document.';
    case PdfErrorType.PARSING_ERROR:
      return 'The PDF document could not be processed. It may be corrupted or in an unsupported format.';
    case PdfErrorType.RENDERING_ERROR:
      return 'There was a problem displaying the PDF document.';
    case PdfErrorType.PERMISSION_ERROR:
      return 'You do not have permission to access this PDF document.';
    case PdfErrorType.UNKNOWN_ERROR:
    default:
      return 'An unknown error occurred while trying to display the PDF.';
  }
}

/**
 * Try to load a PDF with fallback options
 * @param url The URL of the PDF to load
 * @returns Promise resolving to the PDF data or rejects with a PdfError
 */
export async function loadPdfWithFallback(url: string): Promise<ArrayBuffer> {
  // Try to get from cache first
  const cachedData = getCachedPdf(url);
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Try with regular fetch first
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  } catch (error: any) {
    // If it's a CORS error, try with proxy if available
    const pdfError = handlePdfError(error);
    
    if (pdfError.type === PdfErrorType.NETWORK_ERROR) {
      try {
        // Try with CORS proxy (if your app has one)
        const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);
        
        if (!proxyResponse.ok) {
          throw new Error(`Proxy HTTP error ${proxyResponse.status}: ${proxyResponse.statusText}`);
        }
        
        return await proxyResponse.arrayBuffer();
      } catch (proxyError) {
        throw handlePdfError(proxyError);
      }
    }
    
    // For other errors, just rethrow the analyzed error
    throw pdfError;
  }
}

/**
 * Utilities for handling PDF errors
 */

/**
 * Analyze PDF errors and return user-friendly error messages
 * @param error The error object or message to analyze
 * @returns User-friendly error message and error code
 */
export function analyzePdfError(error: Error | string | unknown): {
  message: string;
  code?: string;
  recoverable: boolean;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('CORS') || 
      errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return {
      message: 'Unable to load PDF due to network issues. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      recoverable: true
    };
  }
  
  // CORS errors
  if (errorMessage.includes('cross-origin') || errorMessage.includes('Cross-Origin')) {
    return {
      message: 'Access to this PDF is restricted due to security settings.',
      code: 'CORS_ERROR',
      recoverable: false
    };
  }
  
  // Invalid PDF format
  if (errorMessage.includes('Invalid PDF') || errorMessage.includes('not a PDF file') ||
      errorMessage.includes('Unexpected response')) {
    return {
      message: 'The file appears to be corrupt or is not a valid PDF document.',
      code: 'INVALID_PDF',
      recoverable: false
    };
  }
  
  // Missing PDF
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return {
      message: 'The requested PDF file could not be found. It may have been moved or deleted.',
      code: 'PDF_NOT_FOUND',
      recoverable: false
    };
  }
  
  // Password protected
  if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
    return {
      message: 'This PDF is password protected. Please provide the password to view it.',
      code: 'PASSWORD_PROTECTED',
      recoverable: false
    };
  }
  
  // Loading or parsing error
  if (errorMessage.includes('parse') || errorMessage.includes('loading')) {
    return {
      message: 'There was a problem loading the PDF. The file might be corrupted.',
      code: 'PARSE_ERROR',
      recoverable: true
    };
  }
  
  // Storage errors (Supabase specific)
  if (errorMessage.includes('storage') || errorMessage.includes('bucket')) {
    return {
      message: 'Failed to access the PDF from storage. Please try again later.',
      code: 'STORAGE_ERROR',
      recoverable: true
    };
  }

  // Default/unknown errors
  return {
    message: 'An error occurred while loading the PDF. Please try again later.',
    code: 'UNKNOWN_ERROR',
    recoverable: true
  };
}

/**
 * Log PDF errors with diagnostic information
 * @param error The error object
 * @param pdfUrl The URL of the PDF that caused the error
 */
export function logPdfError(error: Error | string | unknown, pdfUrl?: string): void {
  const errorAnalysis = analyzePdfError(error);
  console.error('PDF Error:', {
    originalError: error,
    analysis: errorAnalysis,
    url: pdfUrl || 'Not provided',
    timestamp: new Date().toISOString()
  });
}

/**
 * Check if a PDF error is recoverable
 * @param error The error to check
 * @returns Boolean indicating if error is potentially recoverable
 */
export function isPdfErrorRecoverable(error: Error | string | unknown): boolean {
  return analyzePdfError(error).recoverable;
}

export default {
  analyzePdfError,
  logPdfError,
  isPdfErrorRecoverable
};
