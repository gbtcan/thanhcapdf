import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Check, Trash2, RefreshCw, ArrowLeft, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchNotifications, markNotificationsAsRead } from '../lib/notificationService';
import { formatRelativeTime, formatDate } from '../utils/dateUtils';
import PageLayout from '../components/PageLayout';
import LoadingIndicator from '../components/LoadingIndicator';
import AlertBanner from '../components/AlertBanner';
import TabNavigation from '../components/TabNavigation';
import type { Notification, NotificationType } from '../types/notifications';

const Notifications: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<'all' | 'unread'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/notifications';
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id, 100), // Fetch all, then filter on client
    enabled: !!isAuthenticated && !!user,
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markNotificationsAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationsAsRead(user!.id, [notificationId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.post_id) {
      window.location.href = `/forum/post/${notification.post_id}`;
    }
  };

  // Toggle notification type filter
  const toggleTypeFilter = (type: NotificationType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Filter notifications based on current tab and selected types
  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = currentTab === 'all' || (currentTab === 'unread' && !notification.read);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(notification.type);
    return matchesTab && matchesType;
  });

  // Paginate notifications
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  // Get notification type label
  const getNotificationTypeLabel = (type: NotificationType): string => {
    switch (type) {
      case 'comment_reply': return 'Reply';
      case 'post_like': return 'Post Like';
      case 'comment_like': return 'Comment Like';
      case 'post_mention': return 'Mention in Post';
      case 'comment_mention': return 'Mention in Comment';
      case 'post_featured': return 'Post Featured';
      default: return 'Notification';
    }
  };

  // Get notification color based on type
  const getNotificationTypeColor = (type: NotificationType): string => {
    switch (type) {
      case 'comment_reply': return 'bg-blue-100 text-blue-800';
      case 'post_like': return 'bg-pink-100 text-pink-800';
      case 'comment_like': return 'bg-purple-100 text-purple-800';
      case 'post_mention': return 'bg-yellow-100 text-yellow-800';
      case 'comment_mention': return 'bg-yellow-100 text-yellow-800';
      case 'post_featured': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return null; // Redirect handled by useEffect
  }

  return (
    <PageLayout title="Notifications">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Filter notifications"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Mark all as read"
              disabled={markAllAsReadMutation.isPending || notifications.every(n => n.read)}
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        </div>

        <TabNavigation
          tabs={[
            { id: 'all', label: 'All Notifications', count: notifications.length },
            { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length }
          ]}
          activeTab={currentTab}
          onChange={(tabId) => {
            setCurrentTab(tabId as 'all' | 'unread');
            setCurrentPage(1);
          }}
          className="mb-4"
        />

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by type</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTypes([])}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedTypes.length === 0
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Types
              </button>
              {['comment_reply', 'post_like', 'comment_like', 'post_mention', 'comment_mention', 'post_featured'].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type as NotificationType)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedTypes.includes(type as NotificationType)
                      ? getNotificationTypeColor(type as NotificationType)
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {getNotificationTypeLabel(type as NotificationType)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notifications list */}
        {error ? (
          <AlertBanner
            type="error"
            title="Failed to load notifications"
            message="There was an error loading your notifications. Please try again."
          />
        ) : isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingIndicator size="large" message="Loading notifications..." />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-2 text-gray-500">
              {currentTab === 'unread'
                ? "You've read all your notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {paginatedNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <Bell className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div>
                          <p className="text-sm text-gray-800">
                            {renderNotificationContent(notification)}
                          </p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span className="inline-block">
                              {formatRelativeTime(new Date(notification.created_at))}
                            </span>
                            <span 
                              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getNotificationTypeColor(notification.type)}`}
                            >
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

// Helper function to render content based on notification type
function renderNotificationContent(notification: Notification): React.ReactNode {
  const actorName = notification.actor?.name || 'Someone';
  const postTitle = notification.post?.title || 'a post';
  
  switch (notification.type) {
    case 'comment_reply':
      return (
        <span>
          <span className="font-medium">{actorName}</span> replied to your comment in <span className="font-medium">{postTitle}</span>
        </span>
      );
    case 'post_like':
      return (
        <span>
          <span className="font-medium">{actorName}</span> liked your post <span className="font-medium">{postTitle}</span>
        </span>
      );
    case 'comment_like':
      return (
        <span>
          <span className="font-medium">{actorName}</span> liked your comment in <span className="font-medium">{postTitle}</span>
        </span>
      );
    case 'post_mention':
      return (
        <span>
          <span className="font-medium">{actorName}</span> mentioned you in <span className="font-medium">{postTitle}</span>
        </span>
      );
    case 'comment_mention':
      return (
        <span>
          <span className="font-medium">{actorName}</span> mentioned you in a comment on <span className="font-medium">{postTitle}</span>
        </span>
      );
    case 'post_featured':
      return (
        <span>
          Your post <span className="font-medium">{postTitle}</span> was featured by moderators
        </span>
      );
    default:
      return (
        <span>You have a new notification</span>
      );
  }
}

export default Notifications;
