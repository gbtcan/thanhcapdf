import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  light?: string | boolean; // thumbnail URL or true to use preview from original URL
  width?: string | number;
  height?: string | number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  title = '', 
  light = false, 
  width = '100%', 
  height = '100%' 
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle errors from ReactPlayer
  const handleError = (e: Error) => {
    console.error('Video playback error:', e);
    setError(e);
    setIsLoading(false);
  };
  
  // Handle start of playback
  const handleStart = () => {
    setIsLoading(false);
    setError(null);
  };
  
  // Handle ready state
  const handleReady = () => {
    setIsLoading(false);
  };
  
  // Handle buffering state
  const handleBuffer = () => {
    setIsLoading(true);
  };
  
  // Handle buffer end
  const handleBufferEnd = () => {
    setIsLoading(false);
  };
  
  // Try to reload video on error
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
  };
  
  return (
    <div className="relative w-full h-full">
      {/* If we have an error, show error UI */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-850 z-10">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400 text-center mx-4 mb-4">
            Không thể tải video. Đảm bảo bạn có kết nối mạng ổn định và thử lại.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </button>
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-850 bg-opacity-70 dark:bg-opacity-70 z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Đang tải video...</p>
          </div>
        </div>
      )}
      
      {/* The actual video player */}
      <ReactPlayer
        url={url}
        width={width}
        height={height}
        controls={true}
        light={light}
        playsinline
        onError={handleError}
        onStart={handleStart}
        onReady={handleReady}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0
            }
          },
          vimeo: {
            playerOptions: {
              title: false,
              byline: false,
              portrait: false
            }
          },
          file: {
            attributes: {
              controlsList: 'nodownload', // prevent downloads
              preload: 'metadata'
            }
          }
        }}
      />
      
      {/* Accessible label if title is provided */}
      {title && <span className="sr-only">{title}</span>}
    </div>
  );
};

export default VideoPlayer;
