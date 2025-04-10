import { supabase } from '../../../lib/supabase';
import { 
  ForumPost, 
  ForumReply, 
  ForumCategory,
  ForumPostFilter,
  ForumStats 
} from '../types';

/**
 * Get forum categories
 */
export async function getForumCategories(): Promise<ForumCategory[]> {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select(`
        *,
        forum_posts(count)
      `)
      .order('sort_order', { ascending: true });
      
    if (error) throw error;
    
    return data?.map(category => ({
      ...category,
      post_count: category.forum_posts?.[0]?.count || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    throw error;
  }
}

/**
 * Get forum posts with filter options and pagination
 */
export async function getForumPosts(
  filter: ForumPostFilter = {}, 
  page = 0, 
  pageSize = 10
): Promise<{ posts: ForumPost[], count: number }> {
  try {
    let query = supabase
      .from('forum_posts')
      .select(`
        *,
        user:user_id!user_id(
          id,
          display_name,
          avatar_url,
          reputation
        ),
        likes_count:post_likes!post_id(count),
        replies_count:post_replies!post_id(count)
      `, { count: 'exact' });
    
    // Apply filters
    if (filter.category_id) {
      query = query.eq('category_id', filter.category_id);
    }
    
    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id);
    }
    
    if (filter.hymn_id) {
      query = query.eq('hymn_id', filter.hymn_id);
    }
    
    if (filter.search) {
      query = query.or(`title.ilike.%${filter.search}%,content.ilike.%${filter.search}%`);
    }
    
    if (filter.tags && filter.tags.length > 0) {
      // This is a simplified approach and may need to be adjusted based on your DB structure
      query = query.contains('tags', filter.tags);
    }
    
    // Apply sorting
    switch (filter.sort) {
      case 'most_viewed':
        query = query.order('view_count', { ascending: false });
        break;
      case 'most_liked':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'most_replied':
        query = query.order('replies_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }
    
    // Pinned posts always come first
    query = query.order('is_pinned', { ascending: false });
    
    // Apply pagination
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    
    // Execute query
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    return { 
      posts: data || [], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    throw error;
  }
}

/**
 * Get a single forum post by ID
 */
export async function getForumPostById(id: string): Promise<ForumPost> {
  try {
    // First, increment view count
    await supabase.rpc('increment_post_view', { post_id: id });
    
    // Then fetch post with related data
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        user:user_id!user_id(
          id, 
          display_name, 
          avatar_url, 
          reputation,
          join_date:created_at
        ),
        likes_count:post_likes!post_id(count),
        replies_count:post_replies!post_id(count),
        category:category_id!category_id(id, name, slug)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Post not found');
    
    return data;
  } catch (error) {
    console.error('Error fetching forum post:', error);
    throw error;
  }
}

/**
 * Create a new forum post
 */
export async function createForumPost(
  title: string,
  content: string,
  userId: string,
  categoryId: string,
  hymnId?: string,
  tags?: string[]
): Promise<ForumPost> {
  try {
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        title,
        content,
        user_id: userId,
        category_id: categoryId,
        hymn_id: hymnId,
        tags,
        slug,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
}

/**
 * Get replies for a post
 */
export async function getPostReplies(
  postId: string, 
  parentId: string | null = null,
  page = 0, 
  pageSize = 50
): Promise<{ replies: ForumReply[], count: number }> {
  try {
    let query = supabase
      .from('post_replies')
      .select(`
        *,
        user:user_id!user_id(
          id,
          display_name,
          avatar_url,
          reputation
        ),
        likes_count:reply_likes!reply_id(count)
      `, { count: 'exact' })
      .eq('post_id', postId);
    
    // Filter by parent_id
    if (parentId === null) {
      query = query.is('parent_id', null); // Only root replies
    } else {
      query = query.eq('parent_id', parentId); // Only replies to a specific comment
    }
    
    // Apply sorting
    query = query.order('is_solution', { ascending: false }); // Solutions first
    query = query.order('created_at', { ascending: true }); // Oldest first
    
    // Apply pagination
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    
    const { data, count, error } = await query;
    
    if (error) throw error;
    
    return {
      replies: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching post replies:', error);
    throw error;
  }
}

/**
 * Create a reply to a post
 */
export async function createPostReply(
  postId: string,
  content: string,
  userId: string,
  parentId?: string
): Promise<ForumReply> {
  try {
    const { data, error } = await supabase
      .from('post_replies')
      .insert({
        post_id: postId,
        content,
        user_id: userId,
        parent_id: parentId,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post reply:', error);
    throw error;
  }
}

/**
 * Get forum statistics
 */
export async function getForumStats(): Promise<ForumStats> {
  try {
    const [
      { count: totalPosts },
      { count: totalReplies },
      { count: totalUsers },
      { count: activeUsersToday }
    ] = await Promise.all([
      supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('post_replies')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);
    
    return {
      total_posts: totalPosts || 0,
      total_replies: totalReplies || 0,
      total_users: totalUsers || 0,
      active_users_today: activeUsersToday || 0
    };
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    throw { 
      total_posts: 0, 
      total_replies: 0, 
      total_users: 0, 
      active_users_today: 0 
    };
  }
}
