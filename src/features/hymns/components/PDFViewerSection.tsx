import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';
import { supabase } from '../../../lib/supabase';

interface PDFViewerSectionProps {
  fileKey: string;
  title?: string;
}

const PDFViewerSection: React.FC<PDFViewerSectionProps> = ({ 
  fileKey,
  title = "Bản nhạc"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tự động kiểm tra và chỉnh sửa đường dẫn nếu cần
  const getBucketAndKey = (key: string) => {
    // Nếu đường dẫn không có "/", đây có thể là tên file đơn thuần
    if (!key?.includes('/')) {
      // Sử dụng mặc định bucket hymn và thêm thư mục pdf
      return { bucket: 'hymn', adjustedKey: `pdf/${key}` };
    }
    
    // Kiểm tra xem đường dẫn đã có bucket/path chưa
    if (key?.startsWith('hymn/pdf/')) {
      // Đường dẫn đã đúng định dạng
      return { bucket: 'hymn', adjustedKey: key };
    }
    
    if (key?.startsWith('pdf/')) {
      // Chỉ có tên thư mục pdf, thêm tên bucket
      return { bucket: 'hymn', adjustedKey: key };
    }
    
    // Thử cách khác, giữ nguyên key nhưng sử dụng bucket hymn
    return { bucket: 'hymn', adjustedKey: key };
  };

  // Lấy URL của file từ supabase storage
  const getFileUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Kiểm tra fileKey có hợp lệ không
      if (!fileKey || fileKey === 'undefined' || fileKey === 'null') {
        throw new Error('Không tìm thấy thông tin file PDF');
      }
      
      // Nếu fileKey là URL đầy đủ, sử dụng trực tiếp
      if (fileKey.startsWith('http')) {
        console.log('fileKey đã là URL đầy đủ:', fileKey);
        setPdfUrl(fileKey);
        return;
      }
      
      // Xác định bucket và key chính xác
      const { bucket, adjustedKey } = getBucketAndKey(fileKey);
      console.log(`Thử tải file từ bucket: ${bucket}, key: ${adjustedKey}`);
      
      // Phương pháp 1: Thử tạo public URL trước (hiệu quả và không cần xác thực)
      try {
        const publicUrl = supabase.storage.from(bucket).getPublicUrl(adjustedKey);
        if (publicUrl?.data?.publicUrl) {
          console.log('Đã lấy được public URL:', publicUrl.data.publicUrl);
          setPdfUrl(publicUrl.data.publicUrl);
          return;
        }
      } catch (err) {
        console.warn('Không thể lấy public URL:', err);
      }
      
      // Phương pháp 2: Thử tạo signed URL 
      try {
        const { data: signedData, error: signedError } = await supabase
          .storage
          .from(bucket)
          .createSignedUrl(adjustedKey, 3600); // URL có hiệu lực trong 1 giờ
        
        if (!signedError && signedData?.signedUrl) {
          console.log('Đã lấy được signed URL');
          setPdfUrl(signedData.signedUrl);
          return;
        }
      } catch (err) {
        console.warn('Không thể tạo signed URL:', err);
      }
      
      // Phương pháp 3: Thử với bucket sheet-music nếu mặc định không thành công
      try {
        if (bucket !== 'sheet-music') {
          // Thử public URL trước
          const sheetPublicUrl = supabase.storage.from('sheet-music').getPublicUrl(fileKey);
          if (sheetPublicUrl?.data?.publicUrl) {
            console.log('Đã lấy được public URL từ sheet-music');
            setPdfUrl(sheetPublicUrl.data.publicUrl);
            return;
          }
          
          // Nếu không thành công, thử signed URL
          const { data: sheetData, error: sheetError } = await supabase
            .storage
            .from('sheet-music')
            .createSignedUrl(fileKey, 3600);
            
          if (!sheetError && sheetData?.signedUrl) {
            console.log('Đã lấy được signed URL từ sheet-music');
            setPdfUrl(sheetData.signedUrl);
            return;
          }
        }
      } catch (err) {
        console.warn('Không thể tạo URL từ bucket sheet-music:', err);
      }
      
      // Nếu tất cả cách đều không thành công, kiểm tra xem fileKey có phải là đường dẫn đầy đủ không
      if (fileKey.endsWith('.pdf')) {
        console.log('Thử sử dụng fileKey trực tiếp:', fileKey);
        // Tạo URL đầy đủ cho Supabase
        const directUrl = `https://fwoxlggleieoztmcvsju.supabase.co/storage/v1/object/public/hymn/${fileKey}`;
        setPdfUrl(directUrl);
        return;
      }
      
      throw new Error('Không thể truy cập file PDF');
    } catch (error: any) {
      console.error('Error fetching PDF URL:', error);
      setError(error.message || 'Không thể tải file PDF');
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động tải URL khi component mount
  useEffect(() => {
    if (fileKey && fileKey !== 'undefined' && fileKey !== 'null' && !pdfUrl && !isLoading) {
      getFileUrl();
    }
  }, [fileKey]);

  // Tải PDF về máy
  const handleDownload = async () => {
    try {
      // Kiểm tra fileKey có hợp lệ không
      if (!fileKey || fileKey === 'undefined') {
        throw new Error('Không tìm thấy thông tin file PDF');
      }
      
      // Xác định bucket và key chính xác
      const { bucket, adjustedKey } = getBucketAndKey(fileKey);
      
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .download(adjustedKey);
      
      if (error) throw error;
      
      // Tạo URL cho file blob và tải xuống
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = adjustedKey.split('/').pop() || 'bai-hat.pdf';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      setError(error.message || 'Không thể tải file PDF');
    }
  };

  // Nếu chưa tải PDF thì hiển thị nút xem
  if (!pdfUrl) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
            {error ? (
              <>
                <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
                <p className="text-destructive mb-4">{error}</p>
                <Button
                  onClick={getFileUrl}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang thử lại...' : 'Thử lại'}
                </Button>
              </>
            ) : isLoading ? (
              <>
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Đang tải bản nhạc...
                </p>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Xem bản nhạc dạng PDF
                </p>
                <Button
                  onClick={getFileUrl}
                  disabled={isLoading}
                >
                  Xem bản nhạc
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm" 
            className="text-gray-500"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Tải về
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-500"
            asChild
          >
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Mở rộng
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full h-[500px] overflow-hidden rounded-md">
          <iframe
            src={`${pdfUrl}#view=FitH&toolbar=0&statusbar=0&navpanes=0`}
            width="100%"
            height="100%"
            title={title}
            className="border-0"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewerSection;
