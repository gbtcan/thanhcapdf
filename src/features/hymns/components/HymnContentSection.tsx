import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';
import { Download } from 'lucide-react';
import { HymnWithRelations } from '../types';
import PDFViewer from './PDFViewer';
import { normalizePdfPath, downloadPdf } from '../utils/pdfAccess';
import LyricsSection from './LyricsSection';
import AudioSection from './AudioSection';
import VideoSection from './VideoSection';
import PresentationSection from './PresentationSection';

interface HymnContentSectionProps {
  hymn: HymnWithRelations;
  activeTab: string;
  activePdfIndex: number;
}

/**
 * Content section that displays different content based on active tab
 */
const HymnContentSection: React.FC<HymnContentSectionProps> = ({ 
  hymn,
  activeTab,
  activePdfIndex 
}) => {
  // Early exit if hymn doesn't exist
  if (!hymn) return null;
  
  // Ensure arrays exist to prevent errors
  const pdfFiles = hymn.pdf_files || [];
  const audioFiles = hymn.audio_files || [];
  const videoLinks = hymn.video_links || [];
  const presentationFiles = hymn.presentation_files || [];
  
  // Check if there's content for the active tab
  const hasContent = {
    lyrics: !!hymn.lyrics?.trim(),
    score: pdfFiles.length > 0,
    audio: audioFiles.length > 0,
    video: videoLinks.length > 0,
    presentation: presentationFiles.length > 0
  };
  
  // Fallback in case the active PDF no longer exists
  const safeActivePdfIndex = activePdfIndex < pdfFiles.length 
    ? activePdfIndex 
    : 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Score (PDF) Tab */}
      {activeTab === 'score' && hasContent.score && (
        <div>
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {pdfFiles[safeActivePdfIndex]?.description || `Sheet nhạc - Phiên bản ${safeActivePdfIndex + 1}`}
            </h2>
            <button
              onClick={() => downloadPdf(
                normalizePdfPath(pdfFiles[safeActivePdfIndex].pdf_path),
                pdfFiles[safeActivePdfIndex].description || `${hymn.title}.pdf`
              )}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Tải PDF
            </button>
          </div>
          
          <div className="p-6">
            {pdfFiles[safeActivePdfIndex] && (
              <PDFViewer 
                pdfPath={normalizePdfPath(pdfFiles[safeActivePdfIndex].pdf_path)}
                description={pdfFiles[safeActivePdfIndex].description || `PDF cho ${hymn.title}`}
                height={700}
                showControls={false}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Lyrics Tab */}
      {activeTab === 'lyrics' && (
        <LyricsSection lyrics={hymn.lyrics} />
      )}
      
      {/* Audio Tab */}
      {activeTab === 'audio' && hasContent.audio && (
        <AudioSection audioFiles={audioFiles} />
      )}
      
      {/* Video Tab */}
      {activeTab === 'video' && hasContent.video && (
        <VideoSection videoLinks={videoLinks} />
      )}
      
      {/* Presentation Tab */}
      {activeTab === 'presentation' && hasContent.presentation && (
        <PresentationSection presentationFiles={presentationFiles} />
      )}
    </div>
  );
};

export default HymnContentSection;
