import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  onClose: () => void;
  isUploading: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  onClose,
  isUploading,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setError(null);
      return;
    }
    
    // Validate file type
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      return;
    }
    
    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  // Handle upload button
  const handleUploadClick = () => {
    if (file) {
      onUpload(file);
    }
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files?.length) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Validate file type
      if (!acceptedTypes.includes(droppedFile.type)) {
        setError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
        return;
      }
      
      // Validate file size
      if (droppedFile.size > maxSizeBytes) {
        setError(`File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }
      
      setFile(droppedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Add cleanup function
  const cleanupFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFile(null);
    setPreview(null);
    setError(null);
  };
  
  // Modify the close handler
  const handleClose = () => {
    cleanupFileInput();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Upload Image</h3>
          <button 
            onClick={handleClose} // Use the new handler
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Drop zone */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            error 
              ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-700'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {preview ? (
            <div className="mb-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-48 max-w-full mx-auto rounded"
              />
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              <ImageIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="mb-2">Drag and drop an image here, or click to select a file</p>
              <p className="text-xs">
                Supported formats: JPG, PNG, GIF, WEBP (max {maxSizeMB}MB)
              </p>
            </div>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Image
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="mt-5 sm:mt-6 flex justify-end">
          <button
            type="button"
            className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={handleClose} // Use the new handler
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            onClick={handleUploadClick}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader className="animate-spin mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
