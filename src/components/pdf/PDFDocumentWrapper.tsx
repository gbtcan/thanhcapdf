import React, { useState, useEffect } from 'react';
import { Document, DocumentProps } from 'react-pdf';
import { configurePdfWorker, getPdfOptions } from '../../utils/pdf/pdfConfig';
import LoadingIndicator from '../common/LoadingIndicator';
import { FileX } from 'lucide-react';

// Configure PDF.js worker when component is first imported
configurePdfWorker();

interface PDFDocumentWrapperProps extends Omit<DocumentProps, 'error' | 'loading' | 'noData'> {
  errorMessage?: string;
  loadingMessage?: string;
  className?: string;
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
}

/**
 * A wrapper for react-pdf's Document component with standardized error and loading states
 */
const PDFDocumentWrapper: React.FC<PDFDocumentWrapperProps> = ({
  file,
  children,
  errorMessage = 'Failed to load PDF document',
  loadingMessage = 'Loading PDF...',
  className = '',
  onLoadSuccess,
  onLoadError,
  ...props
}) => {
  // Ensure worker is configured
  useEffect(() => {
    configurePdfWorker();
  }, []);

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setLoading(false);
    if (onLoadSuccess) onLoadSuccess(numPages);
  };

  const handleLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setLoading(false);
    if (onLoadError) onLoadError(error);
  };

  return (
    <div className={className}>
      {error ? (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <FileX className="h-12 w-12 text-red-500 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            {errorMessage}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          {typeof file === 'string' && (
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Try opening directly
            </a>
          )}
        </div>
      ) : (
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            loading ? (
              <div className="flex justify-center items-center p-6">
                <LoadingIndicator size="medium" message={loadingMessage} />
              </div>
            ) : null
          }
          noData={null}
          options={getPdfOptions()}
          {...props}
        >
          {loading ? null : children}
        </Document>
      )}
    </div>
  );
};

export default PDFDocumentWrapper;
