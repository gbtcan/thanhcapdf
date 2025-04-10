import React, { useState } from 'react';
import { FileInput } from '../../../../../core/components/ui/file-input';
import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../core/components/ui/select';
import { Textarea } from '../../../../../core/components/ui/textarea';
import { Loader2, Music, Trash, ExternalLink, Download, FileText } from 'lucide-react';
import { HymnAudioFile, HymnPdfFile } from '../../../types/hymns';
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

interface AudioFileSectionProps {
  audioFiles: HymnAudioFile[];
  pdfFiles: HymnPdfFile[];
  onUploadAudio: (file: File, description?: string, pdfId?: string) => Promise<void>;
  onDeleteAudio: (id: string, filePath: string) => Promise<void>;
  isUploading: boolean;
}

const AudioFileSection: React.FC<AudioFileSectionProps> = ({
  audioFiles,
  pdfFiles,
  onUploadAudio,
  onDeleteAudio,
  isUploading
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [selectedPdfId, setSelectedPdfId] = useState<string>('');
  const [fileToDelete, setFileToDelete] = useState<HymnAudioFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await onUploadAudio(
        selectedFiles[0], 
        description || undefined,
        selectedPdfId || undefined
      );
      setSelectedFiles([]);
      setDescription('');
      setSelectedPdfId('');
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };
  
  const handleDeleteClick = (file: HymnAudioFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteAudio(fileToDelete.id, fileToDelete.audio_path);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Error deleting audio:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Upload section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Thêm file audio</h3>
        
        <FileInput
          accept=".mp3,.wav,.ogg,.flac,.m4a"
          multiple={false}
          onFilesSelected={handleFilesSelected}
          value={selectedFiles}
          maxSize={50 * 1024 * 1024} // 50MB max
        />
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pdfFile" className="text-sm font-medium">
              Liên kết với file PDF (không bắt buộc)
            </label>
            <Select 
              value={selectedPdfId} 
              onValueChange={setSelectedPdfId}
            >
              <SelectTrigger id="pdfFile">
                <SelectValue placeholder="Chọn file PDF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Không liên kết PDF</SelectItem>
                {pdfFiles.map((pdf) => (
                  <SelectItem key={pdf.id} value={pdf.id}>
                    {pdf.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Mô tả (không bắt buộc)
            </label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả về file audio này..."
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
      
      {/* List of audio files */}
      {audioFiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audioFiles.map((audioFile) => (
            <Card key={audioFile.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center space-x-2">
                  <Music className="h-6 w-6 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{audioFile.file_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {audioFile.size ? formatBytes(audioFile.size) : 'Kích thước không xác định'}
                    </p>
                  </div>
                </div>
                
                {/* Audio Player */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                  <audio controls className="w-full" src={audioFile.url}>
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                </div>
                
                {/* Description and linked PDF */}
                <div className="px-3 py-2 text-sm border-t border-gray-100 dark:border-gray-700">
                  {audioFile.linked_pdf && (
                    <div className="flex items-center mb-1 text-xs text-blue-600 dark:text-blue-400">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>
                        Liên kết với: {audioFile.linked_pdf.file_name}
                      </span>
                    </div>
                  )}
                  
                  {audioFile.description && (
                    <div className="text-gray-700 dark:text-gray-300">
                      {audioFile.description}
                    </div>
                  )}
                </div>
                
                <div className="p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bởi: {audioFile.uploader?.name || 'Không xác định'}
                  </div>
                  
                  <div className="flex space-x-1">
                    <a
                      href={audioFile.url}
                      download
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(audioFile)}
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      title="Xóa audio"
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
          <Music className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Chưa có file audio nào được tải lên
          </p>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file audio này? Hành động này không thể hoàn tác.
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

export default AudioFileSection;
