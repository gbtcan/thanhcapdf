import React, { useState } from 'react';
import { ChevronsDown, ChevronsUp, Copy, Share2 } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';

interface LyricsSectionProps {
  lyrics: string;
}

const LyricsSection: React.FC<LyricsSectionProps> = ({ lyrics }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Xử lý copy lyrics
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(lyrics).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Xử lý hiển thị lyrics
  const formattedLyrics = lyrics
    .split('\n')
    .map((line, index) => <div key={index} className="mb-1">{line || '\u00A0'}</div>);

  // Tính toán độ cao tối đa khi chưa mở rộng
  const maxHeight = isExpanded ? 'none' : '300px';

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Lời bài hát</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-500"
            onClick={handleCopyToClipboard}
          >
            <Copy className="h-4 w-4 mr-2" />
            {isCopied ? 'Đã sao chép' : 'Sao chép'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-gray-500"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded 
              ? <><ChevronsUp className="h-4 w-4 mr-2" /> Thu gọn</>
              : <><ChevronsDown className="h-4 w-4 mr-2" /> Mở rộng</>
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className={`prose prose-sm dark:prose-invert max-w-none overflow-hidden relative ${!isExpanded && 'mask-bottom'}`}
          style={{ maxHeight }}
        >
          <div className="whitespace-pre-wrap font-medium leading-relaxed">
            {formattedLyrics}
          </div>
        </div>
        
        {!isExpanded && (
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            className="w-full mt-2 border-t border-gray-100 dark:border-gray-800 pt-2 text-gray-500 dark:text-gray-400"
          >
            <ChevronsDown className="h-4 w-4 mr-2" />
            Xem toàn bộ lời bài hát
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LyricsSection;
