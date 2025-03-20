import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { configurePdfWorker, getPdfOptions } from '../../utils/pdfConfig';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingIndicator from '../LoadingIndicator';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
configurePdfWorker();

interface PDFEmbedProps {
  fileUrl: string;
  title?: string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  className?: string;
}

/**
 * A simpler PDF viewer component for embedding in pages
 * Provides basic navigation but no zoom or other controls
 */
const PDFEmbed: React.FC<PDFEmbedProps> = ({
  fileUrl,
  title,
  maxWidth = '100%',
  maxHeight = '500px',
  className = ''
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setLoading(false);
  };

  const goToPreviousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
  };

  return (
    <div className={`pdf-embed border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`} style={{ maxWidth }}>
      {/* PDF Viewer Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
            {title || 'PDF Document'}
          </span>
        </div>
        
        {/* Page navigation controls */}
        {numPages > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className={`p-1 rounded ${pageNumber <= 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pageNumber} of {numPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className={`p-1 rounded ${pageNumber >= numPages ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* PDF Document Container */}
      <div style={{ maxHeight, overflow: 'auto' }} className="bg-gray-100 dark:bg-gray-900 flex justify-center">
        {loading && (
          <div className="py-12 flex justify-center items-center w-full">
            <LoadingIndicator size="medium" message="Loading PDF..." />
          </div>
        )}

        {error && (
          <div className="py-12 flex flex-col justify-center items-center w-full text-center px-4">
            <div className="text-red-500 mb-2">Failed to load PDF</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              The document might be unavailable or requires authentication.
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Open in New Tab
            </a>
          </div>
        )}

        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
          options={getPdfOptions()}
          className="pdf-document"
        >
          <Page
            pageNumber={pageNumber}
            renderAnnotationLayer={true}
            renderTextLayer={false}
            loading={null}
            className="pdf-page"
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFEmbed;
