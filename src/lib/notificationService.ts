import { supabase } from './supabase';
import type { Notification, NotificationCount, NotificationType } from '../types/notifications';

// Constants for reputation points
export const REPUTATION_POINTS = {
  POST_CREATED: 5,
  COMMENT_ADDED: 2,
  POST_LIKE_RECEIVED: 1,
  COMMENT_LIKE_RECEIVED: 1,
  FEATURED_POST: 10
};

/**
 * Fetch user notifications
 */
export async function fetchNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:users!actor_id(id, name, avatar_url),
        post:posts(id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      // Check if table doesn't exist
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get notification counts
 */
export async function getNotificationCount(userId: string): Promise<NotificationCount> {
  try {
    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (totalError) throw totalError;
    
    // Get unread count
    const { count: unread, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
      
    if (unreadError) throw unreadError;
    
    return {
      total: total || 0,
      unread: unread || 0
    };
  } catch (error) {
    console.error('Error getting notification count:', error);
    throw error;
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  try {
    let query = supabase
      .from('notifications')
      .update({ read: true });
      
    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      query = query.in('id', notificationIds);
    } else {
      // Mark all notifications as read
      query = query.eq('user_id', userId);
    }
    
    const { error } = await query;
    
    if (error) throw error;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
}

/**
 * Create a notification
 */
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  actorId?: string;
  postId?: string;
  commentId?: string;
}): Promise<void> {
  try {
    const { userId, type, actorId, postId, commentId } = data;
    
    // Don't create self-notifications
    if (actorId === userId) return;
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        actor_id: actorId,
        post_id: postId,
        comment_id: commentId,
        read: false
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Silently fail - notifications shouldn't break the app
  }
}

/**
 * Delete notifications related to an entity
 * Useful when a post or comment is deleted
 */
export async function deleteRelatedNotifications(data: {
  postId?: string;
  commentId?: string;
}): Promise<void> {
  try {
    const { postId, commentId } = data;
    
    if (!postId && !commentId) return;
    
    let query = supabase.from('notifications').delete();
    
    if (postId) {
      query = query.eq('post_id', postId);
    }
    
    if (commentId) {
      query = query.eq('comment_id', commentId);
    }
    
    const { error } = await query;
    
    if (error && error.code !== '42P01') throw error;
  } catch (error) {
    console.error('Error deleting related notifications:', error);
    // Silently fail - notifications shouldn't break the app
  }
}

/**
 * Add reputation points to a user
 */
export async function addReputationPoints(params: {
  userId: string;
  points: number;
  reason: string;
  postId?: string;
  commentId?: string;
}): Promise<void> {
  try {
    const { userId, points, reason, postId, commentId } = params;
    
    // First, add the reputation event
    const { error: eventError } = await supabase
      .from('reputation_events')
      .insert({
        user_id: userId,
        points,
        reason,
        post_id: postId,
        comment_id: commentId
      });
      
    if (eventError) {
      // If table doesn't exist, silently fail
      if (eventError.code === '42P01') return;
      throw eventError;
    }
    
    // Then, update the user's total reputation
    const { error: updateError } = await supabase.rpc('increment_user_reputation', {
      user_id: userId,
      points_to_add: points
    });
    
    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error adding reputation points:', error);
    // Silently fail - reputation shouldn't break the app
  }
}
