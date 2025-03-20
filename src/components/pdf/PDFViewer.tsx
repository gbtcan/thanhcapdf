import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { configurePdfWorker, getPdfOptions } from '../../utils/pdf/pdfConfig';
import { cachePdf } from '../../utils/pdf/pdfCache';
import { loadPdfWithFallback, analyzePdfError, PdfErrorType } from '../../utils/pdf/pdfErrorHandler';
import PDFViewOptions from './PDFViewOptions';
import LoadingIndicator from '../common/LoadingIndicator';
import { Download, ExternalLink, FileX } from 'lucide-react';
import { useFullscreen } from '../../utils/hooks';

// Configure PDF.js worker
configurePdfWorker();

interface PDFViewerProps {
  url: string;
  title?: string;
  className?: string;
  onDownload?: () => void;
  canDownload?: boolean;
  canPrint?: boolean;
  initialPage?: number;
  onViewComplete?: (numPages: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  title,
  className = '',
  onDownload,
  canDownload = true,
  canPrint = true,
  initialPage = 1,
  onViewComplete
}) => {
  // State
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<PdfErrorType | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  
  // Reset page number when URL changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    setErrorType(null);
    setPageNumber(initialPage);
  }, [url, initialPage]);
  
  // Handle document load success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    
    // Notify parent component if needed
    if (onViewComplete) {
      onViewComplete(numPages);
    }
  };
  
  // Handle document load error
  const onDocumentLoadError = (err: Error) => {
    console.error('Error loading PDF:', err);
    setError(err);
    setLoading(false);
    
    // Analyze the error type
    const pdfError = analyzePdfError(err, url);
    setErrorType(pdfError.type);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };
  
  // Handle scale change (zoom)
  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };
  
  // Handle rotation
  const handleRotationChange = (newRotation: number) => {
    // Normalize rotation to 0, 90, 180, or 270
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    setRotation(normalizedRotation);
  };
  
  // Handle print
  const handlePrint = async () => {
    try {
      // Load PDF data
      const pdfData = await loadPdfWithFallback(url);
      
      // Cache the loaded PDF
      cachePdf(url, pdfData);
      
      // Create blob URL
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in new window and print
      const printWindow = window.open(blobUrl);
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 100);
        };
      }
    } catch (err) {
      console.error('Error printing PDF:', err);
    }
  };
  
  // Handle download
  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    try {
      // Load PDF data
      const pdfData = await loadPdfWithFallback(url);
      
      // Cache the loaded PDF
      cachePdf(url, pdfData);
      
      // Create download link
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = title || url.split('/').pop() || 'document.pdf';
      
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`pdf-viewer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {title && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{title}</h3>
        </div>
      )}
      
      {!error && (
        <PDFViewOptions 
          scale={scale}
          onScaleChange={handleScaleChange}
          rotation={rotation}
          onRotationChange={handleRotationChange}
          canPrint={canPrint}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          pageNumber={pageNumber}
          numPages={numPages}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* PDF Document Container */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        {loading && (
          <div className="flex justify-center items-center h-full">
            <LoadingIndicator size="large" message="Loading PDF document..." />
          </div>
        )}
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileX className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Failed to load PDF
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {error.message}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {canDownload && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </button>
              )}
              
              {typeof url === 'string' && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              options={getPdfOptions()}
              className="pdf-document"
            >
              {!loading && Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="mb-4 shadow-lg"
                  loading={
                    <div className="flex justify-center p-4">
                      <LoadingIndicator size="small" message={`Loading page ${index + 1}...`} />
                    </div>
                  }
                />
              ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
