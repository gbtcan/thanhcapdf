import { supabaseClient } from '../../../lib/supabase/client';
import { handleSupabaseError } from '../../../core/utils/error-handler';
import { 
  Post, 
  Hymn, 
  Comment, 
  ContentFilterParams, 
  CommentFilterParams,
  ContentStatistics 
} from '../types/content';

/**
 * Fetch paginated posts with filtering
 */
export async function fetchPosts(params: ContentFilterParams = {}): Promise<{ data: Post[], total: number }> {
  try {
    const {
      search = '',
      status = 'published',
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 0,
      pageSize = 10,
      userId = null
    } = params;

    let query = supabaseClient
      .from('posts')
      .select(`
        *,
        user:user_id(id, email, profiles:users_profile!user_id(full_name, avatar_url)),
        likes:post_likes!post_id(count)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Format response
    const posts = data?.map(post => ({
      ...post,
      author: post.user ? {
        id: post.user.id,
        email: post.user.email,
        name: post.user.profiles?.full_name || post.user.email,
        avatar: post.user.profiles?.avatar_url
      } : null,
      likesCount: post.likes?.length ? post.likes[0].count : 0
    }));

    return {
      data: posts || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single post by ID
 */
export async function fetchPostById(id: number): Promise<Post> {
  try {
    const { data, error } = await supabaseClient
      .from('posts')
      .select(`
        *,
        user:user_id(id, email, profiles:users_profile!user_id(full_name, avatar_url)),
        likes:post_likes!post_id(count),
        comments:comments!post_id(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Post not found');

    // Format response
    return {
      ...data,
      author: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.profiles?.full_name || data.user.email,
        avatar: data.user.profiles?.avatar_url
      } : null,
      likesCount: data.likes?.length ? data.likes[0].count : 0,
      commentsCount: data.comments?.length ? data.comments[0].count : 0
    };
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update a post
 */
export async function updatePost(id: number, postData: Partial<Post>): Promise<Post> {
  try {
    // Remove derived properties
    const { author, likesCount, commentsCount, ...updateData } = postData;

    const { data, error } = await supabaseClient
      .from('posts')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update post');

    return data as Post;
  } catch (error) {
    console.error(`Error updating post with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a post
 */
export async function deletePost(id: number): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting post with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch paginated hymns with filtering
 */
export async function fetchHymns(params: ContentFilterParams = {}): Promise<{ data: Hymn[], total: number }> {
  try {
    const {
      search = '',
      status = 'published',
      sortBy = 'title',
      sortOrder = 'asc',
      page = 0,
      pageSize = 10
    } = params;

    let query = supabaseClient
      .from('hymns_new')
      .select(`
        *,
        user:created_by(id, email, profiles:users_profile!user_id(full_name, avatar_url))
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,lyrics.ilike.%${search}%`);
    }
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Format response
    const hymns = data?.map(hymn => ({
      ...hymn,
      author: hymn.user ? {
        id: hymn.user.id,
        email: hymn.user.email,
        name: hymn.user.profiles?.full_name || hymn.user.email,
        avatar: hymn.user.profiles?.avatar_url
      } : null
    }));

    return {
      data: hymns || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching hymns:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch a single hymn by ID
 */
export async function fetchHymnById(id: number): Promise<Hymn> {
  try {
    const { data, error } = await supabaseClient
      .from('hymns_new')
      .select(`
        *,
        user:created_by(id, email, profiles:users_profile(full_name, avatar_url))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Hymn not found');

    // Format response
    return {
      ...data,
      author: data.user ? {
        id: data.user.id,
        email: data.user.email,
        name: data.user.profiles?.full_name || data.user.email,
        avatar: data.user.profiles?.avatar_url
      } : null
    };
  } catch (error) {
    console.error(`Error fetching hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update a hymn
 */
export async function updateHymn(id: number, hymnData: Partial<Hymn>): Promise<Hymn> {
  try {
    // Remove derived properties
    const { author, ...updateData } = hymnData;

    const { data, error } = await supabaseClient
      .from('hymns_new')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update hymn');

    return data as Hymn;
  } catch (error) {
    console.error(`Error updating hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a hymn
 */
export async function deleteHymn(id: number): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('hymns_new')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting hymn with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch paginated comments with filtering
 */
export async function fetchComments(params: CommentFilterParams = {}): Promise<{ data: Comment[], total: number }> {
  try {
    const {
      search = '',
      status = 'all',
      postId = null,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 0,
      pageSize = 10
    } = params;

    let query = supabaseClient
      .from('comments')
      .select(`
        *,
        user:user_id(id, email, profiles:users_profile!user_id(full_name, avatar_url)),
        post:post_id!post_id(id, title)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (postId) {
      query = query.eq('post_id', postId);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Format response
    const comments = data?.map(comment => ({
      ...comment,
      author: comment.user ? {
        id: comment.user.id,
        email: comment.user.email,
        name: comment.user.profiles?.full_name || comment.user.email,
        avatar: comment.user.profiles?.avatar_url
      } : null,
      postTitle: comment.post?.title || 'Unknown Post'
    }));

    return {
      data: comments || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw handleSupabaseError(error);
  }
}

/**
 * Update a comment
 */
export async function updateComment(id: number, commentData: Partial<Comment>): Promise<Comment> {
  try {
    // Remove derived properties
    const { author, postTitle, ...updateData } = commentData;

    const { data, error } = await supabaseClient
      .from('comments')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update comment');

    return data as Comment;
  } catch (error) {
    console.error(`Error updating comment with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(id: number): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting comment with id ${id}:`, error);
    throw handleSupabaseError(error);
  }
}

/**
 * Fetch content statistics
 */
export async function fetchContentStatistics(): Promise<ContentStatistics> {
  try {
    // Execute queries in parallel
    const [postsResult, hymnsResult, commentsResult, viewsResult, likesResult] = await Promise.all([
      // Total posts count
      supabaseClient
        .from('posts')
        .select('*', { count: 'exact', head: true }),
      
      // Total hymns count
      supabaseClient
        .from('hymns_new')
        .select('*', { count: 'exact', head: true }),
      
      // Total comments count
      supabaseClient
        .from('comments')
        .select('*', { count: 'exact', head: true }),
      
      // Total views count
      supabaseClient
        .from('hymn_views')
        .select('*', { count: 'exact', head: true }),
      
      // Total likes count (combining post_likes and hymn_likes)
      Promise.all([
        supabaseClient
          .from('post_likes')
          .select('*', { count: 'exact', head: true }),
        supabaseClient
          .from('hymn_likes')
          .select('*', { count: 'exact', head: true })
      ])
    ]);
    
    // Handle errors
    if (postsResult.error) throw postsResult.error;
    if (hymnsResult.error) throw hymnsResult.error;
    if (commentsResult.error) throw commentsResult.error;
    if (viewsResult.error) throw viewsResult.error;
    if (likesResult[0].error) throw likesResult[0].error;
    if (likesResult[1].error) throw likesResult[1].error;
    
    // Get recent activity metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
    
    const [recentPostsResult, recentHymnsResult, recentCommentsResult] = await Promise.all([
      // Recent posts (last 30 days)
      supabaseClient
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoStr),
      
      // Recent hymns (last 30 days)
      supabaseClient
        .from('hymns_new')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoStr),
      
      // Recent comments (last 30 days)
      supabaseClient
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoStr),
    ]);
    
    if (recentPostsResult.error) throw recentPostsResult.error;
    if (recentHymnsResult.error) throw recentHymnsResult.error;
    if (recentCommentsResult.error) throw recentCommentsResult.error;
    
    // Compile statistics
    return {
      totalPosts: postsResult.count || 0,
      totalHymns: hymnsResult.count || 0,
      totalComments: commentsResult.count || 0,
      totalViews: viewsResult.count || 0,
      totalLikes: (likesResult[0].count || 0) + (likesResult[1].count || 0),
      recentPosts: recentPostsResult.count || 0,
      recentHymns: recentHymnsResult.count || 0,
      recentComments: recentCommentsResult.count || 0
    };
  } catch (error) {
    console.error('Error fetching content statistics:', error);
    throw handleSupabaseError(error);
  }
}
