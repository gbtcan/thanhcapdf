import { supabase } from './supabase';
import { handleSupabaseError } from '../utils/errorHandler';
import { ForumPost, ForumComment, ForumCategory, PostSearchParams, ForumSearchResults } from '../types/forum';

/**
 * Fetch all forum posts with pagination and filtering
 */
export async function fetchPosts(params: PostSearchParams = {}): Promise<ForumSearchResults> {
  try {
    const {
      query,
      categoryId,
      authorId,
      hymnId,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = params;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let postQuery = supabase
      .from('forum_posts')
      .select(`
        *,
        profiles!inner(id, display_name, avatar_url),
        forum_categories(id, name, slug),
        comments:forum_comments(id),
        likes:forum_likes(id),
        hymns_new(id, title)
      `, { count: 'exact' });

    // Apply text search if query is provided
    if (query) {
      postQuery = postQuery.or(`title.ilike.%${query}%, content.ilike.%${query}%`);
    }

    // Apply category filter
    if (categoryId) {
      postQuery = postQuery.eq('category_id', categoryId);
    }

    // Apply author filter
    if (authorId) {
      postQuery = postQuery.eq('author_id', authorId);
    }

    // Apply hymn filter
    if (hymnId) {
      postQuery = postQuery.eq('hymn_id', hymnId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        postQuery = postQuery.order('created_at', { ascending: false });
        break;
      case 'popular':
        postQuery = postQuery.order('like_count', { ascending: false });
        break;
      case 'comments':
        postQuery = postQuery.order('comment_count', { ascending: false });
        break;
      default:
        postQuery = postQuery.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    postQuery = postQuery.range(from, to);

    // Execute query
    const { data, error, count } = await postQuery;

    if (error) throw error;

    // Process results to match expected structure
    const posts = data.map(processPostRelations);

    return {
      posts,
      totalCount: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
      currentPage: page
    };
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single forum post by ID
 */
export async function fetchPostById(id: string): Promise<ForumPost | null> {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles!inner(id, display_name, avatar_url),
        forum_categories(id, name, slug),
        comments:forum_comments(
          id, 
          content, 
          created_at, 
          updated_at,
          author_id,
          profiles(id, display_name, avatar_url)
        ),
        likes:forum_likes(id, user_id),
        hymns_new(id, title)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    // Increment view count
    await incrementPostView(id);
    
    return processPostRelations(data);
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Create a new forum post
 */
export async function createPost(post: Partial<ForumPost>): Promise<ForumPost> {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([post])
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update an existing forum post
 */
export async function updatePost(id: string, updates: Partial<ForumPost>): Promise<ForumPost> {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a forum post
 */
export async function deletePost(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw handleSupabaseError(error);
    return false;
  }
}

/**
 * Increment post view count
 */
export async function incrementPostView(id: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_post_view', { post_id: id });
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error incrementing view count for post ${id}:`, error);
    // Don't throw, just log - this is a non-critical operation
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(comment: Partial<ForumComment>): Promise<ForumComment> {
  try {
    const { data, error } = await supabase
      .from('forum_comments')
      .insert([comment])
      .select(`
        *,
        profiles(id, display_name, avatar_url)
      `)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('forum_comments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting comment ${id}:`, error);
    throw handleSupabaseError(error);
    return false;
  }
}

/**
 * Toggle like on a post
 */
export async function togglePostLike(postId: string): Promise<boolean> {
  try {
    const { data: existingLike, error: checkError } = await supabase
      .from('forum_likes')
      .select('*')
      .eq('post_id', postId)
      .maybeSingle();
      
    if (checkError) throw checkError;
    
    if (existingLike) {
      // Remove like
      const { error: deleteError } = await supabase
        .from('forum_likes')
        .delete()
        .eq('id', existingLike.id);
        
      if (deleteError) throw deleteError;
      return false; // Not liked anymore
    } else {
      // Add like
      const { error: insertError } = await supabase
        .from('forum_likes')
        .insert({ post_id: postId });
        
      if (insertError) throw insertError;
      return true; // Now liked
    }
  } catch (error) {
    console.error(`Error toggling like for post ${postId}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch all forum categories
 */
export async function fetchCategories(): Promise<ForumCategory[]> {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Helper function to process post relations from Supabase response
 */
function processPostRelations(post: any): ForumPost {
  return {
    ...post,
    author: post.profiles,
    category: post.forum_categories,
    commentCount: post.comments?.length || 0,
    likeCount: post.likes?.length || 0,
    hymn: post.hymns_new
  };
}
