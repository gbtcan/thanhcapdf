import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, ExternalLink, Loader } from 'lucide-react';
import LoadingIndicator from '../LoadingIndicator';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFEmbedProps {
  url: string;
  title?: string;
  height?: string;
  width?: string;
  showDownload?: boolean;
  showToolbar?: boolean;
}

const PDFEmbed: React.FC<PDFEmbedProps> = ({
  url,
  title,
  height = '500px',
  width = '100%',
  showDownload = true,
  showToolbar = true,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    setError(`Error loading PDF: ${err.message}`);
    setLoading(false);
  };

  const goToPreviousPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => 
      Math.min(prevPageNumber + 1, numPages || 1)
    );
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.6));
  };

  return (
    <div className="pdf-container">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}

      {showToolbar && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-t-md mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm">
              Page {pageNumber} of {numPages || '...'}
            </span>
            <button
              onClick={goToNextPage}
              disabled={!numPages || pageNumber >= numPages}
              className="p-1.5 rounded-full hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-full hover:bg-gray-200"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-full hover:bg-gray-200"
            >
              <ZoomIn size={18} />
            </button>
            {showDownload && (
              <a
                href={url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-gray-200"
              >
                <Download size={18} />
              </a>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full hover:bg-gray-200"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      )}

      <div
        className="pdf-document-container border border-gray-300 rounded-md overflow-hidden bg-gray-100"
        style={{ height, width }}
      >
        {error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="h-full flex items-center justify-center"><LoadingIndicator message="Loading PDF..." /></div>}
            className="flex justify-center"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={<div className="h-40 flex items-center justify-center"><Loader className="animate-spin" /></div>}
              className="shadow-md"
            />
          </Document>
        )}
        
        {loading && !error && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
            <LoadingIndicator message="Loading PDF document..." />
          </div>
        )}
      </div>

      {!showToolbar && showDownload && (
        <div className="mt-2 flex justify-end">
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <Download size={16} className="mr-1" />
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
};

export default PDFEmbed;
