import { supabase } from '../supabase/client';
import { clientConfig } from '../../config/clientConfig';
import type { PdfFile, PdfMetadata } from '../../types/pdf';
import { getOrCreateSessionId } from '../sessionManager';
import { tableExists, columnExists } from '../clientModeService';

/**
 * Fetch PDF files for a specific hymn
 * @param hymnId The hymn ID to fetch PDFs for
 * @returns Array of PDF files associated with the hymn
 */
export async function getPdfsByHymnId(hymnId: string): Promise<PdfFile[]> {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select(`
        id, 
        hymn_id, 
        filename, 
        created_at, 
        updated_at,
        user_id,
        size,
        view_count,
        download_count, 
        metadata,
        hymns(
          title,
          authors(name)
        )
      `)
      .eq('hymn_id', hymnId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching PDFs for hymn:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPdfsByHymnId:', error);
    return [];
  }
}

/**
 * Get the download URL for a PDF file
 * @param pdfId The ID of the PDF to download
 * @returns URL to download the PDF and its filename
 */
export async function getPdfDownloadUrl(pdfId: string): Promise<{ url: string; filename: string } | null> {
  try {
    // Get PDF record to find the path in storage
    const { data: pdf, error: pdfError } = await supabase
      .from('pdf_files')
      .select('filename, metadata')
      .eq('id', pdfId)
      .single();
      
    if (pdfError || !pdf) {
      console.error('Error fetching PDF record:', pdfError);
      return null;
    }
    
    // Generate a download URL from storage
    const { data, error } = await supabase
      .storage
      .from('pdfs')
      .createSignedUrl(`${pdf.filename}`, 60 * 60); // 1 hour expiry
      
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    // Generate a friendly filename if available in metadata
    let filename = pdf.filename.split('/').pop() || 'download.pdf';
    if (pdf.metadata?.originalName) {
      filename = pdf.metadata.originalName;
      // Ensure it has .pdf extension
      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
      }
    }
    
    // Record download
    await recordPdfDownload(pdfId).catch(err => 
      console.warn('Failed to record PDF download:', err)
    );
    
    return {
      url: data?.signedUrl || '',
      filename
    };
  } catch (error) {
    console.error('Error in getPdfDownloadUrl:', error);
    return null;
  }
}

/**
 * Record a view of a PDF
 * @param pdfId The ID of the PDF viewed
 * @param userId Optional user ID for authenticated users
 */
export async function recordPdfView(pdfId: string, userId?: string): Promise<void> {
  try {
    // Skip if PDF view tracking is disabled in client config
    if (clientConfig.clientSideOnly && !clientConfig.features.pdfViewsTracking) {
      return;
    }
    
    // Check if pdf_views table exists
    const pdfViewsTableExists = await tableExists('pdf_views');
    if (!pdfViewsTableExists) {
      // Try to update view_count column directly on pdf_files
      await updatePdfViewCount(pdfId);
      return;
    }
    
    // Get or create a session ID for anonymous users
    const sessionId = userId ? undefined : getOrCreateSessionId();
    
    // Insert view record
    const { error } = await supabase.from('pdf_views').insert({
      pdf_id: pdfId,
      user_id: userId || null,
      session_id: sessionId,
      viewed_at: new Date().toISOString()
    });
    
    if (error) {
      console.warn('Error recording PDF view:', error);
      // Try to update view_count directly as fallback
      await updatePdfViewCount(pdfId);
    }
  } catch (error) {
    console.error('Error in recordPdfView:', error);
  }
}

/**
 * Record a PDF download
 * @param pdfId The ID of the PDF downloaded
 * @param userId Optional user ID for authenticated users
 */
export async function recordPdfDownload(pdfId: string, userId?: string): Promise<void> {
  try {
    // Check if download_count column exists
    const hasDownloadCount = await columnExists('pdf_files', 'download_count');
    if (!hasDownloadCount) {
      return;
    }
    
    // Update download count directly
    await supabase
      .from('pdf_files')
      .update({ 
        download_count: supabase.rpc('increment', { value: 1 }),
        updated_at: new Date().toISOString()
      })
      .eq('id', pdfId);
  } catch (error) {
    console.error('Error in recordPdfDownload:', error);
  }
}

