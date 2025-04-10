import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';
import PDFViewerSection from './PDFViewerSection';

interface SafePDFViewerSectionProps {
  fileKey?: string | null;
  title?: string;
}

/**
 * Component an toàn để hiển thị PDFViewerSection
 * Đảm bảo fileKey hợp lệ trước khi render PDFViewerSection
 */
const SafePDFViewerSection: React.FC<SafePDFViewerSectionProps> = ({ 
  fileKey,
  title = "Bản nhạc"
}) => {
  // Kiểm tra fileKey có hợp lệ không
  const isValidFileKey = fileKey && fileKey !== 'undefined' && fileKey !== 'null';

  // Nếu không có fileKey hợp lệ, hiển thị thông báo thay vì lỗi
  if (!isValidFileKey) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Bài hát này chưa có bản nhạc PDF
            </p>
            <div className="text-sm text-gray-400 mt-2">
              Bạn có thể đề xuất thêm bản nhạc cho bài hát này
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nếu fileKey hợp lệ, hiển thị PDFViewerSection
  return <PDFViewerSection fileKey={fileKey} title={title} />;
};

export default SafePDFViewerSection;