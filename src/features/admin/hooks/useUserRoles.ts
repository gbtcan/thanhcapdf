import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getRoles, updateUserRole } from '../api/adminApi';
import { UserRoleUpdate } from '../types';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../contexts/NotificationContext';

/**
 * Hook for managing user roles in the admin interface
 */
export function useUserRoles() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const pageSize = 10;
  
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  // Get users with pagination and search
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => getUsers(page, pageSize, search),
    keepPreviousData: true
  });
  
  // Get available roles
  const rolesQuery = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: getRoles,
  });
  
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (update: UserRoleUpdate) => updateUserRole(update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      addNotification({
        type: 'success',
        title: 'Vai trò đã cập nhật',
        message: 'Vai trò của người dùng đã được cập nhật thành công.',
        duration: 3000
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Lỗi cập nhật vai trò',
        message: `Không thể cập nhật vai trò: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        duration: 5000
      });
    }
  });
  
  // Pagination functions
  const nextPage = () => {
    if (usersQuery.data && usersQuery.data.users.length === pageSize) {
      setPage(p => p + 1);
    }
  };
  
  const previousPage = () => {
    setPage(p => Math.max(0, p - 1));
  };
  
  // Handler for changing a user's role
  const handleRoleChange = (userId: string, roleId: number) => {
    if (!user?.isAdmin) {
      addNotification({
        type: 'error',
        title: 'Không đủ quyền',
        message: 'Bạn không có quyền thay đổi vai trò người dùng.',
        duration: 3000
      });
      return;
    }
    
    updateRoleMutation.mutate({
      userId,
      roleId
    });
  };
  
  return {
    users: usersQuery.data?.users || [],
    totalUsers: usersQuery.data?.count || 0,
    roles: rolesQuery.data || [],
    isLoading: usersQuery.isLoading || rolesQuery.isLoading,
    isUpdating: updateRoleMutation.isPending,
    error: usersQuery.error || rolesQuery.error,
    page,
    search,
    setSearch,
    nextPage,
    previousPage,
    handleRoleChange
  };
}
