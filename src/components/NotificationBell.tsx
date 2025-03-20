import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, Clock, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchNotifications, markNotificationsAsRead } from '../lib/notificationService';
import { formatRelativeTime } from '../utils/dateUtils';
import type { Notification } from '../types/notifications';

const NotificationBell: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Fetch notifications
  const { 
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchNotifications(user!.id, 10),
    enabled: !!isAuthenticated && !!user,
    refetchInterval: 60000 // Refetch every minute
  });
  
  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  // Mark notifications as read
  const markAsReadMutation = useMutation({
    mutationFn: (ids?: string[]) => 
      markNotificationsAsRead(user!.id, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Mark all as read when opening dropdown
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAsReadMutation.mutate();
    }
  }, [isOpen, unreadCount]);
  
  // Handle clicking a notification
  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    
    // Navigate to the appropriate page based on notification type
    if (notification.post_id) {
      navigate(`/forum/post/${notification.post_id}`);
    }
  };
  
  // If not authenticated, don't show the bell
  if (!isAuthenticated) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon */}
      <button
        className="relative p-1.5 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
      >
        {unreadCount > 0 ? (
          <>
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 bg-indigo-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-indigo-700">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => markAsReadMutation.mutate()}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
          
          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">Failed to load notifications</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-gray-500">
                <BellOff className="h-6 w-6 mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <li 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Format based on notification type */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-800">
                          {renderNotificationContent(notification)}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatRelativeTime(new Date(notification.created_at))}</span>
                        </div>
                      </div>
                      
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="h-2 w-2 bg-indigo-600 rounded-full"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 text-center border-t border-gray-200">
            <button 
              className="text-xs text-gray-600 hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
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

export default NotificationBell;
