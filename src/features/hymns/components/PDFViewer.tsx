import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, AlertCircle, Download, Maximize, ZoomIn, ZoomOut, 
  RotateCw, Printer, ChevronLeft, ChevronRight, RefreshCw 
} from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Skeleton } from '../../../core/components/ui/skeleton';
import { toast } from '../../../core/components/ui/toast';
import { pdfjs, Document, Page } from 'react-pdf';

// Đảm bảo PDF.js worker được cấu hình đúng
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string; 
  title?: string;
  height?: number | string;
  allowDownload?: boolean;
  allowFullscreen?: boolean;
  allowPrint?: boolean;
  showToolbar?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  title = "Bản nhạc",
  height = 600,
  allowDownload = true,
  allowFullscreen = true,
  allowPrint = true,
  showToolbar = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Chuyển sang chế độ dự phòng nếu iframe không tải được
  const switchToFallbackMode = () => {
    setUseFallbackMode(true);
    setIsLoading(false);
    console.log('Switched to fallback PDF viewer mode');
  };
  
  useEffect(() => {
    // Attempt to fetch basic PDF info from iframe once loaded
    const handleIframeLoad = () => {
      setIsLoading(false);
      try {
        // Some PDF viewers will expose page info via iframe
        if (iframeRef.current?.contentWindow?.document) {
          const doc = iframeRef.current.contentWindow.document;
          // This is a very basic detection attempt - won't work for all PDF viewers
          const pageInfoEl = doc.querySelector('[data-page-number]');
          if (pageInfoEl) {
            const pageNum = pageInfoEl.getAttribute('data-page-number');
            const pageCount = pageInfoEl.getAttribute('data-page-count');
            if (pageNum) setCurrentPage(parseInt(pageNum, 10));
            if (pageCount) setTotalPages(parseInt(pageCount, 10));
          }
        }
      } catch (err) {
        // Silently fail - this is just an enhancement
        console.log('Could not access PDF viewer page info');
      }
    };

    // Add event listener to iframe
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      
      // Set a timeout to switch to fallback mode if iframe doesn't load properly
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          switchToFallbackMode();
        }
      }, 5000); // 5 seconds timeout
      
      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        clearTimeout(timeoutId);
      };
    }
  }, [isLoading]);
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    switchToFallbackMode();
  };

  // Function to open in new tab for fullscreen view
  const openFullscreen = () => {
    window.open(pdfUrl, '_blank');
  };

  // For direct download
  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = title ? `${title}.pdf` : "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Đang tải xuống",
        description: "Tệp PDF đang được tải xuống",
        variant: "info"
      });
    } catch (err) {
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống tệp PDF",
        variant: "destructive"
      });
    }
  };
  
  // Handle print
  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else {
      // Fallback if direct iframe printing doesn't work
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };
  
  // Handle zoom in/out
  const handleZoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      // Limit zoom between 0.5x and 2.5x
      return Math.max(0.5, Math.min(2.5, newScale));
    });
    
    try {
      // Try to apply zoom to the iframe content if possible
      if (iframeRef.current?.contentWindow?.document) {
        const doc = iframeRef.current.contentWindow.document;
        const viewer = doc.querySelector('.pdfViewer');
        if (viewer) {
          viewer.style.transform = `scale(${scale})`;
          viewer.style.transformOrigin = 'center top';
        }
      }
    } catch (err) {
      // Silently fail - this is just an enhancement
    }
  };

  // Handlers for react-pdf fallback component
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
  };

  const changePage = (offset: number) => {
    setCurrentPage(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(totalPages, newPage));
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  // Add URL parameters to control PDF viewer behavior
  const enhancedPdfUrl = `${pdfUrl}#view=FitH&toolbar=${showToolbar ? '1' : '0'}`;

  return (
    <div className="w-full">
      {/* Controls */}
      {showToolbar && (
        <div className="flex justify-between items-center mb-3 py-2 px-3 bg-gray-50 dark:bg-gray-900 rounded-t-md border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-none">
              {title}
            </h3>
            
            {!isLoading && totalPages > 1 && (
              <div className="hidden sm:flex items-center ml-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Trang {currentPage} / {totalPages}</span>
                <div className="ml-2 flex">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    disabled={currentPage <= 1}
                    onClick={() => useFallbackMode ? previousPage() : setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    disabled={currentPage >= totalPages}
                    onClick={() => useFallbackMode ? nextPage() : setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Phóng to"
              onClick={() => handleZoom(0.1)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Thu nhỏ"
              onClick={() => handleZoom(-0.1)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            {!useFallbackMode && (
              <>
                {allowPrint && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hidden sm:flex" 
                    title="In"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                )}
                {allowDownload && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Tải xuống"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {allowFullscreen && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Xem toàn màn hình"
                    onClick={openFullscreen}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
            {useFallbackMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                title="Tải xuống"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* PDF Display */}
      <div 
        className={`w-full bg-gray-100 dark:bg-gray-900 ${showToolbar ? 'rounded-b-md' : 'rounded-md'} overflow-hidden relative`}
        style={{ height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin">
                <RefreshCw className="h-10 w-10 text-indigo-500" />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Đang tải PDF...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-center text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Tải về để xem
            </Button>
          </div>
        ) : useFallbackMode ? (
          // React-PDF fallback renderer
          <div className="h-full flex justify-center overflow-auto">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => setError("Không thể tải bản PDF. Vui lòng thử lại sau.")}
              loading={<div className="p-10 text-center">Đang tải PDF...</div>}
              error={
                <div className="p-10 text-center text-red-500">
                  Không thể tải PDF. Vui lòng thử lại sau.
                </div>
              }
            >
              <Page
                key={`page_${currentPage}`}
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="pdf-page"
              />
            </Document>
          </div>
        ) : (
          // Primary iframe renderer
          <iframe
            ref={iframeRef}
            src={enhancedPdfUrl}
            width="100%"
            height="100%"
            onLoad={handleLoad}
            onError={handleError}
            className="border-0"
            title={title}
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center top',
              transition: 'transform 0.2s ease'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
