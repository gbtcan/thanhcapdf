import React from 'react';
import { FileText, Eye, ChevronRight } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Card, CardContent } from '../../../core/components/ui/card';
import { formatDate } from '../../../lib/utils';

interface PDFItem {
  id: string;
  name: string;
  description?: string;
  fileKey: string;
  created_at?: string;
  size?: number;
}

interface PDFListProps {
  pdfs: PDFItem[];
  onSelect: (pdf: PDFItem) => void;
  activePdfId?: string;
}

const PDFList: React.FC<PDFListProps> = ({ pdfs, onSelect, activePdfId }) => {
  if (!pdfs || pdfs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Không có bản PDF nào
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Hiện tại không có bản PDF nào cho thánh ca này.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {pdfs.map((pdf) => (
            <div 
              key={pdf.id}
              className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                activePdfId === pdf.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
              }`}
              onClick={() => onSelect(pdf)}
            >
              <div className="mr-4 flex-shrink-0">
                <div className={`p-2 rounded-md ${
                  activePdfId === pdf.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {pdf.name || `Bản nhạc ${pdf.id.slice(0, 4)}`}
                </h4>
                {pdf.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {pdf.description}
                  </p>
                )}
                <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  {pdf.created_at && (
                    <span className="mr-3">{formatDate(pdf.created_at, 'dd/MM/yyyy')}</span>
                  )}
                  {pdf.size && <span>{formatFileSize(pdf.size)}</span>}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className={`ml-4 flex-shrink-0 ${
                  activePdfId === pdf.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {activePdfId === pdf.id ? <Eye className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFList;
