import React, { useState, useEffect } from 'react';
import { Share, Copy, Check, Facebook, Twitter, Mail, Link as LinkIcon } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  iconSize?: number;
  buttonText?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title,
  description = '',
  className = '',
  iconSize = 18,
  buttonText = 'Share'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Encode parameters
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  // Generate sharing URLs
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const emailUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
  
  // Check if Web Share API is available
  const hasNativeShare = navigator.share !== undefined;
  
  // Handle native share
  const handleNativeShare = async () => {
    if (hasNativeShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };
  
  // Copy link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.social-share-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  return (
    <div className={`relative social-share-dropdown ${className}`}>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        aria-expanded={showDropdown}
      >
        <Share className="w-4 h-4 mr-2" />
        {buttonText}
      </button>
      
      {/* Dropdown menu */}
      {!hasNativeShare && showDropdown && (
        <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={copyLink}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              {copied ? (
                <>
                  <Check className={`h-${iconSize/4} w-${iconSize/4} mr-3 text-green-500`} />
                  <span>Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className={`h-${iconSize/4} w-${iconSize/4} mr-3`} />
                  <span>Copy link</span>
                </>
              )}
            </button>
            
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <Facebook className={`h-${iconSize/4} w-${iconSize/4} mr-3 text-blue-600`} />
              <span>Share on Facebook</span>
            </a>
            
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <Twitter className={`h-${iconSize/4} w-${iconSize/4} mr-3 text-blue-400`} />
              <span>Share on Twitter</span>
            </a>
            
            <a
              href={emailUrl}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <Mail className={`h-${iconSize/4} w-${iconSize/4} mr-3 text-gray-500`} />
              <span>Share via Email</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;
