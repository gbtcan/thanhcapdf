import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText } from 'lucide-react';
import { configurePdfWorker } from '../utils/pdf/pdfConfig';

// Make sure PDF.js worker is configured
configurePdfWorker();

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number;
  height?: number;
  pageNumber?: number;
  className?: string;
  onError?: () => void;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({
  fileUrl,
  width = 100,
  height,
  pageNumber = 1,
  className = '',
  onError
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate the scale based on width
  const scale = width / 612; // standard PDF width is 612 points

  const handleDocumentLoadSuccess = () => {
    setLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (err: Error) => {
    setError(err);
    setLoading(false);
    if (onError) {
      onError();
    }
  };

  useEffect(() => {
    // Reset state when fileUrl changes
    setLoading(true);
    setError(null);
  }, [fileUrl]);

  if (!fileUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded ${className}`}
        style={{ width: `${width}px`, height: height || `${width * 1.414}px` }}
      >
        <FileText className="text-gray-400 h-10 w-10" />
      </div>
    );
  }

  return (
    <div
      className={`pdf-thumbnail relative overflow-hidden ${className}`}
      style={{ width: `${width}px`, height: height ? `${height}px` : 'auto' }}
    >
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={null}
        className="pdf-thumbnail-document"
      >
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={null}
          scale={scale}
        />
      </Document>

      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ width: `${width}px`, height: height || `${width * 1.414}px` }}
        >
          <div className="animate-pulse w-5 h-5 bg-indigo-300 rounded-full"></div>
        </div>
      )}

      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{ width: `${width}px`, height: height || `${width * 1.414}px` }}
        >
          <FileText className="text-gray-400 h-8 w-8" />
        </div>
      )}
    </div>
  );
};

export default PDFThumbnail;
