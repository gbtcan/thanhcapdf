import { supabase } from '../supabase';
import { ForumQueryParams, Post, PostWithDetails } from '../../types/forum';

/**
 * Fetch posts with optional filtering, pagination, and sorting
 */
export async function fetchPosts(params: ForumQueryParams = {}): Promise<{ posts: Post[]; totalCount: number }> {
  try {
    const {
      hymnId,
      userId,
      tagId,
      searchQuery,
      page = 1,
      limit = 10,
      sortBy = 'latest'
    } = params;
    
    // Calculate offset for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Start building the query
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(*),
        hymn:hymns(id, title),
        comments:comments(count),
        likes:likes(count),
        tags:post_tags!inner(tag_id, tags(*))
      `, { count: 'exact' });
    
    // Apply filters
    if (hymnId) query = query.eq('hymn_id', hymnId);
    if (userId) query = query.eq('user_id', userId);
    
    // Apply tag filter if specified
    if (tagId) {
      query = query.contains('post_tags.tag_id', [tagId]);
    }
    
    // Apply text search if specified
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.textSearch('search_vector', searchQuery);
    }
    
    // Apply sorting - now with pinned posts first
    if (sortBy === 'popular') {
      query = query.order('is_pinned', { ascending: false }) // Pinned posts first
               .order('likes.count', { ascending: false });  // Then by likes
    } else if (sortBy === 'comments') {
      query = query.order('is_pinned', { ascending: false }) // Pinned posts first
               .order('comments.count', { ascending: false }); // Then by comment count
    } else {
      // Default to latest
      query = query.order('is_pinned', { ascending: false }) // Pinned posts first
               .order('created_at', { ascending: false });   // Then by date
    }
    
    // Apply pagination
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Transform the response to match our Post type
    const posts = data.map(post => {
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
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// ... other forum-related API functions
