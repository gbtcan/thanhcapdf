import { supabase } from './supabase';

// Reputation point values
export const REPUTATION_POINTS = {
  POST_CREATED: 5,
  COMMENT_ADDED: 2,
  POST_LIKE_RECEIVED: 10,
  COMMENT_LIKE_RECEIVED: 5,
  FEATURED_POST: 25
};

/**
 * Record a reputation event for a user
 */
export async function addReputationPoints(data: {
  userId: string;
  points: number;
  reason: string;
  postId?: string;
  commentId?: string;
}) {
  try {
    const { userId, points, reason, postId, commentId } = data;
    
    // Don't add zero points
    if (points === 0) return;
    
    const { error } = await supabase
      .from('reputation_events')
      .insert({
        user_id: userId,
        post_id: postId,
        comment_id: commentId,
        points,
        reason
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error adding reputation points:', error);
    // Don't throw here - reputation is a non-critical feature
  }
}

/**
 * Get a user's reputation history
 */
export async function getUserReputationHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('reputation_events')
      .select(`
        *,
        post:posts(id, title),
        comment:comments(id, content)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching reputation history:', error);
    throw error;
  }
}

/**
 * Get the top users by reputation
 */
export async function getTopUsers(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, reputation')
      .order('reputation', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
}
