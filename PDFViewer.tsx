import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Since we can't find the spinner component at "./ui/spinner", 
// let's create a simple spinner component inline
const Spinner = ({ className }: { className?: string }) => (
  <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${className || ''}`} />
);

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: string;
  onDocumentLoadSuccess?: (numPages: number) => void;
}

export default function PDFViewer({ file, onDocumentLoadSuccess }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);

  function onDocumentLoadSuccessHandler({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    if (onDocumentLoadSuccess) {
      onDocumentLoadSuccess(numPages);
    }
    setLoadingError(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error("Failed to load PDF with react-pdf:", error);
    setLoadingError(true);
    setFallbackMode(true);
  }

  if (fallbackMode) {
    return (
      <div className="w-full h-full flex flex-col items-center">
        <div className="w-full bg-muted rounded-lg overflow-hidden">
          <iframe
            src={`${file}#view=FitH&toolbar=1&navpanes=0`}
            className="w-full h-[calc(100vh-250px)]"
            title="PDF Viewer"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full bg-muted rounded-lg overflow-hidden">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccessHandler}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex justify-center py-10">
              <Spinner className="h-10 w-10" />
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-destructive mb-2">Không thể tải tài liệu PDF</p>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => setFallbackMode(true)}
              >
                Thử xem bằng trình xem thay thế
              </button>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={window.innerWidth > 768 ? 800 : window.innerWidth - 64}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
