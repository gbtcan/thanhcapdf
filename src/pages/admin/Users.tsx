import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';
import { UserPlus, Search, Edit, Trash2, Shield, Mail, RefreshCw, Filter, UserCheck, UserX, Download } from 'lucide-react';
import AlertBanner from '../../components/AlertBanner';
import LoadingIndicator from '../../components/LoadingIndicator';
import Pagination from '../../components/Pagination';
import SearchInput from '../../components/SearchInput';
import { formatDate } from '../../utils/formatters';

const AdminUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const pageSize = 10;

  // Fetch roles for the filter dropdown
  const { data: roles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as UserRole[];
    }
  });

  // Fetch users with pagination and search
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', searchQuery, currentPage, selectedRole],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          avatar_url,
          created_at,
          last_login,
          roles (id, name)
        `, { count: 'exact' });
        
      // Apply role filter if not 'all'
      if (selectedRole !== 'all') {
        query = query.eq('role_id', selectedRole);
      }
      
      // Apply search if provided
      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }
      
      // Apply pagination
      query = query.range(from, to).order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        users: data as User[],
        count: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      };
    },
    keepPreviousData: true
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
  
  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string, roleId: number }) => {
      const { error } = await supabase
        .from('users')
        .update({ role_id: roleId })
        .eq('id', userId);
        
      if (error) throw error;
      return { userId, roleId };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });
  
  // Handle user deletion
  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };
  
  // Export users as CSV
  const exportUsers = async () => {
    try {
      // Fetch all users
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          display_name,
          created_at,
          last_login,
          roles (name)
        `);
        
      if (error) throw error;
      
      // Transform data for CSV
      const csvData = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        display_name: user.display_name || 'n/a',
        role: user.roles?.name || 'n/a',
        created_at: formatDate(user.created_at),
        last_login: user.last_login ? formatDate(user.last_login) : 'Never'
      }));
      
      // Convert to CSV
      const headers = ['ID', 'Email', 'Display Name', 'Role', 'Created At', 'Last Login'];
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) => Object.values(row).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export users. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </button>
          <button
            onClick={() => window.location.href = '/admin/users/new'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <SearchInput
            placeholder="Search users by email or name..."
            onSearch={setSearchQuery}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => refetch()}
            className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <AlertBanner
          type="error"
          title="Error loading users"
          message="There was a problem loading the user list. Please try again."
          className="mb-6"
        />
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingIndicator size="large" message="Loading users..." />
        </div>
      )}
      
      {/* Users table */}
      {!isLoading && !error && data && (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {data.users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No users found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    data.users.map((user: User) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.avatar_url}
                                  alt={`${user.display_name || 'User'}'s avatar`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                  <span className="text-lg font-medium text-indigo-700 dark:text-indigo-300">
                                    {(user.display_name || user.email?.charAt(0) || 'U').toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.display_name || 'Unnamed User'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {user.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.roles?.name === 'administrator' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : user.roles?.name === 'editor'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : user.roles?.name === 'moderator'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}>
                            {user.roles?.name || 'standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {user.last_login ? formatDate(user.last_login) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Email user */}
                            <a
                              href={`mailto:${user.email}`}
                              className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                              title="Email user"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                            
                            {/* Edit user */}
                            <a
                              href={`/admin/users/edit/${user.id}`}
                              className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </a>
                            
                            {/* Change role dropdown */}
                            {roles && (
                              <div className="relative inline-block text-left">
                                <select
                                  className="p-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                  value={user.roles?.id || ''}
                                  onChange={(e) => updateRoleMutation.mutate({ 
                                    userId: user.id, 
                                    roleId: parseInt(e.target.value)
                                  })}
                                >
                                  <option value="" disabled>Change role</option>
                                  {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            
                            {/* Delete user */}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              title="Delete user"
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage} 
                totalPages={data.totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
          
          {/* User stats */}
          <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-750 rounded-md">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total users: </span>
              <span className="font-medium text-gray-900 dark:text-white">{data.count}</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active: 
                  <span className="font-medium ml-1">
                    {data.users.filter((u: User) => u.last_login).length}
                  </span>
                </span>
              </div>
              <div className="flex items-center">
                <UserX className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Never logged in: 
                  <span className="font-medium ml-1">
                    {data.users.filter((u: User) => !u.last_login).length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
