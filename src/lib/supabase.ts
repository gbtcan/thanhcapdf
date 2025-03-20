import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Get environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fwoxlggleieoztmcvsju.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or anon key is missing. Make sure to define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

/**
 * Get authenticated user's ID
 * @returns The user ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Check if the user has admin privileges
 * @returns Promise resolving to boolean
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if the user has admin role in user_metadata
    const role = user.user_metadata?.role;
    if (role === 'administrator') return true;
    
    // If no role in metadata, check the roles table
    const { data, error } = await supabase
      .from('users')
      .select('roles(name)')
      .eq('id', user.id)
      .single();
      
    if (error || !data || !data.roles) return false;
    
    return data.roles.name === 'administrator';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Initialize Supabase auth state listener
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function initAuthStateListener(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: any) => void
): { unsubscribe: () => void } {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Add helper to check database connectivity
export async function checkDatabaseConnection() {
  try {
    // Simple query to check if we can connect to the database
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.warn('Users table not found. Database might be empty or tables have different names.');
        return { connected: true, tablesExist: false };
      }
      throw error;
    }
    
    return { connected: true, tablesExist: true };
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { connected: false, error };
  }
}

// Helper function to safely execute database queries with fallbacks
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>, 
  fallbackValue: T
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return data || fallbackValue;
  } catch (error) {
    console.error('Query error:', error);
    return fallbackValue;
  }
}

// Helper functions for data fetching
export const fetchHymn = async (id: string) => {
  const { data, error } = await supabase
    .from('hymns_new')
    .select(`
      *,
      hymn_authors(authors(*)),
      hymn_categories(categories(*)),
      pdf_files(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const fetchHymnsByCategory = async (categoryId: number) => {
  const { data, error } = await supabase
    .from('hymn_categories')
    .select(`
      hymns:hymn_id(
        *,
        hymn_authors(authors(*))
      )
    `)
    .eq('category_id', categoryId);
  
  if (error) throw error;
  return data.map((item) => ({
    ...item.hymns,
    authors: item.hymns.hymn_authors.map((ha: any) => ha.authors)
  }));
};

export const fetchHymnsByAuthor = async (authorId: number) => {
  const { data, error } = await supabase
    .from('hymn_authors')
    .select(`
      hymns:hymn_id(
        *,
        hymn_categories(categories(*))
      )
    `)
    .eq('author_id', authorId);
  
  if (error) throw error;
  return data.map((item) => ({
    ...item.hymns,
    categories: item.hymns.hymn_categories.map((hc: any) => hc.categories)
  }));
};

export const searchHymns = async (query: string, type: 'title' | 'lyrics' | 'author' = 'title') => {
  if (!query) return [];
  
  try {
    if (type === 'title') {
      const { data, error } = await supabase
        .from('hymns_new')
        .select(`
          *,
          hymn_authors(authors(*)),
          hymn_categories(categories(*))
        `)
        .ilike('title', `%${query}%`);
      
      if (error) throw error;
      return data;
    } else if (type === 'lyrics') {
      const { data, error } = await supabase
        .from('hymns_new')
        .select(`
          *,
          hymn_authors(authors(*)),
          hymn_categories(categories(*))
        `)
        .ilike('lyrics', `%${query}%`);
      
      if (error) throw error;
      return data;
    } else {
      // Search by author requires a different approach
      const { data: authors, error: authorsError } = await supabase
        .from('authors')
        .select('*')
        .ilike('name', `%${query}%`);
      
      if (authorsError) throw authorsError;
      if (!authors.length) return [];
      
      const authorIds = authors.map(author => author.id);
      
      const { data, error } = await supabase
        .from('hymn_authors')
        .select(`
          author_id,
          hymns:hymn_id(
            *,
            hymn_authors(authors(*)),
            hymn_categories(categories(*))
          )
        `)
        .in('author_id', authorIds);
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item.hymns,
        authors: item.hymns.hymn_authors.map((ha: any) => ha.authors),
        categories: item.hymns.hymn_categories.map((hc: any) => hc.categories)
      }));
    }
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

/**
 * Fetch all users from the database
 */
export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        display_name,
        created_at,
        updated_at,
        role_id,
        roles (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Fetch all available roles
 */
export async function fetchRoles() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
}

/**
 * Update user information
 */
export async function updateUser(userId: string, updates: { role_id?: number; display_name?: string }) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user
 * Note: This doesn't delete the Auth user, only the profile data
 */
export async function deleteUser(userId: string) {
  try {
    // First check if user is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id, roles(name)')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (userData?.roles?.name === 'administrator') {
      throw new Error('Cannot delete administrator users');
    }
    
    // Delete user profile data
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Check if network is available
 */
export async function isNetworkAvailable(): Promise<boolean> {
  try {
    // Try to fetch Google's homepage - reliable test for internet connectivity
    await fetch('https://www.google.com', { mode: 'no-cors', cache: 'no-store' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check Supabase service health
 */
export async function checkSupabaseHealth(): Promise<{
  isAvailable: boolean;
  authServiceOk: boolean;
  dbServiceOk: boolean;
}> {
  try {
    // Check database service with simple query to hymns_new table which we know exists
    let dbOk = false;
    try {
      const { error } = await supabase.from('hymns_new').select('id').limit(1);
      dbOk = !error;
    } catch {
      dbOk = false;
    }

    // Check auth service with a simple session check
    let authOk = false;
    try {
      await supabase.auth.getUser();
      authOk = true;
    } catch {
      authOk = false;
    }

    return {
      isAvailable: dbOk || authOk,
      authServiceOk: authOk,
      dbServiceOk: dbOk
    };
  } catch (error) {
    return {
      isAvailable: false,
      authServiceOk: false,
      dbServiceOk: false
    };
  }
}

// Print environment info for debugging
if (import.meta.env.DEV) {
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase API Key is ${supabaseAnonKey ? 'present' : 'missing'}`);
  
  // Test connection on app load
  checkDatabaseConnection().then(isConnected => {
    console.log(`Supabase connection ${isConnected ? 'successful' : 'failed'}`);
  });

  const checkConnection = async () => {
    const networkAvailable = await isNetworkAvailable();
    const serviceHealth = await checkSupabaseHealth();
    
    console.log('Network available:', networkAvailable);
    console.log('Supabase health:', serviceHealth);
    
    // Instead of trying to query information_schema directly,
    // print a list of tables we know or expect to exist
    const knownTables = [
      'hymns_new',
      'authors',
      'themes',
      'hymn_authors',
      'hymn_themes',
      'hymn_pdf_files',
      'hymn_audio_files',
      'hymn_video_links',
      'profiles',
      'forum_posts',
      'forum_comments',
      'system_logs'
    ];
    
    console.log('Expected tables in schema:', knownTables.join(', '));
    
  };
  
  checkConnection();
}

export default supabase;