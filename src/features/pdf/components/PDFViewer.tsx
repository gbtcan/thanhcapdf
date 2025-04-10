import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Input } from '../../../core/components/ui/input';
import { toast } from '../../../core/hooks/useToast';
import { useNotifications } from '../../../core/contexts/NotificationContext';

// Sử dụng worker local để không phụ thuộc vào CDN
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;
  downloadFileName?: string;
  title?: string;
  height?: number;
  allowDownload?: boolean;
  allowFullscreen?: boolean;
  allowPrint?: boolean;
  showToolbar?: boolean;
  useFallbackIfNeeded?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  downloadFileName,
  title,
  height = 700,
  allowDownload = true,
  allowFullscreen = true,
  allowPrint = true,
  showToolbar = true,
  useFallbackIfNeeded = true
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const { addNotification } = useNotifications();
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Trích xuất tên file để hiển thị
  const fileName = downloadFileName || title || pdfUrl.split('/').pop() || 'document.pdf';
  
  // Hàm trích xuất đuôi file
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };
  
  // Kiểm tra xem URL có phải là PDF không
  const isPdfFile = useCallback((url: string): boolean => {
    // Kiểm tra đuôi file
    if (getFileExtension(url) === 'pdf') return true;
    
    // Kiểm tra nếu URL có dạng data:application/pdf
    if (url.startsWith('data:application/pdf')) return true;
    
    return false;
  }, []);

  // Reset state khi URL thay đổi
  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setScale(1);
    setRotation(0);
    setIsLoading(true);
    setError(null);
    setUseFallback(false);
    
    // Nếu URL không phải là PDF, sử dụng fallback ngay
    if (!isPdfFile(pdfUrl) && useFallbackIfNeeded) {
      setUseFallback(true);
      setIsLoading(false);
    }
    
    // Thiết lập timeout để chuyển sang fallback nếu PDF không tải được
    if (useFallbackIfNeeded && fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
    
    if (useFallbackIfNeeded) {
      fallbackTimeoutRef.current = setTimeout(() => {
        if (isLoading && !numPages) {
          console.log('PDF loading timeout, switching to fallback mode');
          setUseFallback(true);
          setIsLoading(false);
          addNotification({
            type: 'info',
            title: 'Sử dụng chế độ xem dự phòng',
            message: 'Đã chuyển sang chế độ xem dự phòng để hiển thị PDF.'
          });
        }
      }, 5000); // 5 giây timeout
    }
    
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
    };
  }, [pdfUrl, useFallbackIfNeeded, addNotification, isPdfFile]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    
    // Hủy timeout khi PDF tải thành công
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setIsLoading(false);
    
    // Chuyển sang fallback mode nếu được phép
    if (useFallbackIfNeeded) {
      console.log('PDF loading failed, switching to fallback mode');
      setUseFallback(true);
    } else {
      addNotification({
        type: 'error',
        title: 'Không thể tải PDF',
        message: 'Có lỗi xảy ra khi tải tệp PDF. Vui lòng thử lại sau.'
      });
    }
  }, [useFallbackIfNeeded, addNotification]);

  const previousPage = useCallback(() => {
    setPageNumber(prev => prev - 1 <= 1 ? 1 : prev - 1);
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber(prev => prev + 1 >= numPages! ? numPages! : prev + 1);
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale(prev => prev + 0.1);
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => prev - 0.1 > 0.1 ? prev - 0.1 : 0.1);
  }, []);

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const downloadPDF = useCallback(() => {
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = downloadFileName || fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Tải xuống bắt đầu",
        description: `Đang tải xuống ${fileName}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống file PDF. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      
      // Mở trong tab mới như là phương án dự phòng
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl, downloadFileName, fileName]);
  
  // Xử lý chế độ toàn màn hình
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen().catch(err => {
          console.error(`Không thể vào chế độ toàn màn hình: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);
  
  // Theo dõi trạng thái toàn màn hình
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Mở PDF trong trình xem mặc định của trình duyệt
  const openInNewTab = useCallback(() => {
    window.open(pdfUrl, '_blank');
  }, [pdfUrl]);
  
  // Khi sử dụng iframe làm phương án dự phòng
  const renderFallbackViewer = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Toolbar đơn giản cho iframe */}
        {showToolbar && (
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-t-md flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium px-2">
              {title || fileName}
            </div>
            
            <div className="flex items-center space-x-1">
              {allowFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                </Button>
              )}
              
              {allowDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPDF}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Tải xuống
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Mở trong tab mới
              </Button>
            </div>
          </div>
        )}
        
        {/* Sử dụng iframe để hiển thị PDF */}
        <div 
          className="flex-1 bg-gray-200 dark:bg-gray-700 overflow-hidden"
          style={{ height: showToolbar ? height - 40 : height }}
        >
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={title || "PDF Viewer"}
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  // Nếu đang sử dụng phương án dự phòng, hiển thị iframe
  if (useFallback) {
    return renderFallbackViewer();
  }

  return (
    <div className="flex flex-col h-full" ref={viewerRef} style={{ height }}>
      {/* PDF toolbar */}
      {showToolbar && (
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-t-md flex flex-wrap items-center justify-between gap-2">
          {/* Page navigation */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="px-2 flex items-center space-x-1">
              <Input 
                type="number"
                min={1}
                max={numPages || 1}
                value={pageNumber}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= numPages!) {
                    setPageNumber(value);
                  }
                }}
                className="w-12 h-8 text-center"
              />
              <span className="whitespace-nowrap">/ {numPages || '?'}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={numPages === null || pageNumber >= numPages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Zoom and rotate controls */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={zoomOut}
              className="h-8 w-8"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm mx-1">{Math.round(scale * 100)}%</span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={zoomIn}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={rotate}
              className="h-8 w-8"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            {allowFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8"
              >
                {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              </Button>
            )}
            
            {allowDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                Tải xuống
              </Button>
            )}
            
            {/* Fallback button */}
            {useFallbackIfNeeded && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseFallback(true)}
                className="h-8"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Xem ở chế độ khác
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* PDF viewer */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-700">
        <div className="min-h-full flex justify-center py-4">
          {isLoading && (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Đang tải PDF...</p>
            </div>
          )}
          
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={
              <div className="p-10 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 max-w-md">
                  <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    Không thể tải PDF
                  </h3>
                  <p className="text-red-700 dark:text-red-200 text-sm mb-4">
                    Có lỗi xảy ra khi tải tệp PDF.
                  </p>
                  
                  {useFallbackIfNeeded ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setUseFallback(true)}
                      className="mr-2"
                    >
                      Sử dụng chế độ xem khác
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="mr-2"
                    >
                      Thử lại
                    </Button>
                  )}
                  
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => window.open(pdfUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Mở trong trình duyệt
                  </Button>
                </div>
              </div>
            }
          >
            {!isLoading && !error && (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div className="flex justify-center items-center p-5">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                }
              />
            )}
          </Document>
        </div>
      </div>
    </div>
  );
};

// Memoize component để tránh re-renders không cần thiết
export default memo(PDFViewer);
