import { supabase } from '../../../lib/supabase';
import { AdminDashboardStats, ActivityLog, UserRoleUpdate } from '../types';

/**
 * Get stats for the admin dashboard
 */
export async function getDashboardStats(): Promise<AdminDashboardStats> {
  try {
    // Run queries in parallel for better performance
    const [
      { count: totalHymns },
      { count: totalUsers },
      { count: totalAuthors },
      { count: totalThemes },
      { count: totalViews },
      { count: totalComments }
    ] = await Promise.all([
      supabase.from('hymns_new').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('authors').select('*', { count: 'exact', head: true }),
      supabase.from('themes').select('*', { count: 'exact', head: true }),
      supabase.from('hymn_views').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalHymns: totalHymns || 0,
      totalUsers: totalUsers || 0,
      totalAuthors: totalAuthors || 0,
      totalThemes: totalThemes || 0,
      totalViews: totalViews || 0,
      totalComments: totalComments || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get the most viewed hymns for admin dashboard
 */
export async function getMostViewedHymns(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('hymns_new')
      .select(`
        id, 
        title, 
        view_count, 
        last_viewed_at
      `)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching most viewed hymns:', error);
    throw error;
  }
}

/**
 * Get recent activity for the admin dashboard
 */
export async function getRecentActivity(limit = 10): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:user_id (id, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}

/**
 * Get all users with their roles
 */
export async function getUsers(page = 0, pageSize = 10, search = '') {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        roles:role_id (id, name)
      `, { count: 'exact' });

    // Apply search if provided
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return { users: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get available roles
 */
export async function getRoles() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(update: UserRoleUpdate) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role_id: update.roleId,
        updated_at: new Date().toISOString()
      })
      .eq('id', update.userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Log admin activity
 */
export async function logActivity(
  userId: string, 
  action: string, 
  entityType: ActivityLog['entity_type'],
  entityId: string, 
  details?: Record<string, any>
) {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        created_at: new Date().toISOString(),
        details
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
}
