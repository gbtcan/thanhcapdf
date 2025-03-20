import { supabase } from './supabase';
import { Post } from '../types/forum';

/**
 * Toggle bookmark status for a post
 */
export async function toggleBookmark(userId: string, postId: string): Promise<{ bookmarked: boolean }> {
  try {
    // Check if bookmark already exists
    const { data: existingBookmark, error: checkError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingBookmark) {
      // Remove bookmark
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
        
      if (deleteError) throw deleteError;
      
      return { bookmarked: false };
    } else {
      // Add bookmark
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          post_id: postId
        });
        
      if (insertError) throw insertError;
      
      return { bookmarked: true };
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

/**
 * Check if a post is bookmarked
 */
export async function isPostBookmarked(userId: string, postId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('post_id', postId);
      
    if (error) throw error;
    
    return count > 0;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    throw error;
  }
}

/**
 * Get user's bookmarked posts
 */
export async function getUserBookmarks(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ posts: Post[], totalCount: number }> {
  try {
    // Calculate pagination offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // First get the bookmarks with post data
    const { data: bookmarks, error: bookmarksError, count } = await supabase
      .from('bookmarks')
      .select(`
        post_id,
        created_at,
        posts!inner(
          *,
          user:users(*),
          hymn:hymns(id, title),
          comments:comments(count),
          likes:likes(count),
          tags:post_tags(tags(*))
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (bookmarksError) throw bookmarksError;
    
    // Transform the data to match our Post type
    const posts = bookmarks.map(bookmark => {
      const post = bookmark.posts;
      return {
        ...post,
        tags: post.tags?.map((pt: any) => pt.tags) || [],
        _count: {
          comments: post.comments?.[0]?.count || 0,
          likes: post.likes?.[0]?.count || 0
        }
      };
    });
    
    return {
      posts,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    throw error;
  }
}
