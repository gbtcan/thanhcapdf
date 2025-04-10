import { Session } from '@supabase/supabase-js';
import { supabaseClient } from '../supabase/client';
import { STORAGE_KEYS } from '../../core/utils/storage';

/**
 * Class to manage user authentication sessions
 */
export class SessionManager {
  private static instance: SessionManager;
  private currentSession: Session | null = null;
  private listeners: ((session: Session | null) => void)[] = [];
  
  private constructor() {
    this.initSession();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  /**
   * Initialize session from storage or Supabase auth
   */
  private async initSession(): Promise<void> {
    try {
      // Try to get session from Supabase
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        this.currentSession = null;
      } else {
        this.currentSession = data.session;
      }
      
      // Set up auth state change listener
      supabaseClient.auth.onAuthStateChange((event, session) => {
        this.currentSession = session;
        this.notifyListeners();
        
        // Handle session events
        if (event === 'SIGNED_IN') {
          console.log('User signed in');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear any local auth-related data
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      });
    } catch (error) {
      console.error('Error initializing session:', error);
      this.currentSession = null;
    }
  }
  
  /**
   * Get current session
   */
  public getSession(): Session | null {
    return this.currentSession;
  }
  
  /**
   * Get current user ID
   */
  public getUserId(): string | undefined {
    return this.currentSession?.user?.id;
  }
  
  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }
  
  /**
   * Add session change listener
   */
  public addListener(listener: (session: Session | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners of session change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentSession);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }
  
  /**
   * Force refresh the session
   */
  public async refreshSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      this.currentSession = data.session;
      this.notifyListeners();
      return this.currentSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
