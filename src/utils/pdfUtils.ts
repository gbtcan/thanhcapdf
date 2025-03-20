import { supabase } from '../lib/supabase';
import { getSupabasePdfUrl } from './pdf/pdfConfig';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, TextContent } from 'pdfjs-dist';

// Set the worker source path to the PDF.js worker script
GlobalWorkerOptions.workerSrc = '/pdf-viewer/pdf.worker.min.js';

/**
 * Cache for PDF documents to avoid reloading
 */
const pdfCache: Map<string, PDFDocumentProxy> = new Map();

/**
 * Load a PDF document from a URL
 * @param url - URL to the PDF file
 * @returns Promise resolving to the PDF document
 */
export async function loadPDF(url: string): Promise<PDFDocumentProxy> {
  // Check if PDF is already cached
  if (pdfCache.has(url)) {
    return pdfCache.get(url)!;
  }

  try {
    // Load the document
    const loadingTask = getDocument(url);
    const pdf = await loadingTask.promise;
    
    // Cache the document
    pdfCache.set(url, pdf);
    
    return pdf;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error(`Failed to load PDF from ${url}: ${error}`);
  }
}

/**
 * Get the number of pages in a PDF document
 * @param url - URL to the PDF file
 * @returns Promise resolving to the page count
 */
export async function getPDFPageCount(url: string): Promise<number> {
  const pdf = await loadPDF(url);
  return pdf.numPages;
}

/**
 * Extract text content from a specific page of a PDF
 * @param url - URL to the PDF file
 * @param pageNumber - Page number to extract text from (1-based)
 * @returns Promise resolving to the extracted text content
 */
export async function extractPageText(url: string, pageNumber: number): Promise<string> {
  try {
    const pdf = await loadPDF(url);
    
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`Page number ${pageNumber} out of range (1-${pdf.numPages})`);
    }
    
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    
    // Extract text from text content items
    return textContent.items
      .map((item: any) => item.str)
      .join(' ');
  } catch (error) {
    console.error(`Error extracting text from PDF page ${pageNumber}:`, error);
    throw new Error(`Failed to extract text from page ${pageNumber}: ${error}`);
  }
}

/**
 * Extract text from all pages of a PDF
 * @param url - URL to the PDF file
 * @returns Promise resolving to the full text content
 */
export async function extractAllText(url: string): Promise<string> {
  try {
    const pdf = await loadPDF(url);
    let fullText = '';
    
    // Process each page
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const pageText = await extractPageText(url, pageNumber);
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting all text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error}`);
  }
}

/**
 * Clean up cached PDF documents to free memory
 * @param url - Specific URL to clean up, or undefined to clean all
 */
export function cleanupPDF(url?: string): void {
  if (url) {
    const pdf = pdfCache.get(url);
    if (pdf) {
      pdf.destroy();
      pdfCache.delete(url);
    }
  } else {
    // Clean up all cached PDFs
    pdfCache.forEach(pdf => pdf.destroy());
    pdfCache.clear();
  }
}

/**
 * Search for text in a PDF document
 * @param url - URL to the PDF file
 * @param searchText - Text to search for
 * @returns Promise resolving to page numbers containing the search text
 */
export async function searchPDF(url: string, searchText: string): Promise<number[]> {
  try {
    const pdf = await loadPDF(url);
    const results: number[] = [];
    const searchPattern = new RegExp(searchText, 'i');
    
    // Search each page
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const pageText = await extractPageText(url, pageNumber);
      if (searchPattern.test(pageText)) {
        results.push(pageNumber);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error searching PDF for "${searchText}":`, error);
    throw new Error(`Failed to search PDF: ${error}`);
  }
}

/**
 * Upload a PDF file to Supabase storage
 * 
 * @param file The PDF file to upload
 * @param hymnId The ID of the hymn this PDF belongs to (for path naming)
 * @returns The public URL of the uploaded file
 */
export async function uploadPdf(file: File, hymnId: string): Promise<string> {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Invalid file: Please upload a PDF document');
  }
  
  try {
    // Create a unique filename with timestamp and hymn ID
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const fileName = `${hymnId}_${timestamp}.${fileExtension}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('hymn_pdfs')
      .upload(`public/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('hymn_pdfs')
      .getPublicUrl(`public/${fileName}`);
    
    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to upload PDF. Please try again later.');
  }
}

/**
 * Delete a PDF file from Supabase storage
 * 
 * @param url The public URL of the PDF file to delete
 */
