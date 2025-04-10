import React from 'react';
import { Card, CardContent } from '../../../../../core/components/ui/card';
import { FileText, Music, Video, Presentation, Eye } from 'lucide-react';
import { formatDate } from '../../../../../lib/utils';
import { Hymn } from '../../../types/hymns';

interface HymnStatsProps {
  hymn: Hymn;
  pdfCount: number;
  audioCount: number;
  videoCount: number;
  presentationCount: number;
}

const HymnStats: React.FC<HymnStatsProps> = ({ 
  hymn, 
  pdfCount, 
  audioCount, 
  videoCount,
  presentationCount 
}) => {
  const stats = [
    {
      name: 'Lượt xem',
      value: hymn.view_count.toLocaleString(),
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'File PDF',
      value: pdfCount,
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      name: 'File Audio',
      value: audioCount,
      icon: <Music className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Video',
      value: videoCount,
      icon: <Video className="h-5 w-5 text-red-500" />,
      color: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      name: 'Trình chiếu',
      value: presentationCount,
      icon: <Presentation className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* General stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className={`p-3 ${stat.color} flex items-center gap-3`}>
              {stat.icon}
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.name}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Additional information */}
      <div className="text-sm text-muted-foreground">
        <p>
          Ngày tạo: {formatDate(new Date(hymn.created_at))}{' '}
          {hymn.author && `bởi ${hymn.author.name || hymn.author.email}`}
        </p>
        <p>
          Lần cập nhật cuối: {formatDate(new Date(hymn.updated_at))}
        </p>
      </div>
    </div>
  );
};

export default HymnStats;
