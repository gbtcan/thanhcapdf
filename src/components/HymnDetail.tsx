import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, ArrowLeft, FileText, Music, Video, Share2, Download, Star, Eye, Calendar, MessageSquare, Tag
} from 'lucide-react';
import { fetchHymnById } from '../lib/hymnService';
import LoadingIndicator from './LoadingIndicator';
import AlertBanner from './AlertBanner';
import TabNavigation from './TabNavigation';
import DirectPDFViewer from './pdf/DirectPDFViewer';
import HymnPlayer from './HymnPlayer';
import ShareButton from './ShareButton';
import RelatedHymnPosts from './forum/RelatedHymnPosts';
import { formatDate, formatLyrics } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HymnDetail: React.FC = () => {
  const { id: hymnId } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('lyrics');
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);

  // Fetch hymn data
  const { data: hymn, isLoading, error } = useQuery({
    queryKey: ['hymn', hymnId],
    queryFn: () => fetchHymnById(hymnId),
    enabled: !!hymnId,
  });

  // Handle PDF file select
  const handleSelectPdf = (index: number) => {
    setSelectedPdfIndex(index);
    setActiveTab('sheet-music');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="large" message="Loading hymn details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner
          type="error"
          title="Error loading hymn"
          message="There was a problem loading the hymn. Please try again later."
        />
      </div>
    );
  }

  if (!hymn) {
    return (
      <div className="p-6">
        <AlertBanner
          type="warning"
          title="Hymn not found"
          message="The hymn you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  const currentPdf = hymn.pdf_files && hymn.pdf_files.length > selectedPdfIndex 
    ? hymn.pdf_files[selectedPdfIndex] 
    : null;

  const tabs = [
    { id: 'lyrics', label: 'Lyrics', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    ...(hymn.pdf_files && hymn.pdf_files.length > 0 
      ? [{ id: 'sheet-music', label: 'Sheet Music', icon: <FileText className="h-4 w-4 mr-2" /> }] 
      : []),
    ...(hymn.audio_files && hymn.audio_files.length > 0 
      ? [{ id: 'audio', label: 'Audio', icon: <Music className="h-4 w-4 mr-2" /> }] 
      : []),
    ...(hymn.video_links && hymn.video_links.length > 0 
      ? [{ id: 'video', label: 'Video', icon: <Video className="h-4 w-4 mr-2" /> }] 
      : []),
    { id: 'discussion', label: 'Discussion', icon: <MessageSquare className="h-4 w-4 mr-2" /> }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/hymns" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to hymns
        </Link>
      </div>

      {/* Hymn header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{hymn.title}</h1>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          {hymn.authors?.length > 0 && (
            <div className="flex items-center">
              <span className="font-medium mr-1">By:</span>
              {hymn.authors.map((author, index) => (
                <span key={author.id}>
                  {author.name}{index < hymn.authors.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
          
          {hymn.created_at && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(hymn.created_at)}</span>
            </div>
          )}
          
          {hymn.view_count !== undefined && (
            <div className="flex items-center ml-auto">
              <Eye className="h-4 w-4 mr-1" />
              <span>{hymn.view_count} views</span>
            </div>
          )}
        </div>
        
        {/* Theme tags */}
        {hymn.themes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hymn.themes.map(theme => (
              <Link
                key={theme.id}
                to={`/hymns?themeId=${theme.id}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40"
              >
                <Tag className="h-3.5 w-3.5 mr-1" />
                {theme.name}
              </Link>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {hymn.pdf_files && hymn.pdf_files.length > 0 && (
            <a
              href={hymn.pdf_files[0].file_url}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download PDF
            </a>
          )}
          
          <ShareButton
            title={hymn.title}
            text={`${hymn.title} - Catholic Hymns Library`}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </ShareButton>
          
          {isAuthenticated && (
            <button className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              <Star className="h-4 w-4 mr-1.5" />
              Favorite
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-6"
      />
      
      {/* Tab content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        {/* Lyrics tab */}
        {activeTab === 'lyrics' && (
          <div className="prose dark:prose-invert max-w-none">
            <div
              className="hymn-lyrics"
              dangerouslySetInnerHTML={{ __html: formatLyrics(hymn.lyrics || '') }}
            />
            
            {(!hymn.lyrics || hymn.lyrics.trim() === '') && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No lyrics available for this hymn.</p>
                {hymn.pdf_files && hymn.pdf_files.length > 0 && (
                  <button 
                    onClick={() => setActiveTab('sheet-music')}
                    className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View sheet music instead
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Sheet music tab */}
        {activeTab === 'sheet-music' && (
          <div>
            {hymn.pdf_files && hymn.pdf_files.length > 0 ? (
              <div>
                {/* PDF selection if multiple files */}
                {hymn.pdf_files.length > 1 && (
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                    {hymn.pdf_files.map((pdf, index) => (
                      <button
                        key={pdf.id}
                        onClick={() => setSelectedPdfIndex(index)}
                        className={`px-3 py-1.5 text-sm rounded-md flex items-center whitespace-nowrap ${
                          selectedPdfIndex === index
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <FileText className="h-4 w-4 mr-1.5" />
                        {pdf.description || `File ${index + 1}`}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* PDF viewer */}
                {currentPdf && (
                  <DirectPDFViewer 
                    url={currentPdf.file_url} 
                    title={hymn.title}
                    height={600}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No sheet music available for this hymn.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Audio tab */}
        {activeTab === 'audio' && (
          <div>
            {hymn.audio_files && hymn.audio_files.length > 0 ? (
              <HymnPlayer
                audioFiles={hymn.audio_files}
                title={hymn.title}
              />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Music className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No audio recordings available for this hymn.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Video tab */}
        {activeTab === 'video' && (
          <div>
            {hymn.video_links && hymn.video_links.length > 0 ? (
              <div className="space-y-6">
                {hymn.video_links.map((video) => (
                  <div key={video.id} className="relative">
                    <h3 className="text-lg font-medium mb-2">{video.description || 'Video recording'}</h3>
                    <div className="relative pb-[56.25%] h-0">
                      <iframe
                        src={video.video_url.replace('watch?v=', 'embed/')}
                        title={`${hymn.title} - Video`}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Source: {video.source || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No video recordings available for this hymn.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Discussion tab */}
        {activeTab === 'discussion' && (
          <div>
            <RelatedHymnPosts hymnId={hymn.id!} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HymnDetail;