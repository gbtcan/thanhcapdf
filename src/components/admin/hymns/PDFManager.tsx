import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { FileText, Upload, X, Edit2, Save, Trash2, Move } from 'lucide-react';
import { PdfFile } from '../../../types/hymns';
import { deletePDF, updatePDFMetadata } from '../../../lib/hymnPdfService';
import PDFUploader from '../../PDFUploader';
import LoadingIndicator from '../../LoadingIndicator';
import AlertBanner from '../../AlertBanner';

interface PDFManagerProps {
  hymnId: string;
  pdfs: PdfFile[];
  className?: string;
}

const PDFManager: React.FC<PDFManagerProps> = ({ hymnId, pdfs, className = '' }) => {
  const queryClient = useQueryClient();
  const [showUploader, setShowUploader] = useState(false);
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Delete PDF mutation
  const deleteMutation = useMutation({
    mutationFn: deletePDF,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hymn', hymnId] });
      setSuccess('PDF file deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError('Failed to delete PDF file');
      console.error('Error deleting PDF:', err);
    }
  });
  
  // Update PDF metadata mutation
  const updateMutation = useMutation({
    mutationFn: ({ pdfId, data }: { pdfId: string, data: { description: string } }) => 
      updatePDFMetadata(pdfId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hymn', hymnId] });
      setEditingPdfId(null);
      setSuccess('PDF information updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err) => {
      setError('Failed to update PDF information');
      console.error('Error updating PDF:', err);
    }
  });
  
  // Start editing a PDF
  const startEdit = (pdf: PdfFile) => {
    setEditingPdfId(pdf.id);
    setDescription(pdf.description || '');
  };
  
  // Save PDF edit
  const saveEdit = (pdfId: string) => {
    updateMutation.mutate({ 
      pdfId, 
      data: { description: description.trim() || 'Sheet Music' } 
    });
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingPdfId(null);
    setDescription('');
  };
  
  // Handle PDF delete
  const handleDelete = (pdfId: string) => {
    if (window.confirm('Are you sure you want to delete this PDF file? This action cannot be undone.')) {
      deleteMutation.mutate(pdfId);
    }
  };
  
  // Handle upload complete
  const handleUploadComplete = () => {
    setShowUploader(false);
    queryClient.invalidateQueries({ queryKey: ['hymn', hymnId] });
    setSuccess('PDF uploaded successfully');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Manage PDF Files</h2>
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {showUploader ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </>
            )}
          </button>
        </div>
        
        {/* Status messages */}
        {error && (
          <div className="px-6 py-4">
            <AlertBanner 
              type="error" 
              title="Error" 
              message={error} 
              onClose={() => setError(null)}
            />
          </div>
        )}
        
        {success && (
          <div className="px-6 py-4">
            <AlertBanner 
              type="success" 
              title="Success" 
              message={success} 
              onClose={() => setSuccess(null)}
            />
          </div>
        )}
        
        {/* PDF uploader */}
        {showUploader && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <PDFUploader 
              hymnId={hymnId}
              onComplete={handleUploadComplete}
            />
          </div>
        )}
        
        {/* PDF list */}
        <div className="px-6 py-4">
          {pdfs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No PDF files uploaded yet
            </div>
          ) : (
            <ul className="space-y-4">
              {pdfs.map((pdf) => (
                <li 
                  key={pdf.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  {editingPdfId === pdf.id ? (
                    <div>
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="PDF description"
                        />
                      </div>
                      <div className="mt-3 flex justify-end space-x-3">
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(pdf.id)}
                          disabled={updateMutation.isPending}
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          {updateMutation.isPending ? (
                            <LoadingIndicator size="small" color="white" className="mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                        <div>
                          <div className="font-medium">{pdf.description || 'Sheet Music'}</div>
                          <div className="text-xs text-gray-500">
                            {new URL(pdf.file_url).pathname.split('/').pop()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(pdf.file_url, '_blank')}
                          className="p-1 text-gray-500 hover:text-indigo-600"
                          title="Preview PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => startEdit(pdf)}
                          className="p-1 text-gray-500 hover:text-indigo-600"
                          title="Edit description"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pdf.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1 text-gray-500 hover:text-red-600"
                          title="Delete PDF"
                        >
                          {deleteMutation.isPending && deleteMutation.variables === pdf.id ? (
                            <LoadingIndicator size="small" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFManager;
