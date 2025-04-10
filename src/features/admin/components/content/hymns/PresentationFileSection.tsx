import React, { useState } from 'react';
import { FileInput } from '../../../../../core/components/ui/file-input';
import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../core/components/ui/select';
import { Textarea } from '../../../../../core/components/ui/textarea';
import { Loader2, Presentation, Trash, ExternalLink, Download } from 'lucide-react';
import { HymnPresentationFile } from '../../../types/hymns';
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

interface PresentationFileSectionProps {
  presentationFiles: HymnPresentationFile[];
  onUploadPresentation: (file: File, description?: string, source?: string) => Promise<void>;
  onDeletePresentation: (id: string) => Promise<void>;
  isUploading: boolean;
}

const PresentationFileSection: React.FC<PresentationFileSectionProps> = ({
  presentationFiles,
  onUploadPresentation,
  onDeletePresentation,
  isUploading
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [fileToDelete, setFileToDelete] = useState<HymnPresentationFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await onUploadPresentation(
        selectedFiles[0], 
        description || undefined,
        source || undefined
      );
      setSelectedFiles([]);
      setDescription('');
      setSource('');
    } catch (error) {
      console.error('Error uploading presentation:', error);
    }
  };
  
  const handleDeleteClick = (file: HymnPresentationFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeletePresentation(fileToDelete.id);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Error deleting presentation:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Upload section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Thêm file trình chiếu</h3>
        
        <FileInput
          accept=".ppt,.pptx,.pdf,.key"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          value={selectedFiles}
          maxSize={100 * 1024 * 1024} // 100MB max
        />
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="source" className="text-sm font-medium">
              Nguồn (không bắt buộc)
            </label>
            <Input
              id="source"
              placeholder="Nguồn của file trình chiếu này..."
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả (không bắt buộc)
            </label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả về file trình chiếu này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
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
      
      {/* List of presentation files */}
      {presentationFiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presentationFiles.map((presentationFile) => (
            <Card key={presentationFile.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center space-x-2">
                  <Presentation className="h-6 w-6 text-purple-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{presentationFile.file_name}</p>
                    {presentationFile.source && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Nguồn: {presentationFile.source}
                      </p>
                    )}
                  </div>
                </div>
                
                {presentationFile.description && (
                  <div className="p-3 text-sm border-t border-gray-100 dark:border-gray-700">
                    {presentationFile.description}
                  </div>
                )}
                
                <div className="p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bởi: {presentationFile.uploader?.name || 'Không xác định'}
                  </div>
                  
                  <div className="flex space-x-1">
                    <a
                      href={presentationFile.presentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      title="Xem trình chiếu"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={presentationFile.presentation_url}
                      download
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(presentationFile)}
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      title="Xóa file trình chiếu"
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
          <Presentation className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Chưa có file trình chiếu nào được tải lên
          </p>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file trình chiếu này? Hành động này không thể hoàn tác.
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

export default PresentationFileSection;
