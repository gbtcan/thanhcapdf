import React, { useState } from 'react';
import { Share2, Check, Copy, Twitter, Facebook } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  children?: React.ReactNode;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url = window.location.href,
  className = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Check if Web Share API is available
  const canShareNatively = navigator.share !== undefined;
  
  // Handle native share
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };
  
  // Handle copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Toggle share dropdown
  const toggleDropdown = () => {
    if (canShareNatively) {
      handleNativeShare();
    } else {
      setIsOpen(!isOpen);
    }
  };
  
  // Get social sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  
  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className={className || "inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"}
      >
        {children || (
          <>
            <Share2 className="h-4 w-4 mr-1.5" />
            Share
          </>
        )}
      </button>
      
      {/* Share dropdown (only shown if Web Share API is unavailable) */}
      {!canShareNatively && isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-3 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-3" />
                  <span>Copy link</span>
                </>
              )}
            </button>
            
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <Twitter className="h-4 w-4 mr-3 text-blue-400" />
              <span>Share on Twitter</span>
            </a>
            
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <Facebook className="h-4 w-4 mr-3 text-blue-600" />
              <span>Share on Facebook</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
