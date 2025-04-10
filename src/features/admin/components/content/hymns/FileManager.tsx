import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../core/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../core/components/ui/card';
import { HymnPdfFile, HymnAudioFile, HymnVideoLink, HymnPresentationFile } from '../../../types/hymns';
import PdfFileSection from './PdfFileSection';
import AudioFileSection from './AudioFileSection';
import VideoLinkSection from './VideoLinkSection';
import PresentationFileSection from './PresentationFileSection';
import { FileText, Music, Video, Presentation } from 'lucide-react';

interface FileManagerProps {
  hymnId: string;
  pdfFiles: HymnPdfFile[];
  audioFiles: HymnAudioFile[];
  videoLinks: HymnVideoLink[];
  presentationFiles: HymnPresentationFile[];
  
  // Upload handlers
  onUploadPdf: (file: File, description?: string) => Promise<void>;
  onUploadAudio: (file: File, description?: string, pdfId?: string) => Promise<void>;
  onAddVideo: (videoUrl: string, source?: string, description?: string, pdfId?: string) => Promise<void>;
  onUploadPresentation: (file: File, description?: string, source?: string) => Promise<void>;
  
  // Delete handlers
  onDeletePdf: (id: string, filePath: string) => Promise<void>;
  onDeleteAudio: (id: string, filePath: string) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  onDeletePresentation: (id: string) => Promise<void>;
  
  // Loading states
  isUploadingPdf: boolean;
  isUploadingAudio: boolean;
  isAddingVideo: boolean;
  isUploadingPresentation: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({
  hymnId,
  pdfFiles,
  audioFiles,
  videoLinks,
  presentationFiles,
  onUploadPdf,
  onUploadAudio,
  onAddVideo,
  onUploadPresentation,
  onDeletePdf,
  onDeleteAudio,
  onDeleteVideo,
  onDeletePresentation,
  isUploadingPdf,
  isUploadingAudio,
  isAddingVideo,
  isUploadingPresentation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Quản lý file thánh ca</CardTitle>
        <CardDescription>
          Quản lý các file PDF, audio, video và trình chiếu của thánh ca
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pdf" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="pdf" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              PDF ({pdfFiles.length})
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center">
              <Music className="h-4 w-4 mr-2" />
              Audio ({audioFiles.length})
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Video ({videoLinks.length})
            </TabsTrigger>
            <TabsTrigger value="presentation" className="flex items-center">
              <Presentation className="h-4 w-4 mr-2" />
              Trình chiếu ({presentationFiles.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pdf">
            <PdfFileSection
              pdfFiles={pdfFiles}
              onUploadPdf={onUploadPdf}
              onDeletePdf={onDeletePdf}
              isUploading={isUploadingPdf}
            />
          </TabsContent>
          
          <TabsContent value="audio">
            <AudioFileSection
              audioFiles={audioFiles}
              pdfFiles={pdfFiles}
              onUploadAudio={onUploadAudio}
              onDeleteAudio={onDeleteAudio}
              isUploading={isUploadingAudio}
            />
          </TabsContent>
          
          <TabsContent value="video">
            <VideoLinkSection
              videoLinks={videoLinks}
              pdfFiles={pdfFiles}
              onAddVideo={onAddVideo}
              onDeleteVideo={onDeleteVideo}
              isAdding={isAddingVideo}
            />
          </TabsContent>
          
          <TabsContent value="presentation">
            <PresentationFileSection
              presentationFiles={presentationFiles}
              onUploadPresentation={onUploadPresentation}
              onDeletePresentation={onDeletePresentation}
              isUploading={isUploadingPresentation}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FileManager;
