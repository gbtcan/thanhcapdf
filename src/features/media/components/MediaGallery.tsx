import React, { useState } from 'react';
import { File, Image, Music, Video, X, ChevronLeft, ChevronRight, ExternalLink, DownloadCloud } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'audio' | 'video' | 'pdf' | 'other';
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  size?: number; // in bytes
  fileType?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  initialIndex?: number;
  onClose?: () => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  initialIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  if (!items || items.length === 0) {
    return null;
  }
  
  const currentItem = items[currentIndex];
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };
  
  // Helper function to get icon based on file type
  const getIconForType = (type: MediaItem['type']) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'pdf': return <File className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };
  
  // Render the media content based on type
  const renderMediaContent = () => {
    switch (currentItem.type) {
      case 'image':
        return (
          <img
            src={currentItem.url}
            alt={currentItem.title || 'Image'}
            className="max-h-full max-w-full object-contain"
          />
        );
      case 'video':
        return (
          <video
            src={currentItem.url}
            controls
            className="max-h-full max-w-full"
            poster={currentItem.thumbnailUrl}
          />
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Music className="h-16 w-16 text-gray-400 mb-4" />
            <audio src={currentItem.url} controls className="w-full max-w-md" />
            <p className="mt-4 text-center text-gray-700 dark:text-gray-300">{currentItem.title || 'Audio file'}</p>
          </div>
        );
      case 'pdf':
        return (
          <iframe 
            src={currentItem.url} 
            title={currentItem.title || 'PDF file'} 
            className="w-full h-full"
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <File className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-gray-700 dark:text-gray-300">
              {currentItem.title || 'File not previewable'}
              <br />
              <a 
                href={currentItem.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
              >
                Open file in new tab
              </a>
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'relative w-full h-full'}`}>
      {/* Header with controls */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 flex items-center justify-between z-10">
        <div className="flex items-center">
          {getIconForType(currentItem.type)}
          <span className="ml-2 font-medium">{currentItem.title || `Item ${currentIndex + 1} of ${items.length}`}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href={currentItem.url} 
            download 
            className="p-1 hover:bg-gray-700 rounded"
            title="Download"
          >
            <DownloadCloud className="h-5 w-5" />
          </a>
          <a 
            href={currentItem.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-1 hover:bg-gray-700 rounded"
            title="Open in new tab"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-700 rounded"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="w-full h-full flex items-center justify-center">
        {renderMediaContent()}
      </div>
      
      {/* Navigation controls */}
      {items.length > 1 && (
        <>
          <button 
            onClick={goToPrevious} 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
            aria-label="Previous item"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
            aria-label="Next item"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {/* Thumbnail navigation at bottom */}
      {items.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 overflow-x-auto">
          <div className="flex space-x-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`p-1 rounded ${currentIndex === index ? 'ring-2 ring-indigo-500' : ''}`}
              >
                {item.thumbnailUrl ? (
                  <img 
                    src={item.thumbnailUrl} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                    {getIconForType(item.type)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
