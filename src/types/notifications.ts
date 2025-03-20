import { Tables } from './database.types';

/**
 * Notifications-related type definitions
 */

export type NotificationType =
  | 'comment'
  | 'reply'
  | 'mention'
  | 'favorite'
  | 'hymn_status'
  | 'forum_post'
  | 'direct_message'
  | 'system'
  | 'contribution';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
  read_at: string | null;
  sender_id?: string;
  related_id?: string;
  related_type?: 'hymn' | 'forum_post' | 'comment' | 'user';
}

export interface EmailNotification extends Notification {
  email_sent: boolean;
  email_sent_at: string | null;
}

export interface PushNotification extends Notification {
  push_sent: boolean;
  push_sent_at: string | null;
  push_token?: string;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export interface NotificationBatch {
  unread: number;
  total: number;
  groups: NotificationGroup[];
}

export interface NotificationFilterOptions {
  type?: NotificationType[];
  read?: boolean;
  from?: string; // ISO date string
  to?: string; // ISO date string
  limit?: number;
}

export interface NotificationPreference {
  type: NotificationType;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface UserNotificationState {
  totalUnread: number;
  lastChecked: string | null;
  preferences: Record<NotificationType, NotificationPreference>;
}
