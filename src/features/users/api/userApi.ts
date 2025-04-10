import { supabase } from '../../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { AuthUser, LoginFormData, RegisterFormData, UserWithRoles } from '../types';

/**
 * API functions for user authentication and profile management
 * Contains all direct Supabase auth and user data calls
 */

/**
 * Sign in with email and password
 */
export async function loginWithEmail(credentials: LoginFormData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign up a new user with email and password
 */
export async function registerWithEmail(userData: RegisterFormData) {
  // Sign up using Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        display_name: userData.display_name || userData.email.split('@')[0],
      },
    },
  });

  if (error) throw error;
  
  // Create profile record for the new user
  if (data.user) {
    await createUserProfile(data.user, userData.display_name);
  }

  return data;
}

/**
 * Create a user profile record
 */
async function createUserProfile(user: User, displayName?: string) {
  const name = displayName || user.email?.split('@')[0] || 'User';
  
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
    
  if (existingProfile) {
    return existingProfile;
  }
  
  // Create new profile
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: name,
      email: user.email,
      auth_user_id: user.id,
      role_id: 2, // Standard user role
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user profile:', error);
  }
  
  return data;
}

/**
 * Sign out the current user
 */
export async function logout() {
  return await supabase.auth.signOut();
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  
  if (error) throw error;
  return true;
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
  return true;
}

/**
 * Get the current user session with full profile data
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      return null;
    }
    
    const user = sessionData.session.user;
    
    // Get profile and role data
    const { data: profileData } = await supabase
      .from('profiles')
      .select(`
        *,
        roles:role_id (
          id,
          name,
          permissions
        )
      `)
      .eq('id', user.id)
      .single();
    
    const isAdmin = profileData?.roles?.name === 'administrator';
    const isEditor = profileData?.roles?.name === 'editor' || isAdmin;
    
    return {
      id: user.id,
      email: user.email,
      display_name: profileData?.display_name || user.email?.split('@')[0] || 'User',
      avatar_url: profileData?.avatar_url || null,
      roles: profileData?.roles,
      isAuthenticated: true,
      isAdmin,
      isEditor
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, profileData: Partial<UserWithRoles>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Get user's favorite hymns
 */
export async function getUserFavorites(userId: string) {
  if (!userId) throw new Error('User ID is required');
  
  try {
    // Get the user's favorites with creation dates
    const { data: likeData, error } = await supabase
      .from('hymn_likes')
      .select('hymn_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    if (!likeData || likeData.length === 0) {
      return { hymns: [], likedAt: {} };
    }
    
    // Get the hymn IDs and create a mapping of hymn_id to created_at
    const hymnIds = likeData.map(like => like.hymn_id);
    const likedAt = likeData.reduce((acc, like) => {
      acc[like.hymn_id] = like.created_at;
      return acc;
    }, {} as Record<string, string>);
    
    // Get the hymn data
    const { data: hymns } = await supabase
      .from('hymns_new')
      .select('*')
      .in('id', hymnIds);
      
    return {
      hymns: hymns || [],
      likedAt
    };
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
}
