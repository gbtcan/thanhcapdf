import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHymnDetail } from "../hooks/useHymnDetail";
// Fix the incorrect import path by adding 'core' directory
import { useAuth } from "../../../core/contexts/AuthContext";
import { Loader2, FileText, Music, Video, Presentation, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../core/components/ui/tabs";
import HymnDetailHeader from './HymnDetailHeader';
import LyricsSection from './LyricsSection';
import MultiPDFViewerSection from './MultiPDFViewerSection';
import AudioSection from './AudioSection';
import VideoSection from './VideoSection';
import PresentationSection from './PresentationSection';
import RelatedHymns from './RelatedHymns';
import { Button } from '../../../core/components/ui/button';
import { incrementHymnView } from '../api/hymnApi';

// Define proper interfaces for the data types
interface Author {
  id: string;
  name: string;
}

interface Theme {
  id: string;
  name: string;
}

// Extended Hymn interface that includes all required properties
interface HymnWithDetails {
  id: string;
  title: string;
  lyrics?: string;
  subtitle?: string;
  number?: number;
  authors?: Author[];
  themes?: Theme[];
  view_count?: number;
}

const HymnDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    hymn, 
    pdfFiles, 
    audioFiles, 
    videoLinks, 
    presentationFiles,
    isLoading, 
    error,
    relatedHymns,
  } = useHymnDetail(id || '');
  
  // Cast hymn to our extended type to fix TypeScript errors
  const hymnWithDetails = hymn as unknown as HymnWithDetails;
  
  // Track view count when component mounts
  useEffect(() => {
    if (id && !isLoading && hymn) {
      // Call API to increment view count
      incrementHymnView(id, user?.id);
    }
  }, [id, hymn, user?.id, isLoading]);
  
  // Determine if media tabs should be shown
  const hasPdfFiles = pdfFiles && pdfFiles.length > 0;
  const hasAudioFiles = audioFiles && audioFiles.length > 0;
  const hasVideoLinks = videoLinks && videoLinks.length > 0;
  const hasPresentationFiles = presentationFiles && presentationFiles.length > 0;
  
  // Show a loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Handle error state
  if (error || !hymn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Không thể tìm thấy thánh ca</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          Thánh ca này không tồn tại hoặc đã bị gỡ xuống. Vui lòng kiểm tra lại đường dẫn.
        </p>
        <Button onClick={() => navigate('/hymns')}>
          Quay lại danh sách thánh ca
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hymn header with title, author, view count */}
          <HymnDetailHeader 
            title={hymnWithDetails.title}
            subtitle={hymnWithDetails.subtitle}
            number={hymnWithDetails.number}
            authors={hymnWithDetails.authors}
            themes={hymnWithDetails.themes}
          />
          
          {/* Media tabs */}
          <Tabs defaultValue={hasPdfFiles ? "pdf" : hasAudioFiles ? "audio" : hasVideoLinks ? "video" : "lyrics"}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="lyrics" className="text-sm">Lời bài hát</TabsTrigger>
              {hasPdfFiles && (
                <TabsTrigger value="pdf" className="flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-1" /> PDF
                </TabsTrigger>
              )}
              {hasAudioFiles && (
                <TabsTrigger value="audio" className="flex items-center text-sm">
                  <Music className="w-4 h-4 mr-1" /> Audio
                </TabsTrigger>
              )}
              {hasVideoLinks && (
                <TabsTrigger value="video" className="flex items-center text-sm">
                  <Video className="w-4 h-4 mr-1" /> Video
                </TabsTrigger>
              )}
              {hasPresentationFiles && (
                <TabsTrigger value="presentation" className="flex items-center text-sm">
                  <Presentation className="w-4 h-4 mr-1" /> Trình chiếu
                </TabsTrigger>
              )}
            </TabsList>
            
            {/* Tab content */}
            <TabsContent value="lyrics" className="mt-4">
              <LyricsSection lyrics={hymnWithDetails.lyrics || ''} />
            </TabsContent>
            
            {hasPdfFiles && (
              <TabsContent value="pdf" className="mt-4">
                <MultiPDFViewerSection pdfFiles={pdfFiles} />
              </TabsContent>
            )}
            
            {hasAudioFiles && (
              <TabsContent value="audio" className="mt-4">
                <AudioSection hymnId={hymnWithDetails.id} />
              </TabsContent>
            )}
            
            {hasVideoLinks && (
              <TabsContent value="video" className="mt-4">
                <VideoSection videoLinks={videoLinks} />
              </TabsContent>
            )}
            
            {hasPresentationFiles && (
              <TabsContent value="presentation" className="mt-4">
                <PresentationSection presentationFiles={presentationFiles} />
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div>
            {/* Pass the proper props to RelatedHymns component */}
            {relatedHymns.length > 0 && (
              <RelatedHymns 
                currentHymnId={hymnWithDetails.id} 
                themeIds={hymnWithDetails.themes?.map((t: Theme) => t.id)} 
                authorIds={hymnWithDetails.authors?.map((a: Author) => a.id)} 
              />
            )}
          </div>
      </div>
    </div>
  );
};

export default HymnDetailView;