export async function deletePdf(url: string): Promise<void> {
  if (!url) {
    throw new Error('Invalid PDF URL: URL cannot be empty');
  }
  
  try {
    // Extract path from the URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/public\/(.+)$/);
    
    if (!pathMatch) {
      throw new Error('Invalid PDF URL format. Cannot extract file path.');
    }
    
    const path = `public/${pathMatch[1]}`;
    
    // Delete from storage
    const { error } = await supabase.storage
      .from('hymn_pdfs')
      .remove([path]);
      
    if (error) {
      throw new Error(`Failed to delete PDF: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting PDF:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to delete PDF. Please try again later.');
  }
}

/**
 * Get file details from a PDF URL
 * 
 * @param url The public URL of the PDF file
 * @returns Object containing file name and creation date
 */
export function getPdfDetails(url: string): { fileName: string; createdAt: Date | null } {
  if (!url) {
    return { fileName: 'Unknown file', createdAt: null };
  }
  
  try {
    // Extract the filename from the URL
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const fileName = path.split('/').pop() || 'Unknown file';
    
    // Try to extract timestamp from the filename (assuming format hymnId_timestamp.pdf)
    const timestampMatch = fileName.match(/_(\d+)\./);
    let createdAt: Date | null = null;
    
    if (timestampMatch && timestampMatch[1]) {
      const timestamp = parseInt(timestampMatch[1]);
      if (!isNaN(timestamp)) {
        createdAt = new Date(timestamp);
      }
    }
    
    return { fileName, createdAt };
  } catch (error) {
    console.error('Error getting PDF details:', error);
    return { fileName: 'Unknown file', createdAt: null };
  }
}

/**
 * Create a database record for the PDF file
 * 
 * @param hymnId ID of the hymn this PDF belongs to
 * @param fileUrl Public URL of the uploaded PDF
 * @param title Optional title for the PDF file
 * @returns ID of the created database record
 */
export async function createPdfRecord(
  hymnId: string, 
  fileUrl: string, 
  title?: string
): Promise<number> {
  try {
    const { fileName, createdAt } = getPdfDetails(fileUrl);
    
    const { data, error } = await supabase
      .from('pdf_files')
      .insert({
        hymn_id: hymnId,
        file_url: fileUrl,
        title: title || fileName,
        file_name: fileName,
        created_at: createdAt?.toISOString() || new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(`Failed to create PDF record: ${error.message}`);
    }
    
    if (!data || !data.id) {
      throw new Error('Failed to retrieve ID of created PDF record');
    }
    
    return data.id;
  } catch (error) {
    console.error('Error creating PDF record:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to create PDF record in database');
  }
}

/**
 * Delete a PDF record from the database and storage
 * 
 * @param id ID of the PDF record to delete
 */
export async function deletePdfRecord(id: number): Promise<void> {
  try {
    // First, get the file URL
    const { data, error: fetchError } = await supabase
      .from('pdf_files')
      .select('file_url')
      .eq('id', id)
      .single();
    
    if (fetchError || !data) {
      throw new Error(`Failed to fetch PDF record: ${fetchError?.message || 'Record not found'}`);
    }
    
    // Delete the file from storage
    await deletePdf(data.file_url);
    
    // Delete the database record
    const { error: deleteError } = await supabase
      .from('pdf_files')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      throw new Error(`Failed to delete PDF record: ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Error deleting PDF record:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to delete PDF record');
  }
}

/**
 * Process a PDF URL for display or download
 * This ensures Supabase URLs are properly formatted
 */
export function processPdfUrl(url: string): string {
  return getSupabasePdfUrl(url);
}

/**
 * Extract the filename from a PDF URL
 */
export function getPdfFilename(url: string): string {
  // Process the URL first to ensure it's valid
  const processedUrl = processPdfUrl(url);
  
  // Extract the filename from the URL
  const urlParts = processedUrl.split('/');
  return urlParts[urlParts.length - 1];
}

/**
 * Check if a URL is from Supabase storage
 */
export function isSupabasePdfUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public');
}

/**
 * PDF utility functions
 */

/**
 * Check if a string is a valid URL
 * @param url - The string to check
 * @returns True if the string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get a valid URL for a PDF file
 * @param path - Path or URL of the PDF
 * @returns Full URL to access the PDF
 */
export function getPdfUrl(path: string): string {
  if (!path) return '';
  
  // If it's already a valid URL, return it
  if (isValidUrl(path)) {
    return path;
  }
  
  // Otherwise, get the Supabase URL
  return getSupabasePdfUrl(path);
}

/**
 * Extract file name from a PDF path
 * @param path - PDF path or URL
 * @returns The file name
 */
export function getPdfFileName(path: string): string {
  if (!path) return 'unknown.pdf';
  
  try {
    // For URL paths
    if (isValidUrl(path)) {
      const url = new URL(path);
      const segments = url.pathname.split('/');
      const fileName = segments[segments.length - 1];
      
      // If we got a valid file name with extension
      if (fileName && fileName.includes('.')) {
        return fileName;
      }
    }
    
    // For non-URL paths, just extract the last segment
    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment && lastSegment.includes('.')) {
      return lastSegment;
    }
    
    // If we couldn't extract a valid filename, generate one
    return `document-${new Date().getTime()}.pdf`;
  } catch (e) {
    console.error('Error extracting PDF filename:', e);
    return 'document.pdf';
  }
}

/**
 * Get viewport dimensions for a PDF page
 * @param page - The PDF page object
 * @param scale - The scale to apply
 * @param rotation - The rotation in degrees
 * @returns The viewport dimensions
 */
export function getPdfViewport(
  page: any,
  scale: number = 1.0,
  rotation: number = 0
): { width: number; height: number } {
  try {
    const viewport = page.getViewport({ scale, rotation });
    return {
      width: viewport.width,
      height: viewport.height
    };
  } catch (error) {
    console.error('Error getting PDF viewport:', error);
    return { width: 0, height: 0 };
  }
}

/**
 * Calculate optimal scale to fit PDF in container
 * @param pageWidth - Original PDF page width
 * @param pageHeight - Original PDF page height
 * @param containerWidth - Available container width
 * @param containerHeight - Available container height (optional)
 * @returns The optimal scale factor
 */
export function calculateOptimalScale(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight?: number
): number {
  // If only width constraint
  if (!containerHeight) {
    return containerWidth / pageWidth;
  }
  
  // Both width and height constraints
  const widthScale = containerWidth / pageWidth;
  const heightScale = containerHeight / pageHeight;
  
  // Return the smaller scale to ensure it fits both dimensions
  return Math.min(widthScale, heightScale);
}

export default {
  processPdfUrl,
  getPdfFilename,
  isSupabasePdfUrl
};
