import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '../../../core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../core/components/ui/tabs';
import { Button } from '../../../core/components/ui/button';
import { HymnVideoLink } from '../types';
import { Video, ExternalLink, FileText } from 'lucide-react';

interface VideoSectionProps {
  videoLinks: HymnVideoLink[];
}

const VideoSection: React.FC<VideoSectionProps> = ({ videoLinks }) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videoLinks[0]?.id || '');
  
  const selectedVideo = videoLinks.find(video => video.id === selectedVideoId) || videoLinks[0];
  
  if (videoLinks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Video className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500">Không có video nào cho thánh ca này.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Function to get embed URL for the video
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
    } else if (source === 'facebook' || videoUrl.includes('facebook.com')) {
      // For Facebook videos (simplified - would need FB SDK in a real implementation)
      return videoUrl;
    }
    
    return videoUrl;
  };
  
  return (
    <div className="space-y-4">
      {/* Video selector */}
      {videoLinks.length > 1 && (
        <Tabs 
          value={selectedVideoId} 
          onValueChange={setSelectedVideoId}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Chọn video:</h3>
            <TabsList>
              {videoLinks.map((video, index) => (
                <TabsTrigger key={video.id} value={video.id}>
                  {video.description || `Video ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      )}
      
      {/* Video player */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedVideo.description || 
             `Video ${selectedVideo.source ? `(${selectedVideo.source})` : ''}`}
          </CardTitle>
          <CardDescription>
            {/* Link to PDF if available */}
            {selectedVideo.linked_pdf && (
              <div className="mt-1 flex items-center">
                <FileText className="h-4 w-4 mr-1 text-blue-500" />
                <a 
                  href={selectedVideo.linked_pdf.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Xem PDF kèm theo
                </a>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0 aspect-video">
          <iframe
            src={getEmbedUrl(selectedVideo.video_url, selectedVideo.source)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedVideo.description || 'Video thánh ca'}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between items-center p-4 bg-muted/20">
          <p className="text-sm text-muted-foreground">
            {selectedVideo.uploader && `Đăng bởi: ${selectedVideo.uploader.name}`}
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href={selectedVideo.video_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Xem trên {selectedVideo.source || 'trang gốc'}
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VideoSection;
