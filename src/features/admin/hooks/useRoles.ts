import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchRoles, 
  fetchRoleById, 
  createRole, 
  updateRole, 
  deleteRole,
  checkRoleUsage
} from '../api/roleApi';
import { Role, RoleFormData, RoleFilterParams } from '../types/roles';
import { useNotifications } from '../../../contexts/NotificationContext';

/**
 * Hook để quản lý danh sách vai trò
 */
export function useRoles(params: RoleFilterParams = {}) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Query để lấy danh sách vai trò
  const { 
    data: rolesData, 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['roles', params],
    queryFn: () => fetchRoles(params)
  });
  
  // Mutation để tạo vai trò mới
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã tạo vai trò mới'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể tạo vai trò: ${error.message}`
      });
    }
  });
  
  // Mutation để cập nhật vai trò
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RoleFormData> }) => 
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật vai trò'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể cập nhật vai trò: ${error.message}`
      });
    }
  });
  
  // Mutation để xóa vai trò
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa vai trò'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể xóa vai trò: ${error.message}`
      });
    }
  });
  
  return {
    roles: rolesData?.roles || [],
    totalRoles: rolesData?.total || 0,
    isLoading,
    error,
    refetch,
    
    // Actions
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

/**
 * Hook để quản lý chi tiết một vai trò
 */
export function useRoleDetail(id: number | undefined) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  
  // Query để lấy thông tin vai trò
  const { 
    data: role, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['role', id],
    queryFn: () => fetchRoleById(id!),
    enabled: !!id
  });
  
  // Query để kiểm tra xem vai trò có đang được sử dụng không
  const {
    data: usageCount,
    isLoading: isLoadingUsage
  } = useQuery({
    queryKey: ['roleUsage', id],
    queryFn: () => checkRoleUsage(id!),
    enabled: !!id
  });
  
  // Mutation để cập nhật vai trò
  const updateMutation = useMutation({
    mutationFn: (data: Partial<RoleFormData>) => updateRole(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role', id] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật vai trò'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể cập nhật vai trò: ${error.message}`
      });
    }
  });
  
  // Mutation để xóa vai trò
  const deleteMutation = useMutation({
    mutationFn: () => deleteRole(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addNotification({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa vai trò'
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi',
        message: `Không thể xóa vai trò: ${error.message}`
      });
    }
  });
  
  return {
    role,
    usageCount: usageCount || 0,
    isLoading: isLoading || isLoadingUsage,
    error,
    refetch,
    
    // Actions
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    
    // States
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isInUse: (usageCount || 0) > 0
  };
}
