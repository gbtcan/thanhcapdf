import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';
import {
  fetchHymns,
  fetchHymnById,
  createHymn,
  updateHymn,
  deleteHymn,
  uploadPdfFile,
  uploadAudioFile,
  addVideoLink,
  uploadPresentationFile,
  deletePdfFile,
  deleteAudioFile,
  deleteVideoLink,
  deletePresentationFile
} from '../api/hymnsApi';
import {
  Hymn,
  HymnFilterParams,
  HymnFormData,
  HymnPdfFile,
  HymnAudioFile,
  HymnVideoLink,
  HymnPresentationFile
} from '../types/hymns';

/**
 * Hook for managing hymns list
 */
export function useHymns(params: HymnFilterParams = {}) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Fetch hymns
  const {
    data: hymnsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'hymns', params],
    queryFn: () => fetchHymns(params)
  });
  
  // Delete hymn
  const deleteMutation = useMutation({
    mutationFn: deleteHymn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa thánh ca',
        message: 'Thánh ca đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa thánh ca',
        message: error.message
      });
    }
  });
  
  return {
    hymns: hymnsData?.data || [],
    totalHymns: hymnsData?.total || 0,
    isLoading,
    error,
    refetch,
    
    // Actions
    deleteHymn: deleteMutation.mutateAsync,
    
    // States
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for managing a single hymn
 */
export function useHymnDetail(id: string | undefined) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  // Fetch hymn details
  const {
    data: hymnData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'hymn', id],
    queryFn: () => fetchHymnById(id!),
    enabled: !!id
  });
  
  // Update hymn
  const updateMutation = useMutation({
    mutationFn: (data: Partial<HymnFormData>) => updateHymn(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Thánh ca đã được cập nhật',
        message: 'Thông tin thánh ca đã được lưu thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể cập nhật thánh ca',
        message: error.message
      });
    }
  });
  
  // Delete hymn
  const deleteMutation = useMutation({
    mutationFn: () => deleteHymn(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      addNotification({
        type: 'success',
        title: 'Đã xóa thánh ca',
        message: 'Thánh ca đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa thánh ca',
        message: error.message
      });
    }
  });
  
  // Upload PDF file
  const uploadPdfMutation = useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return uploadPdfFile(id!, file, description, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'PDF đã được tải lên',
        message: 'Tệp PDF đã được tải lên thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể tải lên PDF',
        message: error.message
      });
    }
  });
  
  // Upload Audio file
  const uploadAudioMutation = useMutation({
    mutationFn: ({ 
      file, 
      description, 
      pdfId 
    }: { 
      file: File; 
      description?: string;
      pdfId?: string 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return uploadAudioFile(id!, file, description, pdfId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Audio đã được tải lên',
        message: 'Tệp audio đã được tải lên thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể tải lên audio',
        message: error.message
      });
    }
  });
  
  // Add Video link
  const addVideoMutation = useMutation({
    mutationFn: ({ 
      videoUrl, 
      source,
      description,
      pdfId 
    }: { 
      videoUrl: string; 
      source?: string;
      description?: string;
      pdfId?: string 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return addVideoLink(id!, videoUrl, source, description, pdfId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Đã thêm video',
        message: 'Liên kết video đã được thêm thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể thêm video',
        message: error.message
      });
    }
  });
  
  // Upload Presentation file
  const uploadPresentationMutation = useMutation({
    mutationFn: ({ 
      file, 
      description,
      source 
    }: { 
      file: File; 
      description?: string;
      source?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return uploadPresentationFile(id!, file, description, source, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Đã tải lên bản trình chiếu',
        message: 'Tệp trình chiếu đã được tải lên thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể tải lên bản trình chiếu',
        message: error.message
      });
    }
  });
  
  // Delete PDF file
  const deletePdfMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) => 
      deletePdfFile(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Đã xóa PDF',
        message: 'Tệp PDF đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa PDF',
        message: error.message
      });
    }
  });
  
  // Delete Audio file
  const deleteAudioMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath: string }) => 
      deleteAudioFile(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Đã xóa audio',
        message: 'Tệp audio đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa audio',
        message: error.message
      });
    }
  });
  
  // Delete Video link
  const deleteVideoMutation = useMutation({
    mutationFn: deleteVideoLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Đã xóa video',
        message: 'Liên kết video đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa video',
        message: error.message
      });
    }
  });
  
  // Delete Presentation file
  const deletePresentationMutation = useMutation({
    mutationFn: deletePresentationFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymn', id] });
      addNotification({
        type: 'success',
        title: 'Đã xóa bản trình chiếu',
        message: 'Tệp trình chiếu đã được xóa thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể xóa bản trình chiếu',
        message: error.message
      });
    }
  });
  
  return {
    hymn: hymnData?.hymn,
    pdfFiles: hymnData?.pdfFiles || [],
    audioFiles: hymnData?.audioFiles || [],
    videoLinks: hymnData?.videoLinks || [],
    presentationFiles: hymnData?.presentationFiles || [],
    isLoading,
    error,
    refetch,
    
    // Actions
    updateHymn: updateMutation.mutateAsync,
    deleteHymn: deleteMutation.mutateAsync,
    uploadPdf: uploadPdfMutation.mutateAsync,
    uploadAudio: uploadAudioMutation.mutateAsync,
    addVideo: addVideoMutation.mutateAsync,
    uploadPresentation: uploadPresentationMutation.mutateAsync,
    deletePdf: deletePdfMutation.mutateAsync,
    deleteAudio: deleteAudioMutation.mutateAsync,
    deleteVideo: deleteVideoMutation.mutateAsync,
    deletePresentation: deletePresentationMutation.mutateAsync,
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploadingPdf: uploadPdfMutation.isPending,
    isUploadingAudio: uploadAudioMutation.isPending,
    isAddingVideo: addVideoMutation.isPending,
    isUploadingPresentation: uploadPresentationMutation.isPending,
    isDeletingPdf: deletePdfMutation.isPending,
    isDeletingAudio: deleteAudioMutation.isPending,
    isDeletingVideo: deleteVideoMutation.isPending,
    isDeletingPresentation: deletePresentationMutation.isPending,
  };
}

/**
 * Hook for creating a new hymn
 */
export function useCreateHymn() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  // Create hymn mutation
  const createMutation = useMutation({
    mutationFn: (data: HymnFormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      return createHymn(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hymns'] });
      addNotification({
        type: 'success',
        title: 'Đã tạo thánh ca',
        message: 'Thánh ca mới đã được tạo thành công'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Không thể tạo thánh ca',
        message: error.message
      });
    }
  });
  
  return {
    createHymn: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
