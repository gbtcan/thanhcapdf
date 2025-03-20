import { useState, useEffect, useRef, RefObject } from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
}

/**
 * Hook to handle fullscreen functionality for an element
 * @param elementRef Reference to the element to make fullscreen
 * @returns Object with fullscreen state and control functions
 */
export function useFullscreen(elementRef: RefObject<HTMLElement>): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Keep track of which element is fullscreen
  const fullscreenElementRef = useRef<HTMLElement | null>(null);
  
  // Update state when fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = 
        document.fullscreenElement === elementRef.current ||
        (document as any).webkitFullscreenElement === elementRef.current ||
        (document as any).mozFullScreenElement === elementRef.current ||
        (document as any).msFullscreenElement === elementRef.current;
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen) {
        fullscreenElementRef.current = null;
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [elementRef]);
  
  // Enter fullscreen
  const enterFullscreen = () => {
    const element = elementRef.current;
    if (!element) return;
    
    fullscreenElementRef.current = element;
    
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((e) => console.error('Fullscreen error:', e));
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  };
  
  // Exit fullscreen
  const exitFullscreen = () => {
    if (!isFullscreen) return;
    
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((e) => console.error('Exit fullscreen error:', e));
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    
    fullscreenElementRef.current = null;
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };
  
  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen
  };
}
