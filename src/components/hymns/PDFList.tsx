import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, Calendar, Download, ExternalLink, FileIcon } from 'lucide-react';
import { getPdfFilesForHymn, getPdfFileUrl, recordPDFView } from '../../lib/hymnPdfService';
import LoadingIndicator from '../LoadingIndicator';
import { formatRelativeTime } from '../../utils/dateUtils';
import PDFEmbed from './PDFEmbed';
import PDFThumbnail from '../PDFThumbnail';
import type { PdfFile } from '../../types/pdf';
import { useAuth } from '../../contexts/AuthContext';
import { clientConfig } from '../../config/clientConfig';
import PDFViewToggle from '../PDFViewToggle';

interface PDFListProps {
  hymnId: string;
  onSelectPdf?: (pdf: PdfFile) => void;
  showPreview?: boolean;
  limit?: number;
  viewMode?: 'list' | 'grid';
  showViewToggle?: boolean;
}

const PDFList: React.FC<PDFListProps> = ({ 
  hymnId,
  onSelectPdf,
  showPreview = true,
  limit,
  viewMode: initialViewMode = 'list',
  showViewToggle = true
}) => {
  const { user } = useAuth();
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(initialViewMode);

  // Fetch PDF files
  const { data: pdfFiles, isLoading, error } = useQuery({
    queryKey: ['pdf-files', hymnId],
    queryFn: () => getPdfFilesForHymn(hymnId),
    enabled: !!hymnId,
  });

  // Handle PDF selection
  const handleSelectPdf = (pdf: PdfFile) => {
    setSelectedPdf(pdf);
    
    if (onSelectPdf) {
      onSelectPdf(pdf);
    }
    
    // Record view if tracking is enabled
    if (clientConfig.features.pdfViewsTracking) {
      recordPDFView(pdf.id, user?.id)
        .catch(err => console.error('Error recording PDF view:', err));
    }
  };

  // Handle thumbnail error
  const handleThumbnailError = (pdfId: string) => {
    setThumbnailErrors(prev => ({
      ...prev,
      [pdfId]: true
    }));
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Display loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingIndicator size="medium" message="Loading PDF files..." />
      </div>
    );
  }

  // Display error message
  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Failed to load PDF files
      </div>
    );
  }

  // No PDF files found
  if (!pdfFiles || pdfFiles.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg">
        No PDF files available for this hymn.
      </div>
    );
  }

  // Limit the number of PDFs if specified
  const displayPdfFiles = limit ? pdfFiles.slice(0, limit) : pdfFiles;

  return (
    <div className="pdf-list space-y-4">
      {/* View toggle */}
      {showViewToggle && pdfFiles.length > 1 && (
        <div className="flex justify-end mb-2">
          <PDFViewToggle 
            viewMode={viewMode} 
            onChange={setViewMode} 
          />
        </div>
      )}
      
      {/* Grid view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPdfFiles.map((pdf) => {
            const pdfUrl = getPdfFileUrl(pdf.filename);
            const isSelected = selectedPdf?.id === pdf.id;
            
            return (
              <div 
                key={pdf.id}
                className={`border ${isSelected ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700'} 
                          rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handleSelectPdf(pdf)}
              >
                {/* PDF Thumbnail */}
                <div className="p-2 flex justify-center">
                  {!thumbnailErrors[pdf.id] ? (
                    <PDFThumbnail 
                      fileUrl={pdfUrl} 
                      width={150} 
                      className="mx-auto"
                      onError={() => handleThumbnailError(pdf.id)} 
                    />
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded" style={{ width: 150, height: 200 }}>
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* PDF Info */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {pdf.metadata?.originalName || pdf.filename.split('/').pop() || 'PDF Document'}
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-2">
                    {pdf.created_at && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatRelativeTime(pdf.created_at)}
                      </span>
                    )}
                    {pdf.size && (
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {formatFileSize(pdf.size)}
                      </span>
                    )}
                    {pdf.view_count !== undefined && (
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {pdf.view_count} view{pdf.view_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end mt-2 space-x-2">
                    <a
                      href={pdfUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </a>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List view (default)
        <div className="grid gap-3">
          {displayPdfFiles.map((pdf) => {
            const pdfUrl = getPdfFileUrl(pdf.filename);
            const isSelected = selectedPdf?.id === pdf.id;
            
            return (
              <div 
                key={pdf.id}
                className={`border ${isSelected ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700'} 
                          rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow`}
              >
                {/* PDF Header */}
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => handleSelectPdf(pdf)}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {pdf.metadata?.originalName || pdf.filename.split('/').pop() || 'PDF Document'}
                      </div>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                        {pdf.created_at && (
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatRelativeTime(pdf.created_at)}
                          </span>
                        )}
                        {pdf.size && (
                          <span className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {formatFileSize(pdf.size)}
                          </span>
                        )}
                        {pdf.view_count !== undefined && (
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {pdf.view_count} view{pdf.view_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <a
                      href={pdfUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </a>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </a>
                  </div>
                </div>
                
                {/* Preview (if selected and showPreview is true) */}
                {showPreview && isSelected && (
                  <PDFEmbed 
                    fileUrl={pdfUrl} 
                    title={pdf.metadata?.originalName || pdf.filename.split('/').pop()} 
                    maxHeight="400px"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show more link if limit is applied and there are more files */}
      {limit && pdfFiles.length > limit && (
        <div className="text-center pt-2">
          <button 
            onClick={() => onSelectPdf && onSelectPdf(pdfFiles[0])}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all {pdfFiles.length} PDF files
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFList;
