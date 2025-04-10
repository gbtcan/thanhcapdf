import React, { useState, useEffect } from 'react';
import PDFViewer from '../../pdf/components/PDFViewer';
import { Card, CardContent } from '../../../core/components/ui/card';
import { Button } from '../../../core/components/ui/button';
import { supabase } from '../../../lib/supabase';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from '../../../core/hooks/useToast';

interface EnhancedPDFViewerSectionProps {
  fileKey: string;
  title?: string;
}

const EnhancedPDFViewerSection: React.FC<EnhancedPDFViewerSectionProps> = ({ fileKey, title = "Bản nhạc" }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Helper function to determine if a URL is already a public URL
  const isPublicUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Check if file exists in public folder
  const checkLocalPdfFile = (fileName: string): boolean => {
    // Extract just the filename part from the path, removing any directory parts
    const baseFileName = fileName.split('/').pop() || fileName;
    
    // Các đường dẫn có thể có
    const possiblePaths = [
      `/pdf/${baseFileName}`,
      `/pdfs/${baseFileName}`,
      `/${baseFileName}`
    ];
    
    try {
      // Thử tạo một URL tới file local và kiểm tra bằng HEAD request
      // Lưu ý: Đây chỉ là kiểm tra cơ bản, có thể không hoạt động trong mọi trường hợp
      for (const path of possiblePaths) {
        const img = new Image();
        img.src = path;
        if (img.complete) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking local file:", error);
      return false;
    }
  };

  // Try to use local file if available
  const getLocalPdfUrl = (fileName: string): string | null => {
    // Extract just the filename part
    const baseFileName = fileName.split('/').pop() || fileName;
    
    // Try different possible paths
    const possiblePaths = [
      `/pdf/${baseFileName}`,
      `/pdfs/${baseFileName}`,
      `/${baseFileName}`
    ];
    
    // Return the first path that seems valid
    for (const path of possiblePaths) {
      return path;
    }
    
    return null;
  };
  
  // Try to increment view count, but don't block PDF viewing if it fails
  const tryIncrementView = async (hymnId: string) => {
    try {
      // Extract hymn ID from fileKey if it's not already provided
      const id = hymnId || fileKey.split('/')[0];
      
      // Make API call to increment view
      const { error } = await supabase.rpc('increment_hymn_view', { hymn_id: id });
      
      if (error) {
        console.warn('Failed to increment hymn view:', error);
        // Don't show error to user, this is a background operation
      }
    } catch (err) {
      // Just log the error, don't fail the PDF viewing
      console.warn('Error incrementing hymn view:', err);
    }
  };

  // Load the PDF URL
  const loadPdfUrl = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If fileKey is already a full URL, use it directly
      if (isPublicUrl(fileKey)) {
        setPdfUrl(fileKey);
        setIsLoading(false);
        return;
      }
      
      // Try to load from Supabase first
      try {
        // Create a signed URL that's valid for 1 hour
        const { data, error } = await supabase
          .storage
          .from('hymn')
          .createSignedUrl(`pdf/${fileKey}`, 3600);

        if (error) {
          throw error;
        }

        if (data?.signedUrl) {
          setPdfUrl(data.signedUrl);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Error getting signed URL, trying alternative methods:', err);
        // Continue to fallback methods
      }
      
      // Try fallback to direct storage URL if signed URL fails
      try {
        const { data } = supabase
          .storage
          .from('hymn')
          .getPublicUrl(`pdf/${fileKey}`);
          
        if (data?.publicUrl) {
          setPdfUrl(data.publicUrl);
          setIsLoading(false);
          setIsUsingFallback(true);
          return;
        }
      } catch (err) {
        console.warn('Public URL fallback failed:', err);
        // Continue to local file fallback
      }
      
      // Try local file as last resort
      const localUrl = getLocalPdfUrl(fileKey);
      if (localUrl) {
        setPdfUrl(localUrl);
        setIsLoading(false);
        setIsUsingFallback(true);
        return;
      }
      
      // If all attempts fail
      throw new Error('Không thể tạo liên kết đến tệp PDF');

    } catch (err) {
      console.error('Error loading PDF URL:', err);
      setError('Không thể tải bản nhạc. Vui lòng thử lại sau.');
      toast({
        title: "Lỗi tải PDF",
        description: "Không thể tải bản nhạc. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load PDF URL on mount
  useEffect(() => {
    loadPdfUrl();
    
    // Try to increment view count in background (don't block PDF viewing)
    // Extract hymn ID from fileKey if possible
    const hymnId = fileKey.includes('/') ? fileKey.split('/')[0] : fileKey;
    if (hymnId && !isNaN(Number(hymnId))) {
      tryIncrementView(hymnId);
    }
  }, [fileKey]);

  // Function to handle retry
  const handleRetry = () => {
    loadPdfUrl();
  };

  // If still loading or there's no PDF URL, show loading state
  if (isLoading || !pdfUrl) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Đang tải bản nhạc...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
              <Button onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Chưa có bản nhạc</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // If we have a PDF URL, render the PDF viewer
  return (
    <PDFViewer 
      pdfUrl={pdfUrl}
      title={title}
      height={600}
      allowDownload={true}
      allowFullscreen={true}
      allowPrint={true}
      showToolbar={true}
      useFallbackIfNeeded={true}
      key={pdfUrl} /* Key ensures component remounts when URL changes */
    />
  );
};

export default EnhancedPDFViewerSection;
