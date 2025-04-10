import React, { createContext, useContext } from "react";
import { toast } from "../hooks/useToast";

// Types for backward compatibility
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create context with default values (won't be used but needed for compatibility)
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => "",
  removeNotification: () => {},
  clearNotifications: () => {},
});

/**
 * Hook to use notifications - now just forwards to toast system
 */
export const useNotifications = () => {
  return {
    notifications: [], // Empty array since we don't track notifications anymore
    addNotification: (notification: Omit<Notification, "id">) => {
      // Map notification types to toast variants
      const variantMap = {
        'success': 'success' as const,
        'error': 'destructive' as const,
        'warning': 'default' as const,
        'info': 'default' as const,
      };
      
      // Show notification as a toast instead
      const { id } = toast({
        variant: variantMap[notification.type],
        title: notification.title,
        description: notification.message,
        duration: notification.duration,
      });
      
      return id;
    },
    removeNotification: () => {},
    clearNotifications: () => {},
  };
};

/**
 * Empty provider that just renders children
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default NotificationContext;
