import React, { useState } from 'react';
import { Share2, Check, Copy, Facebook, Twitter } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../core/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../core/components/ui/tooltip';

interface ShareButtonProps {
  title: string;
  url: string;
  size?: 'sm' | 'default' | 'lg';
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  url, 
  size = 'default' 
}) => {
  const [copied, setCopied] = useState(false);
  
  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Share on Facebook
  const shareOnFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbShareUrl, 'facebook-share-dialog', 'width=800,height=600');
  };
  
  // Share on Twitter
  const shareOnTwitter = () => {
    const tweetText = `${title} ${url}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterShareUrl, 'twitter-share-dialog', 'width=800,height=600');
  };
  
  // Determine button size
  const sizeClass = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9',
    lg: 'h-10 w-10'
  }[size];
  
  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={sizeClass}
              >
                <Share2 className="h-[1.2em] w-[1.2em]" />
                <span className="sr-only">Chia sẻ</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chia sẻ</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                <span>Sao chép liên kết</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
            <Facebook className="h-4 w-4 mr-2" />
            <span>Chia sẻ Facebook</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer">
            <Twitter className="h-4 w-4 mr-2" />
            <span>Chia sẻ Twitter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default ShareButton;
