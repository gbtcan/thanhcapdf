import { useState, useEffect } from 'react';
import { 
  fetchHymnById, 
  fetchHymnPdfFiles, 
  fetchHymnAudioFiles, 
  fetchHymnVideoLinks,
  fetchHymnPresentationFiles,
  fetchRelatedHymns
} from '../api/hymnApi';
import { Hymn, HymnVideoLink } from '../types';

// Define interfaces for media file types
interface PdfFile {
  id: string;
  file_key: string;
  title?: string;
  description?: string;
  created_at?: string;
  url?: string;
  [key: string]: any;
}

interface AudioFile {
  id: string;
  pdf_id?: string;
  audio_path?: string;
  url?: string;
  description?: string;
  [key: string]: any;
}

// Using the imported HymnVideoLink type for compatibility with VideoSection component

/**
 * Hook to fetch detailed hymn information including all associated files
 */
export function useHymnDetail(hymnId: string) {
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [videoLinks, setVideoLinks] = useState<HymnVideoLink[]>([]);
  const [presentationFiles, setPresentationFiles] = useState<any[]>([]);
  const [relatedHymns, setRelatedHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when hymn ID changes
    setIsLoading(true);
    setError(null);
    setHymn(null);
    setPdfFiles([]);
    setAudioFiles([]);
    setVideoLinks([]);
    setPresentationFiles([]);
    setRelatedHymns([]);

    // Skip fetch if no hymn ID provided
    if (!hymnId) {
      setIsLoading(false);
      return;
    }

    const fetchHymnData = async () => {
      try {
        // Fetch all hymn data in parallel
        const [
          hymnData,
          pdfFilesData,
          audioFilesData,
          videoLinksData,
          presentationFilesData,
          relatedHymnsData
        ] = await Promise.all([
          fetchHymnById(hymnId),
          fetchHymnPdfFiles(hymnId),
          fetchHymnAudioFiles(hymnId),
          fetchHymnVideoLinks(hymnId),
          fetchHymnPresentationFiles(hymnId),
          fetchRelatedHymns(hymnId, 5)
        ]);

        // Update state with fetched data
        setHymn(hymnData);
        setPdfFiles(pdfFilesData || []);
        
        // Link PDFs to audio files and videos
        if (pdfFilesData && pdfFilesData.length > 0) {
          const pdfMap = new Map(pdfFilesData.map((pdf: PdfFile) => [pdf.id, pdf]));
          
          // Link PDFs to audio files
          const processedAudioFiles = (audioFilesData || []).map((audio: AudioFile) => {
            if (audio.pdf_id && pdfMap.has(audio.pdf_id)) {
              return {
                ...audio,
                linked_pdf: pdfMap.get(audio.pdf_id)
              };
            }
            return audio;
          });
          
          // Link PDFs to video links
          const processedVideoLinks = (videoLinksData || []).map((video: HymnVideoLink) => {
            if (video.pdf_id && pdfMap.has(video.pdf_id)) {
              return {
                ...video,
                linked_pdf: pdfMap.get(video.pdf_id)
              };
            }
            return video;
          });
          
          setAudioFiles(processedAudioFiles);
          setVideoLinks(processedVideoLinks);
        } else {
          setAudioFiles(audioFilesData || []);
          setVideoLinks(videoLinksData || []);
        }
        
        setPresentationFiles(presentationFilesData || []);
        setRelatedHymns(relatedHymnsData || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHymnData();
  }, [hymnId]);

  return {
    hymn,
    pdfFiles,
    audioFiles,
    videoLinks,
    presentationFiles,
    relatedHymns,
    isLoading,
    error
  };
}
