import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw, AlertTriangle } from 'lucide-react';

interface PresentationViewerProps {
  slides: string[]; // Array of image URLs for presentation slides
  initialSlide?: number;
  title?: string;
  onClose?: () => void;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({
  slides,
  initialSlide = 0,
  title,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reset loading state when changing slides
  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [currentSlide]);
  
  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 dark:text-gray-300">Không có slide nào để hiển thị</p>
        </div>
      </div>
    );
  }
  
  // Navigation functions
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setScale(1);
      setRotation(0);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setScale(1);
      setRotation(0);
    }
  };
  
  // Zoom functions
  const zoomIn = () => {
    setScale(Math.min(scale + 0.25, 3));
  };
  
  const zoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };
  
  // Rotation function
  const rotate = () => {
    setRotation((rotation + 90) % 360);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === '+') {
        zoomIn();
      } else if (event.key === '-') {
        zoomOut();
      } else if (event.key === 'r') {
        rotate();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, slides.length, scale, rotation]);
  
  // Image load handlers
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setError('Không thể tải slide này');
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-850">
      {/* Title bar */}
      {title && (
        <div className="bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <span className="sr-only">Đóng</span>
              &times;
            </button>
          )}
        </div>
      )}
      
      {/* Main slide content */}
      <div className="flex-grow relative flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10">
            <div className="text-center p-6">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-2" />
              <p className="text-white">{error}</p>
            </div>
          </div>
        )}
        
        {/* Slide image */}
        <img
          src={slides[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            maxWidth: '100%',
            maxHeight: '100%',
            transition: 'transform 0.3s ease'
          }}
          className="object-contain"
        />
        
        {/* Navigation buttons - previous */}
        {currentSlide > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-2"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        {/* Navigation buttons - next */}
        {currentSlide < slides.length - 1 && (
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full p-2"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
      
      {/* Controls bar */}
      <div className="bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {/* Slide counter */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Slide {currentSlide + 1} / {slides.length}
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={zoomOut}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Zoom out"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Zoom in"
            disabled={scale >= 3}
          >
            <ZoomIn className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={rotate}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Rotate image"
          >
            <RotateCw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <a
            href={slides[currentSlide]}
            download
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Download current slide"
          >
            <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PresentationViewer;
