import { supabase } from '../supabase';
import { AuthError } from '@supabase/supabase-js';
import { diagnoseSupabaseServices } from '../../utils/supabaseServiceCheck';

// Define login interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Define registration interface
export interface RegistrationData {
  email: string;
  password: string;
  displayName: string;
}

// Maximum authentication retry attempts
const MAX_AUTH_RETRIES = 2;

// Track service status to avoid repeated retries if service is down
let authServiceStatus = {
  isDown: false,
  lastCheckedAt: 0
};

// Local development fallback authentication (for offline mode or during outages)
interface FallbackUser {
  email: string;
  password: string;
  userData: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      role: string;
    }
  };
}

const DEV_FALLBACK_USERS: FallbackUser[] = [
  {
    email: 'demo@example.com',
    password: 'password123',
    userData: {
      id: 'local-dev-user-1',
      email: 'demo@example.com',
      user_metadata: {
        name: 'Demo User',
        role: 'user'
      }
    }
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    userData: {
      id: 'local-dev-admin-1',
      email: 'admin@example.com',
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    }
  }
];

/**
 * Check if authentication service is available
 */
export async function isAuthServiceAvailable(): Promise<boolean> {
  // If we recently checked and service is down, don't check again too soon
  const now = Date.now();
  if (authServiceStatus.isDown && now - authServiceStatus.lastCheckedAt < 30000) {
    return false;
  }
  
  try {
    // Light-weight check to see if auth service is responding
    const { error } = await supabase.auth.getSession();
    
    // Update status
    authServiceStatus = {
      isDown: !!error && (error.status === 500 || error.message?.includes('network')),
      lastCheckedAt: now
    };
    
    return !authServiceStatus.isDown;
  } catch (e) {
    // Network error or other issue
    authServiceStatus = { isDown: true, lastCheckedAt: now };
    return false;
  }
}

/**
 * Format auth error messages to be more user-friendly
 */
export function formatAuthError(error: AuthError): string {
  const errorMessage = error.message;
  
  // Handle specific error types with custom messages
  if (errorMessage.includes('Email not confirmed')) {
    return 'Please verify your email address before logging in.';
  }
  
  if (errorMessage.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  
  // Add specific handling for Internal Server Error (500)
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return 'The authentication service is currently experiencing issues. Please try again later or contact support.';
  }
  
  if (errorMessage.includes('Database error') || errorMessage.includes('connection')) {
    return 'Unable to connect to the authentication service. Please try again later.';
  }
  
  if (errorMessage.includes('Email already registered')) {
    return 'This email is already registered. Please use a different email or try logging in.';
  }
  
  if (errorMessage.includes('Password should be')) {
    return 'Password must be at least 6 characters long.';
  }
  
  // Default error message if no specific handling
  return errorMessage || 'An unknown error occurred. Please try again.';
}

/**
 * Login with email and password with retry and fallback logic
 */
