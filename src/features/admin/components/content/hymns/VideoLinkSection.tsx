import React, { useState } from 'react';
import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../core/components/ui/select';
import { Textarea } from '../../../../../core/components/ui/textarea';
import { Loader2, Video, Trash, ExternalLink, FileText, Youtube } from 'lucide-react';
import { HymnVideoLink, HymnPdfFile } from '../../../types/hymns';
import { Card, CardContent } from '../../../../../core/components/ui/card';
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

interface VideoLinkSectionProps {
  videoLinks: HymnVideoLink[];
  pdfFiles: HymnPdfFile[];
  onAddVideo: (videoUrl: string, source?: string, description?: string, pdfId?: string) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  isAdding: boolean;
}

const VideoLinkSection: React.FC<VideoLinkSectionProps> = ({
  videoLinks,
  pdfFiles,
  onAddVideo,
  onDeleteVideo,
  isAdding
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPdfId, setSelectedPdfId] = useState<string>('');
  const [source, setSource] = useState<string>('youtube');
  const [videoToDelete, setVideoToDelete] = useState<HymnVideoLink | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleAdd = async () => {
    if (!videoUrl) return;
    
    try {
      await onAddVideo(
        videoUrl, 
        source || undefined,
        description || undefined,
        selectedPdfId || undefined
      );
      setVideoUrl('');
      setDescription('');
      setSelectedPdfId('');
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };
  
  const handleDeleteClick = (video: HymnVideoLink) => {
    setVideoToDelete(video);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDeleteVideo(videoToDelete.id);
      setIsDeleteDialogOpen(false);
      setVideoToDelete(null);
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Function to embed YouTube video - creates a URL for iframe embedding
  const getEmbedUrl = (videoUrl: string, source?: string): string => {
    if (source === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Extract YouTube video ID
      let videoId = '';
      
      if (videoUrl.includes('youtube.com/watch')) {
        const url = new URL(videoUrl);
        videoId = url.searchParams.get('v') || '';
      } else if (videoUrl.includes('youtu.be/')) {
        const parts = videoUrl.split('youtu.be/');
        if (parts.length > 1) {
          videoId = parts[1].split('?')[0];
        }
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    return videoUrl;
  };
  
  return (
    <div className="space-y-6">
      {/* Add video section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Thêm video</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="videoUrl" className="text-sm font-medium">
              Đường dẫn video
            </label>
            <Input
              id="videoUrl"
              placeholder="Nhập đường dẫn video từ YouTube..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="source" className="text-sm font-medium">
              Nguồn
            </label>
            <Select 
              value={source} 
              onValueChange={setSource}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="Chọn nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
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
              placeholder="Nhập mô tả về video này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleAdd}
            disabled={!videoUrl || isAdding}
          >
            {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Thêm video
          </Button>
        </div>
      </div>
      
      {/* List of video links */}
      {videoLinks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {videoLinks.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center space-x-2">
                  <Video className="h-6 w-6 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {video.source === 'youtube' ? 'YouTube Video' : 
                       video.source === 'facebook' ? 'Facebook Video' : 'Video'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {video.video_url}
                    </p>
                  </div>
                </div>
                
                {/* Video Embed */}
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getEmbedUrl(video.video_url, video.source)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full border-0"
                    style={{ aspectRatio: '16/9' }}
                  ></iframe>
                </div>
                
                {/* Description and linked PDF */}
                <div className="px-3 py-2 text-sm border-t border-gray-100 dark:border-gray-700">
                  {video.linked_pdf && (
                    <div className="flex items-center mb-1 text-xs text-blue-600 dark:text-blue-400">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>
                        Liên kết với: {video.linked_pdf.file_name}
                      </span>
                    </div>
                  )}
                  
                  {video.description && (
                    <div className="text-gray-700 dark:text-gray-300">
                      {video.description}
                    </div>
                  )}
                </div>
                
                <div className="p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bởi: {video.uploader?.name || 'Không xác định'}
                  </div>
                  
                  <div className="flex space-x-1">
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      title="Mở liên kết"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteClick(video)}
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      title="Xóa video"
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
          <Youtube className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Chưa có video nào được thêm vào
          </p>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa liên kết video này? Hành động này không thể hoàn tác.
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

export default VideoLinkSection;
