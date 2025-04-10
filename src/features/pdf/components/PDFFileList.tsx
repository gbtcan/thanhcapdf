import React from 'react';
import { PdfFile } from '../../hymns/types';
import { FileText, Download } from 'lucide-react';
import { formatFileSize } from '../../../core/utils/formatters';

interface PDFFileListProps {
  files: PdfFile[];
  onSelectFile: (url: string) => void;
  activeFileUrl?: string | null;
}

const PDFFileList: React.FC<PDFFileListProps> = ({ 
  files, 
  onSelectFile, 
  activeFileUrl 
}) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Không có tập tin PDF nào khả dụng.
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div 
          key={file.id}
          className={`flex items-center p-3 rounded-md cursor-pointer ${
            activeFileUrl === file.file_url 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-750 border border-transparent'
          }`}
          onClick={() => onSelectFile(file.file_url)}
        >
          <FileText className={`h-5 w-5 mr-3 ${
            activeFileUrl === file.file_url
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-400 dark:text-gray-500'
          }`} />
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              activeFileUrl === file.file_url
                ? 'text-indigo-700 dark:text-indigo-300' 
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {file.title || "Bản nhạc PDF"}
            </p>
            
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {file.file_type && <span className="mr-2">{file.file_type.replace('application/', '')}</span>}
              {file.size_bytes && (
                <span>{formatFileSize(file.size_bytes)}</span>
              )}
            </div>
          </div>
          
          <a 
            href={file.file_url} 
            download
            onClick={(e) => e.stopPropagation()}
            className="ml-2 p-1.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
      ))}
    </div>
  );
};

export default PDFFileList;
