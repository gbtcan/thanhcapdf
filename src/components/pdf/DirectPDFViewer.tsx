import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Printer, ChevronLeft, ChevronRight, Search, X, Maximize, Minimize } from 'lucide-react';
import { getSupabasePdfUrl } from '../../utils/pdf/pdfConfig';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-viewer/pdf.worker.min.js';

interface DirectPDFViewerProps {
  pdfUrl: string;
  title?: string;
  description?: string;
  className?: string;
  onClose?: () => void;
  initialPage?: number;
  searchTerm?: string;
}

const DirectPDFViewer: React.FC<DirectPDFViewerProps> = ({
  pdfUrl,
  title,
  description,
  className = '',
  onClose,
  initialPage = 1,
  searchTerm
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [searchQuery, setSearchQuery] = useState<string>(searchTerm || '');
  const [showSearch, setShowSearch] = useState<boolean>(!!searchTerm);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : getSupabasePdfUrl(pdfUrl);
  
  // Load PDF document
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  // Navigate to next page
  const goToNextPage = () => {
    if (pageNumber < (numPages || 0)) {
      setPageNumber(pageNumber + 1);
    }
  };
  
  // Navigate to previous page
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (containerRef.current) {
      containerRef.current.requestFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };
  
  // Go to specific page
  const goToPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= (numPages || 0)) {
      setPageNumber(page);
    }
  };
  
  // Handle key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages, onClose]);
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Handle print PDF
  const handlePrint = () => {
    const printWindow = window.open(fullUrl, '_blank');
    if (printWindow) {
      printWindow.onload = function() {
        printWindow.print();
      };
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col ${className} ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* PDF viewer header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {title || 'PDF Document'}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {description}
            </p>
          )}
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          
          <button
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Print"
          >
            <Printer className="h-5 w-5" />
          </button>
          
          <a
            href={fullUrl}
            download
            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </a>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Search bar */}
      {showSearch && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in document..."
            className="flex-1 border-none focus:ring-0 text-sm bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      
      {/* PDF content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
        <Document
          file={fullUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center"
          loading={
            <div className="w-full h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }
          error={
            <div className="w-full p-4 text-center text-red-500 dark:text-red-400">
              Failed to load PDF. Please try again or download the file.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={showSearch} // Only render text layer when search is enabled
            renderAnnotationLayer={false}
            customTextRenderer={searchQuery ? {
              // Highlight search term in text
              customTextRenderer: (textItem: any) => {
                if (!searchQuery) return undefined;
                const text = textItem.str;
                const pattern = new RegExp(`(${searchQuery})`, 'gi');
                return text.replace(pattern, '<mark>$1</mark>');
              }
            } : undefined}
          />
        </Document>
      </div>
      
      {/* Footer with pagination */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setScale(scale - 0.1)}
            disabled={scale <= 0.5}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            Zoom Out
          </button>
          <span className="mx-2 text-gray-600 dark:text-gray-300">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(scale + 0.1)}
            disabled={scale >= 2.0}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            Zoom In
          </button>
        </div>
        
        <div className="flex items-center">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <span className="mx-2 text-gray-600 dark:text-gray-300">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={pageNumber}
              onChange={goToPage}
              className="w-12 text-center border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md"
            />
            {` / ${numPages || 1}`}
          </span>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 0)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectPDFViewer;
