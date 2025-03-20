import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FileText, Music, Video, Upload, Trash2, ExternalLink, RefreshCw, Filter, Link } from 'lucide-react';
import { Tab } from '@headlessui/react';
import AdminCard from '../../components/admin/AdminCard';
import AdminAlert from '../../components/admin/AdminAlert';
import LoadingIndicator from '../../components/LoadingIndicator';
import { formatBytes, formatDate } from '../../utils/formatters';

const AdminFiles: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedHymnId, setSelectedHymnId] = useState<string>('');
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [externalUrl, setExternalUrl] = useState('');

  // Fetch hymns for dropdown
  const { data: hymns } = useQuery({
    queryKey: ['hymns-for-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymns_new')
        .select('id, title')
        .order('title');
        
      if (error) throw error;
      return data;
    }
  });

  // Fetch PDF files
  const { data: pdfFiles, isLoading: loadingPdfs } = useQuery({
    queryKey: ['admin-pdf-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymn_pdf_files')
        .select(`
          id,
          hymn_id,
          pdf_path,
          description,
          uploaded_by,
          created_at,
          hymns_new(title)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 0
  });

  // Fetch audio files
  const { data: audioFiles, isLoading: loadingAudio } = useQuery({
    queryKey: ['admin-audio-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymn_audio_files')
        .select(`
          id,
          hymn_id,
          audio_path,
          description,
          uploaded_by,
          created_at,
          hymns_new(title)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 1
  });

  // Fetch video links
  const { data: videoLinks, isLoading: loadingVideos } = useQuery({
    queryKey: ['admin-video-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hymn_video_links')
        .select(`
          id,
          hymn_id,
          video_url,
          source,
          description,
          created_at,
          hymns_new(title)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 2
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, hymnId, description, type }: {
      file: File;
      hymnId: string;
      description: string;
      type: 'pdf' | 'audio';
    }) => {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${hymnId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${type === 'pdf' ? 'pdfs' : 'audio'}/${fileName}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hymn-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total!) * 100;
            setUploadProgress(Math.round(percent));
          }
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hymn-files')
        .getPublicUrl(filePath);
      
      // Save file reference in database
      const tableName = type === 'pdf' ? 'hymn_pdf_files' : 'hymn_audio_files';
      const pathField = type === 'pdf' ? 'pdf_path' : 'audio_path';
      
      const { data: fileData, error: dbError } = await supabase
        .from(tableName)
        .insert([{
          hymn_id: hymnId,
          [pathField]: publicUrl,
          description: description || undefined,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
        
      if (dbError) throw dbError;
      
      return fileData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${variables.type}-files`] });
      setSuccess(`${variables.type.toUpperCase()} file uploaded successfully`);
      resetUploadForm();
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
    }
  });

  // Add video link mutation
  const addVideoLinkMutation = useMutation({
    mutationFn: async ({ hymnId, videoUrl, description }: {
      hymnId: string;
      videoUrl: string;
      description: string;
    }) => {
      // Extract source from URL
      let source = '';
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        source = 'YouTube';
      } else if (videoUrl.includes('vimeo.com')) {
        source = 'Vimeo';
      } else {
        source = 'External';
      }
      
      const { data, error } = await supabase
        .from('hymn_video_links')
        .insert([{
          hymn_id: hymnId,
          video_url: videoUrl,
          source,
          description: description || undefined,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-links'] });
      setSuccess('Video link added successfully');
      resetUploadForm();
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to add video link');
      setIsUploading(false);
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async ({ id, type, path }: {
      id: string;
      type: 'pdf' | 'audio' | 'video';
      path?: string;
    }) => {
      // Delete from database
      const tableName = type === 'pdf' 
        ? 'hymn_pdf_files' 
        : type === 'audio' 
          ? 'hymn_audio_files'
          : 'hymn_video_links';
      
      const { error: dbError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // If it's a pdf or audio, also delete from storage
      if (type !== 'video' && path) {
        try {
          // Extract path from URL
          const url = new URL(path);
          const pathParts = url.pathname.split('/');
          const storagePath = pathParts.slice(pathParts.indexOf('hymn-files') + 1).join('/');
          
          if (storagePath) {
            const { error: storageError } = await supabase.storage
              .from('hymn-files')
              .remove([storagePath]);
              
            if (storageError) {
              console.error('Failed to delete file from storage:', storageError);
            }
          }
        } catch (error) {
          console.error('Error parsing file path:', error);
        }
      }
      
      return { id, type };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`admin-${data.type}-files`] });
      setSuccess(`${data.type.toUpperCase()} file deleted successfully`);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Delete failed');
    }
  });

  // Reset upload form
  const resetUploadForm = () => {
    setSelectedHymnId('');
    setFileDescription('');
    setSelectedFiles(null);
    setExternalUrl('');
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!selectedHymnId) {
      setError('Please select a hymn');
      return;
    }
    
    if (activeTab === 2) {
      // Handle video link
      if (!externalUrl) {
        setError('Please enter a video URL');
        return;
      }
      
      setIsUploading(true);
      
      try {
        await addVideoLinkMutation.mutate({
          hymnId: selectedHymnId,
          videoUrl: externalUrl,
          description: fileDescription
        });
      } catch (err) {
        console.error('Video link error:', err);
      }
    } else {
      // Handle file upload
      if (!selectedFiles || selectedFiles.length === 0) {
        setError('Please select a file to upload');
        return;
      }
      
      setIsUploading(true);
      
      try {
        await uploadFileMutation.mutate({
          file: selectedFiles[0],
          hymnId: selectedHymnId,
          description: fileDescription,
          type: activeTab === 0 ? 'pdf' : 'audio'
        });
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
  };

  // Handle file delete
  const handleDelete = (id: string, type: 'pdf' | 'audio' | 'video', path?: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type}? This cannot be undone.`)) {
      deleteFileMutation.mutate({ id, type, path });
    }
  };

  // Tab content loading state
  const isLoading = (activeTab === 0 && loadingPdfs) || 
                    (activeTab === 1 && loadingAudio) || 
                    (activeTab === 2 && loadingVideos);

  // Get file count by tab
  const getFileCount = (tabIndex: number) => {
    if (tabIndex === 0) return pdfFiles?.length || 0;
    if (tabIndex === 1) return audioFiles?.length || 0;
    return videoLinks?.length || 0;
  };

  // Get file listing for current tab
  const renderFileList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <LoadingIndicator size="medium" message={`Loading ${activeTab === 0 ? 'PDF files' : activeTab === 1 ? 'audio files' : 'video links'}...`} />
        </div>
      );
    }
    
    let files: any[] = [];
    let emptyMessage = '';
    
    if (activeTab === 0) {
      files = pdfFiles || [];
      emptyMessage = 'No PDF files uploaded yet.';
    } else if (activeTab === 1) {
      files = audioFiles || [];
      emptyMessage = 'No audio files uploaded yet.';
    } else {
      files = videoLinks || [];
      emptyMessage = 'No video links added yet.';
    }
    
    if (files.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        {files.map((file) => {
          const fileType = activeTab === 0 ? 'pdf' : activeTab === 1 ? 'audio' : 'video';
          const filePath = activeTab === 0 ? file.pdf_path : activeTab === 1 ? file.audio_path : file.video_url;
          
          return (
            <div 
              key={file.id} 
              className="bg-white dark:bg-gray-700 shadow-sm rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {activeTab === 0 ? (
                        <FileText className="h-6 w-6 text-red-500" />
                      ) : activeTab === 1 ? (
                        <Music className="h-6 w-6 text-blue-500" />
                      ) : (
                        <Video className="h-6 w-6 text-purple-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {file.description || (file.hymns_new?.title || 'Untitled')}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hymn: {file.hymns_new?.title || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Added {formatDate(file.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 p-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </a>
                    <button
                      onClick={() => handleDelete(file.id, fileType, filePath)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
                
                {filePath && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 break-all">
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">
                      {filePath.substring(0, 80)}{filePath.length > 80 ? '...' : ''}
                    </code>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">File Management</h1>
      
      {/* Success/Error messages */}
      {success && (
        <AdminAlert
          type="success"
          message={success}
          dismissible
          onDismiss={() => setSuccess(null)}
          className="mb-6"
        />
      )}
      
      {error && (
        <AdminAlert
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          className="mb-6"
        />
      )}
      
      {/* File type tabs */}
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          <Tab
            className={({ selected }) => `
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center
              ${selected
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            <FileText className="h-5 w-5 mr-2" />
            PDF Files ({getFileCount(0)})
          </Tab>
          <Tab
            className={({ selected }) => `
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center
              ${selected
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            <Music className="h-5 w-5 mr-2" />
            Audio Files ({getFileCount(1)})
          </Tab>
          <Tab
            className={({ selected }) => `
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center
              ${selected
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            <Video className="h-5 w-5 mr-2" />
            Video Links ({getFileCount(2)})
          </Tab>
        </Tab.List>
        
        <Tab.Panels className="mt-6">
          {/* File upload form */}
          <AdminCard
            title={`Upload ${activeTab === 0 ? 'PDF' : activeTab === 1 ? 'Audio' : 'Add Video Link'}`}
            className="mb-6"
          >
            <form onSubmit={handleFileUpload}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="hymn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Hymn *
                  </label>
                  <select
                    id="hymn"
                    value={selectedHymnId}
                    onChange={(e) => setSelectedHymnId(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={isUploading}
                  >
                    <option value="">Select a hymn</option>
                    {hymns?.map((hymn) => (
                      <option key={hymn.id} value={hymn.id}>
                        {hymn.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={`${activeTab === 0 ? 'Sheet music' : activeTab === 1 ? 'Audio recording' : 'Video recording'} description`}
                    disabled={isUploading}
                  />
                </div>
                
                {activeTab < 2 ? (
                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {activeTab === 0 ? 'PDF File *' : 'Audio File *'}
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="file"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                        accept={activeTab === 0 ? '.pdf' : '.mp3,.wav,.ogg'}
                        disabled={isUploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0 file:text-sm file:font-medium
                          file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-400
                          hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 dark:text-gray-300"
                      />
                    </div>
                    {selectedFiles && selectedFiles[0] && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Selected file: {selectedFiles[0].name} ({formatBytes(selectedFiles[0].size)})
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Video URL *
                    </label>
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                        <Link className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        id="videoUrl"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        disabled={isUploading}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Supports YouTube, Vimeo, or any direct video URL
                    </p>
                  </div>
                )}
              </div>
              
              {isUploading && activeTab < 2 && (
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                      <div 
                        style={{ width: `${uploadProgress}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      {activeTab === 0
                        ? 'Uploading PDF...'
                        : activeTab === 1
                        ? 'Uploading Audio...'
                        : 'Adding Link...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {activeTab === 0
                        ? 'Upload PDF'
                        : activeTab === 1
                        ? 'Upload Audio'
                        : 'Add Video Link'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </AdminCard>
          
          {/* File listings */}
          <Tab.Panel>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">PDF Files</h2>
            {renderFileList()}
          </Tab.Panel>
          
          <Tab.Panel>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Audio Files</h2>
            {renderFileList()}
          </Tab.Panel>
          
          <Tab.Panel>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Video Links</h2>
            {renderFileList()}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AdminFiles;
