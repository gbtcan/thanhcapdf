import { supabase } from '../../../lib/supabase';

/**
 * Determine if a path is a full URL
 */
function isFullUrl(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://');
}

/**
 * Extract relative path from a URL if possible
 */
function extractRelativePath(url: string): string {
  try {
    // If URL contains Supabase storage pathname
    if (url.includes('/storage/v1/object/public/')) {
      // Extract part after "public/" in URL
      const parts = url.split('/storage/v1/object/public/');
      if (parts.length > 1) {
        return parts[1];
      }
    }
    
    // If not a Supabase URL, return original URL
    return url;
  } catch (e) {
    console.warn('Error extracting path from URL:', e);
    return url;
  }
}

/**
 * Get PDF access URL with fallbacks
 * @param pdfPath Path to PDF in storage
 * @param bucket Optional bucket name, defaults to 'hymn-pdf'
 * @returns URL to access the PDF or null if unavailable
 */
export async function getPdfAccessUrl(pdfPath: string, bucket = 'hymn-pdf'): Promise<string | null> {
  if (!pdfPath) return null;
  
  try {
    // If already a full URL, return directly
    if (isFullUrl(pdfPath)) {
      return pdfPath;
    }
    
    // First try: Signed URL (most reliable)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(pdfPath, 60 * 60); // 1 hour expiry
      
    if (!signedUrlError && signedUrlData?.signedUrl) {
      return signedUrlData.signedUrl;
    }
    
    // Second try: Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(pdfPath);
      
    if (publicUrlData?.publicUrl) {
      return publicUrlData.publicUrl;
    }
    
    // Third try: Construct direct URL (last resort)
    const projectUrl = process.env.VITE_SUPABASE_URL || 'https://fwoxlggleieoztmcvsju.supabase.co';
    return `${projectUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(pdfPath)}`;
    
  } catch (error) {
    console.error('Error getting PDF access URL:', error);
    return null;
  }
}

/**
 * Check if a PDF exists in storage
 * @param pdfPath Path to PDF in storage
 * @param bucket Optional bucket name, defaults to 'hymn-pdf'
 */
export async function checkPdfExists(pdfPath: string, bucket = 'hymn-pdf'): Promise<boolean> {
  try {
    // If full URL, try to extract relative path
    const relativePath = isFullUrl(pdfPath) ? extractRelativePath(pdfPath) : pdfPath;
    
    const { error } = await supabase.storage
      .from(bucket)
      .download(relativePath, { offset: 0, limit: 1 }); // Only download first byte to check existence
    
    return !error;
  } catch {
    return false;
  }
}

/**
 * Download PDF directly from storage
 * @param pdfPath Path to PDF in storage
 * @param fileName Name to save the file as
 * @param bucket Optional bucket name, defaults to 'hymn-pdf'
 */
export async function downloadPdf(
  pdfPath: string, 
  fileName?: string,
  bucket = 'hymn-pdf'
): Promise<boolean> {
  try {
    // If already a full URL, try to download directly
    if (isFullUrl(pdfPath)) {
      const response = await fetch(pdfPath);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || pdfPath.split('/').pop() || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      return true;
    }
    
    // If relative path, use Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(pdfPath);
      
    if (error) throw error;
    
    // Create blob URL and trigger download
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || pdfPath.split('/').pop() || 'document.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err) {
    console.error('Error downloading PDF:', err);
    alert('Không thể tải xuống file PDF. Vui lòng thử lại sau.');
    return false;
  }
}

/**
 * Normalize PDF path to ensure it works
 */
export function normalizePdfPath(path: string): string {
  if (!path) return '';
  
  // If already a full URL, keep as is
  if (isFullUrl(path)) {
    return path;
  }
  
  // Remove leading characters like "/", " " if any
  return path.replace(/^[/\s]+/, '');
}
