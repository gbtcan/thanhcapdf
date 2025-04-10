import React, { useState } from 'react';
import { FileInput } from '../../../../../core/components/ui/file-input';
import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { Textarea } from '../../../../../core/components/ui/textarea';
import { Loader2, FileText, Trash, ExternalLink, Download } from 'lucide-react';
import { HymnPdfFile } from '../../../types/hymns';
import { Card, CardContent } from '../../../../../core/components/ui/card';
import { formatBytes } from '../../../../../lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../../core/components/ui/alert-dialog';

interface PdfFileSectionProps {
  pdfFiles: HymnPdfFile[];
  onUploadPdf: (file: File, description?: string) => Promise<void>;
  onDeletePdf: (id: string, filePath: string) => Promise<void>;
  isUploading: boolean;
}

const PdfFileSection: React.FC<PdfFileSectionProps> = ({
  pdfFiles,
  onUploadPdf,
  onDeletePdf,
  isUploading
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [fileToDelete, setFileToDelete] = useState<HymnPdfFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await onUploadPdf(selectedFiles[0], description || undefined);
      setSelectedFiles([]);
      setDescription('');
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };
  
  const handleDeleteClick = (file: HymnPdfFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeletePdf(fileToDelete.id, fileToDelete.pdf_path);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Error deleting PDF:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Upload section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Thêm file PDF</h3>
        
        <FileInput
          accept=".pdf"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          value={selectedFiles}
          maxSize={15 * 1024 * 1024} // 15MB max
        />
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Mô tả (không bắt buộc)
          </label>
          <Textarea
            id="description"
            placeholder="Nhập mô tả về file PDF này..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Tải lên
          </Button>
        </div>
      </div>
      
      {/* List of PDF files */}
      {pdfFiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pdfFiles.map((pdfFile) => (
            <Card key={pdfFile.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pdfFile.file_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pdfFile.size ? formatBytes(pdfFile.size) : 'Kích thước không xác định'}
                    </p>
                  </div>
                </div>
                
                {pdfFile.description && (
                  <div className="p-3 text-sm border-t border-gray-100 dark:border-gray-700">
                    {pdfFile.description}
                  </div>
                )}
                
                <div className="p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bởi: {pdfFile.uploader?.name || 'Không xác định'}
                  </div>
                  
                  <div className="flex space-x-1">
                    <a
                      href={pdfFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      title="Xem PDF"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={pdfFile.url}
                      download
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(pdfFile)}
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      title="Xóa PDF"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Chưa có file PDF nào được tải lên
          </p>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file PDF này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PdfFileSection;
