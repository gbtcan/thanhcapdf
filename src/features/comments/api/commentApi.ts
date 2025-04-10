import { supabase } from '../../../lib/supabase';
import { Comment, CommentFormData, CommentFilter } from '../types';

/**
 * API functions for comments feature
 * Contains all direct Supabase database calls
 */

/**
 * Get comments with optional filters
 */
export async function getComments(filter: CommentFilter, page = 0, pageSize = 10) {
  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:user_id (id, display_name, avatar_url),
        replies:comment_replies!parent_id (count),
        likes:comment_likes (count)
      `, { count: 'exact' });

    // Apply filters
    if (filter.hymn_id) {
      query = query.eq('hymn_id', filter.hymn_id);
    }
    
    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id);
    }
    
    // Filter for parent comments vs replies
    if (filter.parent_id === null) {
      query = query.is('parent_id', null); // Only root comments
    } else if (filter.parent_id) {
      query = query.eq('parent_id', filter.parent_id); // Only replies to specific comment
    }
    
    // Apply sorting
    switch (filter.sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'likes':
        query = query.order('likes.count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }
    
    // Apply pagination
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    // Process data to flatten structure
    const comments = data?.map(item => ({
      ...item,
      reply_count: item.replies?.count || 0,
      likes_count: item.likes?.count || 0
    })) || [];
    
    return { comments, count: count || 0 };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Add a new comment
 */
export async function addComment(commentData: CommentFormData, userId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: commentData.content,
        hymn_id: commentData.hymn_id,
        user_id: userId,
        parent_id: commentData.parent_id || null,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:user_id (id, display_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Update an existing comment
 */
export async function updateComment(id: string, content: string, userId: string) {
  try {
    // First check if user owns the comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!existingComment || existingComment.user_id !== userId) {
      throw new Error('You do not have permission to edit this comment');
    }
    
    const { data, error } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(id: string, userId: string, isAdmin = false) {
  try {
    let canDelete = false;
    
    // Check if user can delete
    if (isAdmin) {
      canDelete = true;
    } else {
      const { data: comment, error } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      canDelete = comment.user_id === userId;
    }
    
    if (!canDelete) {
      throw new Error('You do not have permission to delete this comment');
    }
    
    // Soft delete - mark as deleted but keep the record
    const { data, error } = await supabase
      .from('comments')
      .update({
        is_deleted: true,
        content: '[Bình luận đã bị xóa]',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Toggle like on a comment
 */
export async function toggleLikeComment(commentId: string, userId: string): Promise<boolean> {
  try {
    // Check if already liked
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingLike) {
      // Unlike - remove the like
      const { error: unlikeError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (unlikeError) throw unlikeError;
      return false; // Not liked anymore
    } else {
      // Like - add a new like
      const { error: likeError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
        
      if (likeError) throw likeError;
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
}

/**
 * Check if a user has liked a comment
 */
export async function hasLikedComment(commentId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking comment like:', error);
    return false;
  }
}