export async function loginWithEmail(email: string, password: string) {
  // Try fallback auth for development mode first if auth service is down
  if (import.meta.env.DEV && !(await isAuthServiceAvailable())) {
    console.warn('Authentication service unavailable in development mode. Trying fallback auth...');
    
    const fallbackUser = DEV_FALLBACK_USERS.find(u => u.email === email && u.password === password);
    if (fallbackUser) {
      console.log('Dev mode: Using fallback authentication');
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'dev-mode-token',
        refresh_token: 'dev-mode-refresh',
        expires_at: Date.now() + 3600000,
        user: fallbackUser.userData
      }));
      
      return { data: { user: fallbackUser.userData }, error: null };
    }
  }
  
  // Normal authentication flow with retry mechanism
  let retries = 0;
  let lastError: any = null;
  
  while (retries <= MAX_AUTH_RETRIES) {
    try {
      // Fix: Ensure email is passed as a string, not an object
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: String(email), // Ensure email is a string
        password: String(password) // Ensure password is a string
      });
      
      if (error) {
        // If it's a server error (500), retry
        if (error.status === 500) {
          retries++;
          lastError = error;
          
          // Wait longer between retries
          const delay = retries * 2000;
          console.warn(`Authentication service error (500), retrying in ${delay/1000}s... (Attempt ${retries}/${MAX_AUTH_RETRIES})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors, just throw
        throw error;
      }
      
      // Reset service status on success
      authServiceStatus.isDown = false;
      return { data, error: null };
    } catch (error: any) {
      lastError = error;
      console.error('Authentication error details:', error);
      
      if (retries < MAX_AUTH_RETRIES && (error.status === 500 || error.message?.includes('network'))) {
        retries++;
        const delay = retries * 2000;
        console.warn(`Authentication error, retrying in ${delay/1000}s... (Attempt ${retries}/${MAX_AUTH_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  // All retries failed
  console.error('Auth error details: ', lastError);
  
  // Log more diagnostic information
  if (lastError?.status === 500) {
    console.warn('Running Supabase diagnostics due to auth failures...');
    diagnoseSupabaseServices();
  }
  
  // Mark auth service as down after MAX_RETRIES fail
  if (retries >= MAX_AUTH_RETRIES) {
    authServiceStatus = { isDown: true, lastCheckedAt: Date.now() };
    throw new Error('The authentication service is temporarily unavailable. Please try again later.');
  }
  
  throw lastError || new Error('Authentication failed');
}

/**
 * Register a new user
 */
export async function registerWithEmail(email: string, password: string, options: { metadata?: any } = {}) {
  // If auth service is down but we're in dev mode, simulate successful registration
  if (import.meta.env.DEV && !(await isAuthServiceAvailable())) {
    console.warn('Auth service unavailable in dev mode. Simulating registration.');
    
    // Add to fallback users
    const newUser = {
      email,
      password,
      userData: {
        id: `local-dev-user-${Date.now()}`,
        email,
        user_metadata: { 
          ...options.metadata,
          name: options.metadata?.name || 'New User' 
        }
      }
    };
    
    DEV_FALLBACK_USERS.push(newUser);
    return { data: { user: newUser.userData }, error: null };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options
  });
  
  if (error && error.status === 500) {
    console.error('Registration failed due to service issues:', error);
    throw new Error('The registration service is temporarily unavailable. Please try again later.');
  }
  
  return { data, error };
}

/**
 * Logout the current user
 */
export async function logout() {
  // If we're using fallback auth, clear local storage
  if (localStorage.getItem('supabase.auth.token')?.includes('dev-mode-token')) {
    localStorage.removeItem('supabase.auth.token');
    return { error: null };
  }
  
  return await supabase.auth.signOut();
}

/**
 * Get the current logged-in user with profile data
 */
export async function getCurrentUser() {
  try {
    // 1. Get the current auth user
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) throw authError;
    if (!session) return null;

    // 2. Try to get the user's profile with role information
    try {
      // First, check if the profiles table exists
      const { error: checkError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      // If profiles exists, get the user profile
      if (!checkError) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            roles (
              id,
              name,
              permissions
            )
          `)
          .eq('auth_user_id', session.user.id)
          .single();

        if (!profileError && profile) {
          return {
            id: session.user.id,
            email: session.user.email,
            ...profile
          };
        }
      }
    } catch (profileErr) {
      console.error('Error fetching profile data:', profileErr);
    }

    // Fallback to basic user info if profile fetching fails
    return {
      id: session.user.id,
      email: session.user.email,
      auth_user_id: session.user.id,
      role_id: 1, // Default role if we can't fetch
      display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0]
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Request a password reset
 */
export async function requestPasswordReset(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Reset password with new password
 */
export async function resetPassword(new_password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Get current session 
 * - With fallback for development mode
 */
export async function getCurrentSession() {
  // Check for dev mode auth token
  const storedToken = localStorage.getItem('supabase.auth.token');
  if (storedToken?.includes('dev-mode-token')) {
    const tokenData = JSON.parse(storedToken);
    return { 
      data: { 
        session: {
          access_token: tokenData.access_token,
          user: tokenData.user
        } 
      }, 
      error: null 
    };
  }
  
  return await supabase.auth.getSession();
}

export default {
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  logout,
  getCurrentSession,
  isAuthServiceAvailable
};
