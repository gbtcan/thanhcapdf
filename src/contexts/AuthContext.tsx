import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
  last_login?: string;
  roles?: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      // Fetch current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        // Fetch user profile
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
      
      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setUserRole(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  // Fetch user profile with role information
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        setUser(data as UserProfile);
        setUserRole(data.roles?.name || 'user');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
      setUserRole(null);
    }
  };

  // Authentication methods
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // Profile data will be loaded via onAuthStateChange
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const register = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Profile will be created via database trigger
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // State will be updated via onAuthStateChange
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };
  
  const resetPassword = async (newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };
  
  const updateProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      // Update auth user data if email is changing
      if (profile.email && profile.email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: profile.email });
        
        if (error) {
          throw error;
        }
      }
      
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Refresh user data
      await fetchUserProfile(user.id);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        loading,
        userRole,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
