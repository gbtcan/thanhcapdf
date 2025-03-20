import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, X, Plus, Trash2, Music, User, Tag, FileText, ArrowLeft } from 'lucide-react';
import { fetchHymnDetails, createHymn, updateHymn } from '../../../lib/hymnService';
import { supabase } from '../../../lib/supabase';
import LoadingIndicator from '../../../components/LoadingIndicator';
import AlertBanner from '../../../components/AlertBanner';
import PDFUploader from '../../../components/PDFUploader';
import { useAuth } from '../../../contexts/AuthContext';

const HymnForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    lyrics: '',
    authorIds: [] as string[],
    themeIds: [] as string[],
    tagIds: [] as string[]
  });
  
  // UI state
  const [showPdfUploader, setShowPdfUploader] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetching data for dropdown selections
  const { data: authors } = useQuery({
    queryKey: ['all-authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: themes } = useQuery({
    queryKey: ['all-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('themes')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });
  
  const { data: tags } = useQuery({
    queryKey: ['all-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch hymn details if editing
  const { data: hymn, isLoading: hymnsLoading } = useQuery({
    queryKey: ['hymn', id],
    queryFn: () => fetchHymnDetails(id!),
    enabled: isEditing,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          title: data.title,
          lyrics: data.lyrics || '',
          authorIds: data.authors?.map(a => a.id) || [],
          themeIds: data.themes?.map(t => t.id) || [],
          tagIds: data.tags?.map(t => t.id) || []
        });
      }
    }
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData & { createdBy: string }) => {
      return createHymn(data);
    },
    onSuccess: (hymnId) => {
      queryClient.invalidateQueries({ queryKey: ['hymns'] });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/admin/hymns/${hymnId}`);
      }, 1500);
    },
    onError: (error: any) => {
      setFormError(error.message || 'Failed to create hymn');
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return updateHymn(id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hymn', id] });
      queryClient.invalidateQueries({ queryKey: ['hymns'] });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/admin/hymns`);
      }, 1500);
    },
    onError: (error: any) => {
      setFormError(error.message || 'Failed to update hymn');
    }
  });
  
  // Form input handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Toggle selection in multi-select fields
  const toggleSelection = (field: 'authorIds' | 'themeIds' | 'tagIds', id: string) => {
    setFormData(prev => {
      if (prev[field].includes(id)) {
        return { ...prev, [field]: prev[field].filter(x => x !== id) };
      } else {
        return { ...prev, [field]: [...prev[field], id] };
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      if (!user) {
        setFormError('You must be logged in to create a hymn');
        return;
      }
      createMutation.mutate({ ...formData, createdBy: user.id });
    }
  };
  
  if (isEditing && hymnsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingIndicator size="large" message="Loading hymn details..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/hymns')}
          className="flex items-center text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hymns
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-800">
            {isEditing ? 'Edit Hymn' : 'Create New Hymn'}
          </h1>
        </div>
        
        {formError && (
          <div className="px-6 py-4">
            <AlertBanner
              type="error"
              title="Error"
              message={formError}
            />
          </div>
        )}
        
        {success && (
          <div className="px-6 py-4">
            <AlertBanner
              type="success"
              title="Success"
              message={`Hymn ${isEditing ? 'updated' : 'created'} successfully!`}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            {/* Lyrics field */}
            <div>
              <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700 mb-1">
                Lyrics
              </label>
              <textarea
                id="lyrics"
                name="lyrics"
                value={formData.lyrics}
                onChange={handleChange}
                rows={10}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter hymn lyrics here..."
              />
            </div>
            
            {/* Authors selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authors
              </label>
              {authors && authors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {authors.map(author => (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => toggleSelection('authorIds', author.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        formData.authorIds.includes(author.id)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {author.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No authors available</div>
              )}
            </div>
            
            {/* Themes selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Themes
              </label>
              {themes && themes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => toggleSelection('themeIds', theme.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        formData.themeIds.includes(theme.id)
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Music className="h-3 w-3 mr-1" />
                      {theme.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No themes available</div>
              )}
            </div>
            
            {/* Tags selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              {tags && tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleSelection('tagIds', tag.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        formData.tagIds.includes(tag.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No tags available</div>
              )}
            </div>
            
            {/* PDF files section - only shown when editing */}
            {isEditing && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    PDF Files
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPdfUploader(!showPdfUploader)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    {showPdfUploader ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add PDF
                      </>
                    )}
                  </button>
                </div>
                
                {/* Upload and existing PDFs management */}
                {showPdfUploader && (
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <PDFUploader 
                      hymnId={id!}
                      onComplete={() => {
                        setShowPdfUploader(false);
                        queryClient.invalidateQueries({ queryKey: ['hymn', id] });
                      }}
                    />
                  </div>
                )}
                
                {hymn?.pdf_files && hymn.pdf_files.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current PDF Files</h3>
                    <ul className="divide-y divide-gray-200">
                      {hymn.pdf_files.map(pdf => (
                        <li key={pdf.id} className="py-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <div>
                              <div className="font-medium text-sm">{pdf.description || 'Unnamed PDF'}</div>
                              <div className="text-xs text-gray-500">{new URL(pdf.file_url).pathname.split('/').pop()}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <a
                              href={pdf.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 px-2 py-1 text-sm mr-2"
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this PDF?')) {
                                  const { error } = await supabase
                                    .from('pdf_files')
                                    .delete()
                                    .eq('id', pdf.id);
                                    
                                  if (!error) {
                                    queryClient.invalidateQueries({ queryKey: ['hymn', id] });
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-800 px-2 py-1 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No PDF files attached</div>
                )}
              </div>
            )}
          </div>
          
          {/* Form actions */}
          <div className="px-6 py-3 bg-gray-50 text-right space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/hymns')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={createMutation.isPending || updateMutation.isPending || success}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <LoadingIndicator size="small" color="white" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1 inline" />
                  {isEditing ? 'Update Hymn' : 'Create Hymn'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HymnForm;
