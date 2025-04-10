import React, { useEffect, useState } from "react";
import PDFViewer from "./PDFViewer";
import { supabase } from "./src/lib/supabase";

// Create simple Card components since we can't find the path "./ui/card"
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

interface EnhancedPDFViewerSectionProps {
  pdfUrl: string;
  docId: string;
}

export function EnhancedPDFViewerSection({
  pdfUrl,
  docId,
}: EnhancedPDFViewerSectionProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [viewCounted, setViewCounted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Validate inputs
  useEffect(() => {
    if (!pdfUrl || pdfUrl.includes("undefined")) {
      setError("Invalid PDF URL");
      console.error("Invalid PDF URL provided:", pdfUrl);
    } else if (!docId || docId === "undefined") {
      setError("Invalid document ID");
      console.error("Invalid document ID provided:", docId);
    } else {
      setError(null);
    }
  }, [pdfUrl, docId]);

  // Tăng lượt xem cho tài liệu
  const incrementViewCount = async (docId: string) => {
    try {
      // Skip if docId is missing or invalid
      if (!docId || docId === 'undefined') {
        console.warn('Invalid docId provided to incrementViewCount:', docId);
        return;
      }
      
      console.log('Gọi public_increment_hymn_view cho docId:', docId);
      
      // Chỉ gọi public_increment_hymn_view - hàm này đã được thiết lập đúng với SECURITY DEFINER
      const { error } = await supabase
        .rpc('public_increment_hymn_view', { 
          hymn_id: docId
        });
        
      if (error) {
        console.warn('Không thể tăng lượt xem:', error.message);
      } else {
        console.log('Đã tăng lượt xem thành công cho tài liệu:', docId);
      }
    } catch (error) {
      console.error('Lỗi khi tăng lượt xem:', error);
      // Không ném lỗi - tính năng đếm lượt xem không quan trọng
    }
  };

  // Tách biệt hành động tăng lượt xem khỏi việc render PDF
  useEffect(() => {
    // Chỉ tăng lượt xem một lần khi component được mount và nếu docId hợp lệ
    if (!viewCounted && docId && docId !== "undefined") {
      const handleViewCount = async () => {
        try {
          await incrementViewCount(docId);
          setViewCounted(true);
          console.log("View count incremented for document:", docId);
        } catch (error) {
          console.error("Failed to increment view count:", error);
        }
      };
      
      // Chờ một chút trước khi tăng lượt xem để đảm bảo người dùng thực sự đã xem
      const timeoutId = setTimeout(() => {
        handleViewCount();
      }, 3000); // 3 giây delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [docId, viewCounted]);

  const handleDocumentLoadSuccess = (pages: number) => {
    setNumPages(pages);
  };

  if (error) {
    return (
      <section className="w-full max-w-5xl mx-auto">
        <Card className="border-none shadow-none">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              {error}. Vui lòng thử lại sau.
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto">
      <Card className="border-none shadow-none">
        <CardContent className="p-0 sm:p-6">
          <PDFViewer 
            file={pdfUrl} 
            onDocumentLoadSuccess={handleDocumentLoadSuccess} 
          />
        </CardContent>
      </Card>
    </section>
  );
}
