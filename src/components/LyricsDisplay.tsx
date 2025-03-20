import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { formatLyricsHtml } from '../utils/formatLyrics';

interface LyricsDisplayProps {
  lyrics: string;
  title?: string;
  maxHeight?: number;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
  className?: string;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  title,
  maxHeight = 500,
  collapsible = true,
  initiallyExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [copied, setCopied] = useState(false);
  
  // Format lyrics for display
  const formattedLyrics = formatLyricsHtml(lyrics);
  
  // Copy lyrics to clipboard
  const handleCopyLyrics = () => {
    // Strip HTML tags for plain text
    const plainLyrics = lyrics.replace(/<[^>]*>?/gm, '');
    navigator.clipboard.writeText(plainLyrics).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title || 'Lyrics'}
        </h3>
        <button
          onClick={handleCopyLyrics}
          className="p-1 rounded-md text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Copy lyrics"
        >
          {copied ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Lyrics content */}
      <div className={`p-4 hymn-lyrics ${!isExpanded && collapsible ? 'max-h-[500px]' : ''} ${!isExpanded && collapsible ? 'overflow-hidden' : ''}`}>
        <div dangerouslySetInnerHTML={{ __html: formattedLyrics }} />
        
        {/* Gradient fade for collapsed state */}
        {!isExpanded && collapsible && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
        )}
      </div>
      
      {/* Expand/collapse button */}
      {collapsible && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay;
