import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import { 
  getPdfResources, 
  getAudioResources, 
  getVideoResources,
  uploadPdfFile,
  deleteResource 
} from '../api/resourceApi';

/**
 * Hook to manage resources for a hymn
 */
export function useResources(hymnId?: string) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch PDF resources
  const pdfsQuery = useQuery({
    queryKey: ['resources', 'pdf', hymnId],
    queryFn: () => getPdfResources(hymnId || ''),
    enabled: !!hymnId
  });

  // Fetch audio resources
  const audiosQuery = useQuery({
    queryKey: ['resources', 'audio', hymnId],
    queryFn: () => getAudioResources(hymnId || ''),
    enabled: !!hymnId
  });

  // Fetch video resources
  const videosQuery = useQuery({
    queryKey: ['resources', 'video', hymnId],
    queryFn: () => getVideoResources(hymnId || ''),
    enabled: !!hymnId
  });

  // Upload PDF file mutation
  const uploadPdfMutation = useMutation({
    mutationFn: ({file, description}: {file: File, description: string}) => {
      if (!user?.id) {
        throw new Error('You must be logged in to upload files');
      }
      if (!hymnId) {
        throw new Error('No hymn ID provided');
      }
      return uploadPdfFile(file, hymnId, description, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', 'pdf', hymnId] });
      addNotification({
        type: 'success',
        title: 'Upload thành công',
        message: 'File PDF đã được upload thành công.',
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Upload thất bại',
        message: `Không thể upload file: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        duration: 5000
      });
    }
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: ({resourceId, resourceType}: {resourceId: string, resourceType: 'pdf' | 'audio' | 'video' | 'presentation'}) => {
      if (!user?.id) {
        throw new Error('You must be logged in to delete resources');
      }
      return deleteResource(resourceId, resourceType, user.id, user.isAdmin || user.isEditor);
    },
    onSuccess: (_, variables) => {
      const resourceType = variables.resourceType;
      queryClient.invalidateQueries({ queryKey: ['resources', resourceType, hymnId] });
      addNotification({
        type: 'success',
        title: 'Xóa thành công',
        message: `${resourceType.toUpperCase()} đã được xóa thành công`,
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Xóa thất bại',
        message: `Không thể xóa tài nguyên: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        duration: 5000
      });
    }
  });

  return {
    pdfs: pdfsQuery.data || [],
    audios: audiosQuery.data || [],
    videos: videosQuery.data || [],
    isLoadingPdfs: pdfsQuery.isLoading,
    isLoadingAudios: audiosQuery.isLoading,
    isLoadingVideos: videosQuery.isLoading,
    error: pdfsQuery.error || audiosQuery.error || videosQuery.error,
    uploadPdf: (file: File, description: string) => uploadPdfMutation.mutate({ file, description }),
    deleteResource: (resourceId: string, resourceType: 'pdf' | 'audio' | 'video' | 'presentation') => 
      deleteResourceMutation.mutate({ resourceId, resourceType }),
    isUploading: uploadPdfMutation.isPending,
    isDeleting: deleteResourceMutation.isPending
  };
}
