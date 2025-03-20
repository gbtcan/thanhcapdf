import { useState } from 'react';
import { loadPdfWithFallback, analyzePdfError, PdfErrorType } from '../utils/pdf/pdfErrorHandler';
import { cachePdf } from '../utils/pdf/pdfCache';

interface PdfViewerState {
  numPages: number;
  pageNumber: number;
  scale: number;
  rotation: number;
  loading: boolean;
  error: Error | null;
  errorType: PdfErrorType | null;
}

interface UsePdfViewerReturn extends PdfViewerState {
  onDocumentLoadSuccess: (data: { numPages: number }) => void;
  onDocumentLoadError: (err: Error) => void;
  setPageNumber: (page: number) => void;
  setScale: (scale: number) => void;
  setRotation: (rotation: number) => void;
  downloadPdf: () => Promise<void>;
  printPdf: () => Promise<void>;
}

/**
 * Hook to handle PDF viewer logic
 * @param url URL of the PDF to display
 * @param options Additional options for the PDF viewer
 * @returns State and handlers for PDF viewer
 */
export function usePdfViewer(
  url: string,
  options: {
    initialPage?: number;
    initialScale?: number;
    onViewComplete?: (numPages: number) => void;
    downloadFilename?: string;
  } = {}
): UsePdfViewerReturn {
  const [state, setState] = useState<PdfViewerState>({
    numPages: 0,
    pageNumber: options.initialPage || 1,
    scale: options.initialScale || 1.0,
    rotation: 0,
    loading: true,
    error: null,
    errorType: null
  });
  
  // Document load success handler
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setState(prev => ({ ...prev, numPages, loading: false }));
    
    if (options.onViewComplete) {
      options.onViewComplete(numPages);
    }
  };
  
  // Document load error handler
  const onDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF:', err);
    const pdfError = analyzePdfError(err, url);
    setState(prev => ({ 
      ...prev, 
      loading: false, 
      error: err, 
      errorType: pdfError.type 
    }));
  };
  
  // Set page number
  const setPageNumber = (page: number) => {
    if (page >= 1 && page <= state.numPages) {
      setState(prev => ({ ...prev, pageNumber: page }));
    }
  };
  
  // Set scale (zoom)
  const setScale = (scale: number) => {
    setState(prev => ({ ...prev, scale }));
  };
  
  // Set rotation
  const setRotation = (rotation: number) => {
    // Normalize rotation to 0, 90, 180, or 270
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    setState(prev => ({ ...prev, rotation: normalizedRotation }));
  };
  
  // Download PDF
  const downloadPdf = async () => {
    try {
      const data = await loadPdfWithFallback(url);
      
      // Cache the loaded PDF
      cachePdf(url, data);
      
      // Create a blob URL for download
      const blob = new Blob([data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = options.downloadFilename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      onDocumentLoadError(err instanceof Error ? err : new Error(String(err)));
    }
  };
  
  // Print PDF
  const printPdf = async () => {
    try {
      const data = await loadPdfWithFallback(url);
      
      // Cache the loaded PDF
      cachePdf(url, data);
      
      // Create a blob URL for printing
      const blob = new Blob([data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in a new window and print
      const printWindow = window.open(blobUrl);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } catch (err) {
      console.error('Error loading PDF for printing:', err);
      onDocumentLoadError(err instanceof Error ? err : new Error(String(err)));
    }
  };
  
  return {
    ...state,
    onDocumentLoadSuccess,
    onDocumentLoadError,
    setPageNumber,
    setScale,
    setRotation,
    downloadPdf,
    printPdf
  };
}
