import React, { useState } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../core/components/ui/tabs';
import PDFViewerSection from './PDFViewerSection';
import SafePDFViewerSection from './SafePDFViewerSection';

// Cấu trúc dữ liệu cho một file PDF
interface PdfFile {
  id: string;
  file_key: string;
  title?: string;
  description?: string;
  created_at?: string;
}

interface MultiPDFViewerSectionProps {
  pdfFiles: PdfFile[] | undefined;
}

/**
 * Component hiển thị nhiều file PDF với tabs
 */
const MultiPDFViewerSection: React.FC<MultiPDFViewerSectionProps> = ({ pdfFiles }) => {
  // State để theo dõi tab đang được chọn
  const [activeTab, setActiveTab] = useState<string>('');
  
  // Kiểm tra nếu không có file PDF
  if (!pdfFiles || pdfFiles.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Bản nhạc</CardTitle>
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
  
  // Nếu chỉ có một file PDF, hiển thị trực tiếp
  if (pdfFiles.length === 1) {
    const pdfFile = pdfFiles[0];
    return <SafePDFViewerSection fileKey={pdfFile.file_key} title={pdfFile.title || 'Bản nhạc'} />;
  }
  
  // Nếu có nhiều file PDF, hiển thị dưới dạng tabs
  // Đặt tab đầu tiên làm active nếu chưa có tab nào được chọn
  if (!activeTab && pdfFiles.length > 0) {
    setActiveTab(pdfFiles[0].id);
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Bản nhạc</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab || pdfFiles[0].id} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            {pdfFiles.map((pdf) => (
              <TabsTrigger 
                key={pdf.id} 
                value={pdf.id}
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                {pdf.title || `Bản nhạc ${pdfFiles.indexOf(pdf) + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {pdfFiles.map((pdf) => (
            <TabsContent key={pdf.id} value={pdf.id}>
              <SafePDFViewerSection 
                fileKey={pdf.file_key} 
                title={pdf.title} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MultiPDFViewerSection;