import { v4 as uuidv4 } from 'uuid';

/**
 * Session Manager for anonymous user tracking
 * Provides methods for getting and setting session IDs
 */
class SessionManager {
  private readonly SESSION_ID_KEY = 'tcpdf_session_id';
  private readonly SESSION_EXPIRY_KEY = 'tcpdf_session_expires';
  private readonly SESSION_DURATION_MS = 1000 * 60 * 60 * 24; // 24 hours
  private readonly USER_PREFS_KEY = 'tcpdf_user_preferences';
  
  /**
   * Get the current session ID or create a new one if none exists or expired
   * @returns Session ID
   */
  getOrCreateSessionId(): string {
    // Try to get existing session ID
    let sessionId = localStorage.getItem(this.SESSION_ID_KEY);
    const expiryStr = localStorage.getItem(this.SESSION_EXPIRY_KEY);
    
    // Check if session is expired
    if (sessionId && expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      
      // If session is expired, clear it
      if (Date.now() > expiry) {
        sessionId = null;
      }
    }
    
    // If no session ID or expired, create a new one
    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.saveSession(sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Clear the current session
   */
  clearSession(): void {
    localStorage.removeItem(this.SESSION_ID_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
  }
  
  /**
   * Save user preference
   * @param key Preference key
   * @param value Preference value
   */
  savePreference<T>(key: string, value: T): void {
    try {
      const preferences = this.getPreferences();
      preferences[key] = value;
      localStorage.setItem(this.USER_PREFS_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preference:', error);
    }
  }
  
  /**
   * Get user preference
   * @param key Preference key
   * @param defaultValue Default value if preference doesn't exist
   * @returns Preference value or default
   */
  getPreference<T>(key: string, defaultValue: T): T {
    try {
      const preferences = this.getPreferences();
      return key in preferences ? preferences[key] : defaultValue;
    } catch (error) {
      console.error('Error getting user preference:', error);
      return defaultValue;
    }
  }
  
  /**
   * Generate a random session ID
   * @returns Random session ID
   */
  private generateSessionId(): string {
    // Generate a random string
    return 'anon_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Save session to localStorage
   * @param sessionId Session ID to save
   */
  private saveSession(sessionId: string): void {
    const expiry = Date.now() + this.SESSION_DURATION_MS;
    localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    localStorage.setItem(this.SESSION_EXPIRY_KEY, expiry.toString());
  }
  
  /**
   * Get all user preferences
   * @returns User preferences object
   */
  private getPreferences(): Record<string, any> {
    try {
      const prefsStr = localStorage.getItem(this.USER_PREFS_KEY);
      return prefsStr ? JSON.parse(prefsStr) : {};
    } catch (error) {
      console.error('Error parsing user preferences:', error);
      return {};
    }
  }
  
  /**
   * Check if we can use localStorage
   * @returns true if localStorage is available
   */
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Export a singleton instance
export const sessionManager = new SessionManager();
