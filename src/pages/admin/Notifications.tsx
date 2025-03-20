import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronDown, ChevronUp, RefreshCw, Trash2, Bell, 
  AlertTriangle, CheckCircle, Send, Users
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../utils/dateUtils';
import { AdminLayout } from '../../components/admin';
import LoadingIndicator from '../../components/LoadingIndicator';
import AlertBanner from '../../components/AlertBanner';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { NotificationType } from '../../types/notifications';
import { UserRole } from '../../types';

interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  created_at: string;
  read: boolean;
  actor_id?: string;
  post_id?: string;
  comment_id?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  actor?: {
    id: string;
    name: string;
  };
  post?: {
    id: string;
    title: string;
  };
}

const AdminNotifications: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{
    read?: boolean;
    type?: NotificationType;
    userId?: string;
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    order: 'asc' | 'desc';
  }>({ field: 'created_at', order: 'desc' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    targetGroup: 'all',
    userIds: [] as string[],
    type: 'post_featured' as NotificationType,
    message: '',
    link: '',
    postId: ''
  });

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-notifications', currentPage, pageSize, filters, sortConfig],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          user:users!user_id(id, name, email),
          actor:users!actor_id(id, name),
          post:posts(id, title)
        `, { count: 'exact' });

      // Apply filters
      if (filters.read !== undefined) {
        query = query.eq('read', filters.read);
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      // Apply sorting
      query = query.order(sortConfig.field, { ascending: sortConfig.order === 'asc' });
      
      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        notifications: data as NotificationItem[],
        totalCount: count || 0
      };
    }
  });

  // Delete notification mutation
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  // Create notification mutation
  const createNotification = useMutation({
    mutationFn: async (data: {
      targetUserIds: string[];
      type: NotificationType;
      message: string;
      linkUrl?: string;
      postId?: string;
    }) => {
      const { targetUserIds, type, message, linkUrl, postId } = data;
      
      // Prepare notifications to insert
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        type,
        message,
        link_url: linkUrl,
        post_id: postId,
        read: false
      }));
      
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
        
      if (error) throw error;
      
      return notifications;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowCreateForm(false);
      setFormData({
        targetGroup: 'all',
        userIds: [],
        type: 'post_featured',
        message: '',
        link: '',
        postId: ''
      });
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil((notificationsData?.totalCount || 0) / pageSize);

  // Handle sort
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get notification type display
  const getNotificationTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case 'comment_reply': return 'Comment Reply';
      case 'post_like': return 'Post Like';
      case 'comment_like': return 'Comment Like';
      case 'post_mention': return 'Post Mention';
      case 'comment_mention': return 'Comment Mention';
      case 'post_featured': return 'Post Featured';
      default: return 'Unknown';
    }
  };

  // Get badge color for notification type
  const getNotificationTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'comment_reply': return 'blue';
      case 'post_like': return 'primary';
      case 'comment_like': return 'purple';
      case 'post_mention': return 'warning';
      case 'comment_mention': return 'warning';
      case 'post_featured': return 'success';
      default: return 'neutral';
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Determine target users
      let targetUserIds: string[] = [];
      
      if (formData.targetGroup === 'all') {
        // Get all user IDs
        const { data, error } = await supabase
          .from('users')
          .select('id');
          
        if (error) throw error;
        targetUserIds = data.map(user => user.id);
      } 
      else {
        targetUserIds = formData.userIds;
      }
      
      if (targetUserIds.length === 0) {
        alert('No users selected');
        return;
      }
      
      // Create notification
      await createNotification.mutateAsync({
        targetUserIds,
        type: formData.type,
        message: formData.message,
        linkUrl: formData.link || undefined,
        postId: formData.postId || undefined
      });
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <AdminLayout 
      title="Notification Management" 
      description="View and manage system notifications"
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
            <p className="text-sm text-gray-500">View and manage all system notifications</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </button>
            
            <button
              onClick={() => refetch()}
              className="bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md text-sm font-medium border border-gray-300 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Create notification modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Send New Notification</h2>
                  <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Target selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Send to</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="target-all" 
                          name="targetGroup"
                          checked={formData.targetGroup === 'all'}
                          onChange={() => setFormData(prev => ({ ...prev, targetGroup: 'all' }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="target-all" className="ml-2 block text-sm text-gray-700">
                          All users
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="target-specific" 
                          name="targetGroup"
                          checked={formData.targetGroup === 'specific'}
                          onChange={() => setFormData(prev => ({ ...prev, targetGroup: 'specific' }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="target-specific" className="ml-2 block text-sm text-gray-700">
                          Specific users
                        </label>
                      </div>
                      
                      {formData.targetGroup === 'specific' && (
                        <div className="ml-6">
                          <select
                            multiple
                            value={formData.userIds}
                            onChange={(e) => {
                              const selected = Array.from(
                                e.target.selectedOptions,
                                option => option.value
                              );
                              setFormData(prev => ({ ...prev, userIds: selected }));
                            }}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
                          >
                            {/* This would be populated from a users query */}
                            <option value="user1">User 1</option>
                            <option value="user2">User 2</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Notification type */}
                  <div className="mb-4">
                    <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700 mb-1">
                      Notification type
                    </label>
                    <select
                      id="notificationType"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        type: e.target.value as NotificationType 
                      }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="post_featured">Post Featured</option>
                      <option value="post_mention">Post Mention</option>
                      <option value="comment_mention">Comment Mention</option>
                    </select>
                  </div>
                  
                  {/* Message */}
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      rows={3}
                      placeholder="Enter notification message"
                    />
                  </div>
                  
                  {/* Link URL */}
                  <div className="mb-4">
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                      Link URL (optional)
                    </label>
                    <input
                      type="text"
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="/path/to/page or https://example.com"
                    />
                  </div>
                  
                  {/* Post ID */}
                  <div className="mb-6">
                    <label htmlFor="postId" className="block text-sm font-medium text-gray-700 mb-1">
                      Associated Post ID (optional)
                    </label>
                    <input
                      type="text"
                      id="postId"
                      value={formData.postId}
                      onChange={(e) => setFormData(prev => ({ ...prev, postId: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter post ID if applicable"
                    />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createNotification.isPending}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {createNotification.isPending ? 'Sending...' : 'Send Notification'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.read === undefined ? '' : String(filters.read)}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({
                    ...prev,
                    read: value === '' ? undefined : value === 'true'
                  }));
                }}
                className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => {
                  const value = e.target.value as NotificationType | '';
                  setFilters(prev => ({
                    ...prev,
                    type: value || undefined
                  }));
                }}
                className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">All types</option>
                <option value="comment_reply">Comment Reply</option>
                <option value="post_like">Post Like</option>
                <option value="comment_like">Comment Like</option>
                <option value="post_mention">Post Mention</option>
                <option value="comment_mention">Comment Mention</option>
                <option value="post_featured">Post Featured</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="block w-full shadow-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Error state */}
        {error && (
          <AlertBanner
            type="error"
            title="Error loading notifications"
            message={(error as Error).message || 'An unexpected error occurred'}
          />
        )}
        
        {/* Notifications table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <LoadingIndicator size="large" message="Loading notifications..." />
            </div>
          ) : notificationsData && notificationsData.notifications.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          className="flex items-center font-medium text-gray-500 hover:text-gray-700"
                          onClick={() => handleSort('type')}
                        >
                          Type
                          {sortConfig.field === 'type' && (
                            sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          className="flex items-center font-medium text-gray-500 hover:text-gray-700"
                          onClick={() => handleSort('user.name')}
                        >
                          User
                          {sortConfig.field === 'user.name' && (
                            sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          className="flex items-center font-medium text-gray-500 hover:text-gray-700"
                          onClick={() => handleSort('created_at')}
                        >
                          Date
                          {sortConfig.field === 'created_at' && (
                            sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          className="flex items-center font-medium text-gray-500 hover:text-gray-700"
                          onClick={() => handleSort('read')}
                        >
                          Status
                          {sortConfig.field === 'read' && (
                            sortConfig.order === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notificationsData.notifications.map((notification) => (
                      <tr key={notification.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={getNotificationTypeColor(notification.type)}>
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{notification.user?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{notification.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {notification.post && (
                              <span className="font-medium">{notification.post.title}</span>
                            )}
                            {notification.actor && (
                              <span> by {notification.actor.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500" title={notification.created_at}>
                            {formatRelativeTime(notification.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.read
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {notification.read ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => deleteNotification.mutate(notification.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteNotification.isPending}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No notifications found matching your filters.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
