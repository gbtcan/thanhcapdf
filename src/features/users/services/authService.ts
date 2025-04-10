import { supabase } from '../../../lib/supabase';
import { AuthUser, LoginFormData, RegisterFormData, UserRole } from '../types';

/**
 * Sign in with email and password
 */
export async function signInWithEmail(credentials: LoginFormData): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  return {
    user: data?.user || null,
    error,
  };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(userData: RegisterFormData): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        display_name: userData.display_name || userData.email.split('@')[0],
      },
    },
  });

  if (!error && data.user) {
    // Create profile record
    await supabase.from('profiles').insert({
      id: data.user.id,
      display_name: userData.display_name || userData.email.split('@')[0],
      email: userData.email,
      auth_user_id: data.user.id,
      role_id: 2, // Standard user role
      created_at: new Date().toISOString(),
    });
  }

  return {
    user: data?.user || null,
    error,
  };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: any }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current authenticated user with role information
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session?.user) {
      return null;
    }
    
    const user = sessionData.session.user;
    
    // Get user profile and role info
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
      
    const isAdmin = profileData?.roles?.name === UserRole.ADMIN;
    const isEditor = profileData?.roles?.name === UserRole.EDITOR || isAdmin;
    
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
