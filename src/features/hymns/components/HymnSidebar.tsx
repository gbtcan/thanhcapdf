import React from 'react';
import { FileText, Music, Video, Presentation, Check, Calendar, Clock, Eye } from 'lucide-react';
import { HymnWithRelations } from '../types';
import { formatDate } from '../../../utils/formatters';

interface HymnSidebarProps {
  hymn: HymnWithRelations;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePdfIndex: number;
  setActivePdfIndex: (index: number) => void;
  hasContent: {
    lyrics: boolean;
    score: boolean;
    audio: boolean;
    video: boolean;
    presentation: boolean;
  };
}

const HymnSidebar: React.FC<HymnSidebarProps> = ({
  hymn,
  activeTab,
  setActiveTab,
  activePdfIndex,
  setActivePdfIndex,
  hasContent
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Nội dung bài hát</h3>
        
        <nav className="flex flex-col space-y-1">
          {hasContent.score && (
            <button
              onClick={() => setActiveTab('score')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                activeTab === 'score' 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span>Sheet nhạc</span>
              </div>
              {hymn.pdf_files && (
                <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                  {hymn.pdf_files.length}
                </span>
              )}
            </button>
          )}
          
          {hasContent.lyrics && (
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                activeTab === 'lyrics' 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              <span>Lời bài hát</span>
            </button>
          )}

          {hasContent.audio && (
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                activeTab === 'audio' 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <Music className="h-4 w-4 mr-2" />
                <span>Âm thanh</span>
              </div>
              <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {hymn.audio_files?.length || 0}
              </span>
            </button>
          )}

          {hasContent.video && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                activeTab === 'video' 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                <span>Video</span>
              </div>
              <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {hymn.video_links?.length || 0}
              </span>
            </button>
          )}

          {hasContent.presentation && (
            <button
              onClick={() => setActiveTab('presentation')}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                activeTab === 'presentation' 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <Presentation className="h-4 w-4 mr-2" />
                <span>Trình chiếu</span>
              </div>
              <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {hymn.presentation_files?.length || 0}
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* PDF versions list */}
      {activeTab === 'score' && hasContent.score && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Phiên bản PDF</h3>
            
            <div className="space-y-1">
              {hymn.pdf_files?.map((pdf, index) => (
                <button
                  key={pdf.id}
                  onClick={() => setActivePdfIndex(index)}
                  className={`w-full text-left px-3 py-2 flex items-start rounded-md ${
                    index === activePdfIndex 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={`text-sm font-medium truncate ${
                      index === activePdfIndex 
                        ? 'text-indigo-700 dark:text-indigo-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {pdf.description || `Phiên bản ${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(pdf.created_at)}
                    </p>
                  </div>
                  {index === activePdfIndex && (
                    <span className="inline-flex items-center justify-center flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 h-5 w-5">
                      <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-300" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hymn info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>Ngày tạo: {formatDate(hymn.created_at)}</span>
          </div>
          
          {hymn.updated_at && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>Cập nhật: {formatDate(hymn.updated_at)}</span>
            </div>
          )}
          
          {hymn.view_count !== undefined && (
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1.5" />
              <span>Lượt xem: {hymn.view_count}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HymnSidebar;
