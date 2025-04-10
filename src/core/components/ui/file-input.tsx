import React, { useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import { Button } from './button';
import { Upload, X, File, Image as ImageIcon, Music } from 'lucide-react';

interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  onFilesSelected: (files: File[]) => void;
  value?: File[];
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  buttonText?: string;
  showPreview?: boolean;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      onFilesSelected,
      value = [],
      accept,
      multiple = false,
      maxFiles = 5,
      maxSize,
      className,
      buttonText = 'Chọn file',
      showPreview = true,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>(value || []);

    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.click();
      }
    };

    const validateFiles = (fileList: FileList): { valid: File[]; error?: string } => {
      const valid: File[] = [];
      
      // Check max files
      if (multiple && fileList.length + files.length > maxFiles) {
        return { valid, error: `Không thể upload quá ${maxFiles} files` };
      }

      // Validate each file
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Check file size
        if (maxSize && file.size > maxSize) {
          const sizeInMB = (maxSize / (1024 * 1024)).toFixed(2);
          return { 
            valid, 
            error: `File ${file.name} quá lớn. Kích thước tối đa là ${sizeInMB}MB`
          };
        }
        
        valid.push(file);
      }

      return { valid };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;

      const result = validateFiles(fileList);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setError(null);
      let newFiles: File[];
      
      if (multiple) {
        newFiles = [...files, ...result.valid];
      } else {
        newFiles = result.valid;
      }
      
      setFiles(newFiles);
      onFilesSelected(newFiles);
      
      // Reset input value so the same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    const removeFile = (index: number) => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      onFilesSelected(newFiles);
    };

    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
      if (file.type.startsWith('audio/')) return <Music className="h-5 w-5 text-green-500" />;
      return <File className="h-5 w-5 text-amber-500" />;
    };

    const getPreviewUrl = (file: File) => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    };

    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 bg-muted/20 border-muted-foreground/25">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500 text-center">
                <span className="font-semibold">Nhấn để upload</span> hoặc kéo thả file vào đây
              </p>
              <p className="text-xs text-gray-500">
                {accept ? `${accept.replace(/,/g, ', ')}` : 'Tất cả các định dạng'}
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
              accept={accept}
              multiple={multiple}
              {...props}
            />
          </label>
        </div>

        {error && (
          <div className="text-sm text-destructive">
            {error}
          </div>
        )}

        {showPreview && files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">File đã chọn:</p>
            <ul className="space-y-2">
              {files.map((file, index) => {
                const previewUrl = getPreviewUrl(file);
                return (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt={file.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        getFileIcon(file)
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
