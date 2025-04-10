import { createClient, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Define minimal Database type here instead of importing from missing file
export type Database = {
  public: {
    Tables: {
      hymns_new: {
        Row: {
          id: string
          title: string
          number?: number
          view_count?: number
          last_viewed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          created_at?: string
        }
      }
      hymn_authors: {
        Row: {
          hymn_id: string
          author_id: string
          created_at?: string
        }
      }
    }
    Functions: {
      public_increment_hymn_view: {
        Args: { hymn_id: string }
        Returns: void
      }
      increment_hymn_view: {
        Args: { hymn_id: string; user_id?: string }
        Returns: void
      }
    }
  }
}

// Use existing instance from supabase/client.ts if it exists
import { supabaseClient } from './supabase/client';

// Check if we already have a global instance
const hasExistingInstance = !!supabaseClient;

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Export the already created instance to avoid duplicate clients
export const supabase = supabaseClient;

// Log when this file is imported
if (hasExistingInstance) {
  console.debug('Using existing Supabase client instance');
}

// Re-export helper functions without modification

// Simplified API for consistent error handling
export async function performQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      throw error;
    }
    
    if (data === null) {
      throw new Error('No data returned from query');
    }
    
    return data;
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
}

// Handle database connection check with a real table
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!navigator.onLine) {
    console.log("Device is offline - skipping database check");
    return false;
  }
  
  try {
    // Use a valid table and column that we know exists
    const { error } = await supabase
      .from('hymns_new')
      .select('id')  // Only select id column which definitely exists
      .limit(1);
      
    return !error;
  } catch (e) {
    console.log("Database connection check failed", e);
    return false;
  }
}

// Simplified connection monitoring
export const initConnectionMonitoring = () => {
  if (navigator.onLine) {
    checkDatabaseConnection().catch(() => {
      console.log("Connection monitoring setup failed - skipping");
    });
  }
};

// Helper function to check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

// Get authenticated user's ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// Check if the user has admin privileges
export async function isUserAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const role = user.user_metadata?.role;
    if (role === 'administrator') return true;
    
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

// Initialize Supabase auth state listener
export function initAuthStateListener(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): { unsubscribe: () => void } {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Safe query with fallback
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>, 
  fallbackValue: T = [] as unknown as T
): Promise<T> {
  // Check if device is offline first
  if (!navigator.onLine) {
    console.log("Device is offline - returning fallback data");
    return fallbackValue;
  }

  try {
    const { data, error } = await queryFn();
    if (error) {
      console.error("Query error:", error);
      return fallbackValue;
    }
    return data || fallbackValue;
  } catch (error) {
    console.error("Query error:", error);
    return fallbackValue;
  }
}

// Initialize with error handling
try {
  initConnectionMonitoring();
} catch (e) {
  console.log("Failed to initialize connection monitoring");
}

export default supabase;