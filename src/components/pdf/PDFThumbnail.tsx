import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { configurePdfWorker, getPdfOptions } from '../../utils/pdf/pdfConfig';
import { FileX } from 'lucide-react';

// Configure PDF.js worker
configurePdfWorker();

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Component to display a thumbnail preview of the first page of a PDF
 */
const PDFThumbnail: React.FC<PDFThumbnailProps> = ({
  fileUrl,
  width = 120,
  className = '',
  onLoad,
  onError
}) => {
  const [loadingFailed, setLoadingFailed] = useState<boolean>(false);

  // Clear error state when URL changes
  useEffect(() => {
    if (fileUrl) {
      setLoadingFailed(false);
    }
  }, [fileUrl]);

  // Handle successful load
  const handleLoadSuccess = () => {
    if (onLoad) onLoad();
  };

  // Handle loading error
  const handleLoadError = () => {
    setLoadingFailed(true);
    if (onError) onError();
  };

  // If no URL provided or loading failed, show placeholder
  if (!fileUrl || loadingFailed) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 ${className}`} 
        style={{ width, height: width * 1.4 }}
      >
        <div className="text-center p-2">
          <FileX className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {loadingFailed ? 'Failed to load' : 'No preview'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`pdf-thumbnail overflow-hidden ${className}`}
      style={{ width, height: 'auto', maxHeight: width * 1.5 }}
    >
      <Document
        file={fileUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        options={getPdfOptions()}
        loading={
          <div 
            className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" 
            style={{ width, height: width * 1.4 }}
          />
        }
      >
        <Page
          pageNumber={1}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={null}
          className="shadow-sm rounded"
        />
      </Document>
    </div>
  );
};

export default PDFThumbnail;
