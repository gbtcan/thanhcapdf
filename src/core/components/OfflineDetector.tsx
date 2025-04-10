import React, { useEffect } from 'react';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Component to detect offline state and show notifications/fallbacks
 * This component doesn't render anything - it just triggers notifications
 */
const OfflineDetector: React.FC = () => {
  const { isOnline, isInternetReachable, isSupabaseReachable } = useNetworkStatus();
  const { addNotification } = useNotifications();
  
  // Show notification when going offline
  useEffect(() => {
    if (!isOnline) {
      addNotification({
        id: 'offline-notification',
        type: 'warning',
        title: 'Đã mất kết nối',
        message: 'Thiết bị của bạn hiện đang ngoại tuyến. Một số tính năng có thể không hoạt động.',
        duration: 10000
      });
    }
  }, [isOnline, addNotification]);
  
  // Show notification when internet is unreachable but browser thinks we're online
  useEffect(() => {
    if (isOnline && !isInternetReachable) {
      addNotification({
        id: 'no-internet-notification',
        type: 'warning',
        title: 'Không có kết nối internet',
        message: 'Thiết bị có thể đang kết nối với mạng cục bộ nhưng không có internet.',
        duration: 10000
      });
    }
  }, [isOnline, isInternetReachable, addNotification]);
  
  // Show notification when API is unreachable
  useEffect(() => {
    if (isOnline && isInternetReachable && !isSupabaseReachable) {
      addNotification({
        id: 'api-unreachable-notification',
        type: 'error',
        title: 'Máy chủ không khả dụng',
        message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
        duration: 10000
      });
    }
  }, [isOnline, isInternetReachable, isSupabaseReachable, addNotification]);
  
  // Notify when connection is restored
  useEffect(() => {
    const previousStatus = React.useRef({
      isOnline: isOnline,
      isInternetReachable: isInternetReachable,
      isSupabaseReachable: isSupabaseReachable
    });
    
    if (
      (!previousStatus.current.isOnline && isOnline) ||
      (!previousStatus.current.isInternetReachable && isInternetReachable) ||
      (!previousStatus.current.isSupabaseReachable && isSupabaseReachable)
    ) {
      // Only notify if all are true (full connectivity restored)
      if (isOnline && isInternetReachable && isSupabaseReachable) {
        addNotification({
          id: 'online-notification',
          type: 'success',
          title: 'Đã khôi phục kết nối',
          message: 'Kết nối đã được khôi phục. Tất cả tính năng hiện đang hoạt động.',
          duration: 5000
        });
      }
    }
    
    // Update previous status
    previousStatus.current = {
      isOnline,
      isInternetReachable,
      isSupabaseReachable
    };
  }, [isOnline, isInternetReachable, isSupabaseReachable, addNotification]);
  
  // This component doesn't render anything
  return null;
};

export default OfflineDetector;
