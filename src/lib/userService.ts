import { supabase } from './supabase';
import { UserRole } from '../types/users';
import { getTableName, safeQueryBuilder } from '../utils/tableMapper';

/**
 * Fetch all users
 */
export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        reputation
      `)
      .order('name');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Fetch a user by ID
 */
export async function fetchUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        reputation
      `)
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role } }
    );
    
    if (error) throw error;
    
    // Also update the users table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
      
    if (userUpdateError) throw userUpdateError;
    
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId} role:`, error);
    throw error;
  }
}

/**
 * Disable a user account
 */
export async function disableUser(userId: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { banned: true }
    );
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error disabling user ${userId}:`, error);
    throw error;
  }
}

/**
 * Enable a user account
 */
export async function enableUser(userId: string) {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { banned: false }
    );
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error enabling user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStatistics(userId: string) {
  try {
    // Get post count
    const { count: postCount, error: postError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (postError) throw postError;
    
    // Get comment count
    const { count: commentCount, error: commentError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (commentError) throw commentError;
    
    // Get hymn count
    const { count: hymnCount, error: hymnError } = await supabase
      .from('hymns')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);
      
    if (hymnError) throw hymnError;
    
    // Get PDF count
    const { count: pdfCount, error: pdfError } = await supabase
      .from('pdf_files')
      .select('*', { count: 'exact', head: true })
      .eq('uploaded_by', userId);
      
    if (pdfError) throw pdfError;
    
    return {
      postCount: postCount || 0,
      commentCount: commentCount || 0,
      hymnCount: hymnCount || 0,
      pdfCount: pdfCount || 0
    };
  } catch (error) {
    console.error(`Error getting statistics for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: {
  name?: string;
  avatar_url?: string;
  bio?: string;
}) {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId} profile:`, error);
    throw error;
  }
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('user-content')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = await supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);
      
    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    return data.publicUrl;
  } catch (error) {
    console.error(`Error uploading avatar for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get users with most contributions
 */
export async function getTopContributors(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, reputation')
      .order('reputation', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    throw error;
  }
}

/**
 * Get user profile by ID with proper table handling
 */
export async function getUserById(userId: string) {
  try {
    // Use the safe query builder to get the correct table
    const query = await safeQueryBuilder('profiles');
    
    const { data, error } = await query
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
}

/**
 * Get current user's profile with proper table handling
 */
export async function getCurrentUserProfile() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return null;
    
    return getUserById(authData.user.id);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
}

/**
 * Update user profile with proper table handling
 */
export async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Get the correct profiles table name
    const profilesTable = await getTableName('profiles');
    
    const { data, error } = await supabase
      .from(profilesTable)
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export default {
  getUserById,
  getCurrentUserProfile,
  updateUserProfile
};
