import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../core/components/ui/tabs';
import { Music, FileText, Info, Headphones, Video } from 'lucide-react';
import { HymnWithRelations } from '../types';

interface HymnPageTabsProps {
  hymn: HymnWithRelations;
  activeTab: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const HymnPageTabs: React.FC<HymnPageTabsProps> = ({
  hymn,
  activeTab,
  onChange,
  children
}) => {
  // Determine which tabs should be displayed based on available content
  const hasScore = !!hymn.sheet_music_key;
  const hasLyrics = !!hymn.lyrics?.trim();
  const hasDescription = !!hymn.description?.trim();
  const hasAudio = Array.isArray(hymn.audio_tracks) && hymn.audio_tracks.length > 0;
  
  return (
    <Tabs value={activeTab} onValueChange={onChange} className="w-full">
      {/* Tab list */}
      <TabsList className="grid grid-cols-4 h-14 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-t-lg rounded-b-none">
        {hasScore && (
          <TabsTrigger 
            value="score" 
            className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-indigo-500"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Bản nhạc</span>
          </TabsTrigger>
        )}
        
        {hasLyrics && (
          <TabsTrigger 
            value="lyrics" 
            className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-indigo-500"
          >
            <Music className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Lời bài hát</span>
          </TabsTrigger>
        )}
        
        {hasAudio && (
          <TabsTrigger 
            value="audio" 
            className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-indigo-500"
          >
            <Headphones className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Âm thanh</span>
          </TabsTrigger>
        )}
        
        <TabsTrigger 
          value="info" 
          className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-indigo-500"
        >
          <Info className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Thông tin</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Content is passed as children */}
      {children}
    </Tabs>
  );
};

export default HymnPageTabs;
