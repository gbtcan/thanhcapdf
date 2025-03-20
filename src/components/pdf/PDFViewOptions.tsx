import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Printer, 
  Download, 
  Maximize, 
  Minimize,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PDFViewOptionsProps {
  scale: number;
  onScaleChange: (newScale: number) => void;
  rotation: number;
  onRotationChange: (newRotation: number) => void;
  canPrint: boolean;
  onPrint: () => void;
  onDownload: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  pageNumber: number;
  numPages: number;
  onPageChange: (newPage: number) => void;
}

const PDFViewOptions: React.FC<PDFViewOptionsProps> = ({
  scale,
  onScaleChange,
  rotation,
  onRotationChange,
  canPrint,
  onPrint,
  onDownload,
  onFullscreen,
  isFullscreen,
  pageNumber,
  numPages,
  onPageChange
}) => {
  const [customScale, setCustomScale] = useState<string>(Math.round(scale * 100).toString());
  
  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') return;
    
    const newScale = parseFloat(value);
    if (!isNaN(newScale)) {
      onScaleChange(newScale);
      setCustomScale(Math.round(newScale * 100).toString());
    }
  };
  
  const handleCustomScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomScale(value);
  };
  
  const handleCustomScaleBlur = () => {
    let value = parseInt(customScale, 10);
    if (isNaN(value) || value < 10) {
      value = 10; // Minimum 10%
    } else if (value > 500) {
      value = 500; // Maximum 500%
    }
    
    setCustomScale(value.toString());
    onScaleChange(value / 100);
  };
  
  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  };
  
  const handleNextPage = () => {
    if (pageNumber < numPages) {
      onPageChange(pageNumber + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap justify-between items-center gap-2">
      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onScaleChange(scale - 0.1)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <div className="flex items-center">
          <select
            value={scale === parseFloat(customScale) / 100 ? scale.toString() : 'custom'}
            onChange={handleScaleChange}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-1 pl-2 pr-6 focus:ring-indigo-500 focus:border-indigo-500"
            title="Zoom level"
          >
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
            <option value="1.25">125%</option>
            <option value="1.5">150%</option>
            <option value="2">200%</option>
            <option value="custom">Custom</option>
          </select>
          
          {scale !== 0.5 && scale !== 0.75 && scale !== 1 && scale !== 1.25 && scale !== 1.5 && scale !== 2 && (
            <input
              type="text"
              value={`${customScale}%`}
              onChange={handleCustomScaleChange}
              onBlur={handleCustomScaleBlur}
              className="ml-2 w-16 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
        </div>
        
        <button
          onClick={() => onScaleChange(scale + 0.1)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      
      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={handlePreviousPage}
          disabled={pageNumber <= 1}
          className={`p-1 rounded ${pageNumber <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Page {pageNumber} of {numPages}
        </span>
        
        <button
          onClick={handleNextPage}
          disabled={pageNumber >= numPages}
          className={`p-1 rounded ${pageNumber >= numPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
      
      {/* Additional controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onRotationChange((rotation + 90) % 360)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Rotate clockwise"
          aria-label="Rotate clockwise"
        >
          <RotateCw className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {canPrint && (
          <button
            onClick={onPrint}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Print"
            aria-label="Print"
          >
            <Printer className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        
        <button
          onClick={onDownload}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Download"
          aria-label="Download"
        >
          <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button
          onClick={onFullscreen}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Maximize className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PDFViewOptions;