/**
 * Update the view count of a PDF directly
 * @param pdfId The PDF ID to update
 */
async function updatePdfViewCount(pdfId: string): Promise<void> {
  try {
    // Check if view_count column exists
    const hasViewCount = await columnExists('pdf_files', 'view_count');
    if (!hasViewCount) {
      return;
    }
    
    // Update view count
    await supabase
      .from('pdf_files')
      .update({ 
        view_count: supabase.rpc('increment', { value: 1 }),
        updated_at: new Date().toISOString()
      })
      .eq('id', pdfId);
  } catch (error) {
    console.error('Error updating PDF view count:', error);
  }
}

/**
 * Upload a new PDF file for a hymn
 */
export async function uploadPdf(
  file: File, 
  hymnId: string, 
  metadata?: PdfMetadata,
  onProgress?: (progress: number) => void
): Promise<PdfFile | null> {
  try {
    // Generate a unique filename
    const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const filename = `hymn_${hymnId}/${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${extension}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('pdfs')
      .upload(filename, file, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return null;
    }

    // Create database entry
    const pdfData = {
      hymn_id: hymnId,
      filename: uploadData.path,
      size: file.size,
      metadata: {
        ...metadata,
        originalName: file.name,
        contentType: file.type,
        uploadedAt: new Date().toISOString()
      }
    };

    const { data: newPdf, error: insertError } = await supabase
      .from('pdf_files')
      .insert(pdfData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating PDF record:', insertError);
      // Clean up the uploaded file
      await supabase.storage.from('pdfs').remove([filename]);
      return null;
    }

    return newPdf;
  } catch (error) {
    console.error('Error in uploadPdf:', error);
    return null;
  }
}

/**
 * Delete a PDF file
 * @param pdfId The ID of the PDF to delete
 * @returns true if successful, false otherwise
 */
export async function deletePdf(pdfId: string): Promise<boolean> {
  try {
    // Get the PDF record first to get the filename
    const { data: pdf, error: fetchError } = await supabase
      .from('pdf_files')
      .select('filename')
      .eq('id', pdfId)
      .single();
      
    if (fetchError || !pdf) {
      console.error('Error fetching PDF to delete:', fetchError);
      return false;
    }
    
    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('pdfs')
      .remove([pdf.filename]);
      
    if (storageError) {
      console.error('Error deleting PDF from storage:', storageError);
      // Continue with database deletion anyway
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('pdf_files')
      .delete()
      .eq('id', pdfId);
      
    if (dbError) {
      console.error('Error deleting PDF from database:', dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePdf:', error);
    return false;
  }
}

/**
 * Get popular PDFs based on view count
 * @param limit Maximum number of PDFs to return
 */
export async function getPopularPdfs(limit = 10): Promise<PdfFile[]> {
  try {
    // Check if view_count column exists
    const hasViewCount = await columnExists('pdf_files', 'view_count');
    
    if (hasViewCount) {
      // Fetch by view count
      const { data, error } = await supabase
        .from('pdf_files')
        .select(`
          id, 
          hymn_id, 
          filename, 
          created_at, 
          view_count,
          download_count,
          metadata,
          hymns(
            title,
            authors(name)
          )
        `)
        .order('view_count', { ascending: false })
        .limit(limit);
        
      if (!error && data) {
        return data;
      }
    }
    
    // Fallback to most recent
    const { data, error } = await supabase
      .from('pdf_files')
      .select(`
        id, 
        hymn_id, 
        filename, 
        created_at, 
        view_count,
        download_count,
        metadata,
        hymns(
          title,
          authors(name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching popular PDFs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getPopularPdfs:', error);
    return [];
  }
}
