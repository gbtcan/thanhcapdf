/**
 * Service for managing anonymous user sessions
 * Used for tracking views and other user activities without authentication
 */

// Session ID storage key
const SESSION_ID_KEY = 'anonymous_session_id';

// Session expiry time (7 days)
const SESSION_EXPIRY_DAYS = 7;

/**
 * Get the current session ID from localStorage or create a new one if none exists
 * @returns The current session ID
 */
export function getOrCreateSessionId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.localStorage) {
    return generateSessionId(); // For SSR, generate a temporary ID
  }
  
  // Try to get existing session ID
  const existingId = window.localStorage.getItem(SESSION_ID_KEY);
  const expiryTimestamp = window.localStorage.getItem(`${SESSION_ID_KEY}_expiry`);
  
  // If we have a valid, non-expired session ID, return it
  if (existingId && expiryTimestamp) {
    const expiry = parseInt(expiryTimestamp, 10);
    if (!isNaN(expiry) && expiry > Date.now()) {
      return existingId;
    }
  }
  
  // Otherwise, create a new session ID
  const newSessionId = generateSessionId();
  const expiry = Date.now() + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  // Store the new session ID
  window.localStorage.setItem(SESSION_ID_KEY, newSessionId);
  window.localStorage.setItem(`${SESSION_ID_KEY}_expiry`, expiry.toString());
  
  return newSessionId;
}

/**
 * Generate a new random session ID
 * @returns A random session ID
 */
function generateSessionId(): string {
  // Simple UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Clear the current session ID
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  
  window.localStorage.removeItem(SESSION_ID_KEY);
  window.localStorage.removeItem(`${SESSION_ID_KEY}_expiry`);
}

/**
 * Check if a session ID exists
 * @returns True if a session ID exists
 */
export function hasSessionId(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  
  return !!window.localStorage.getItem(SESSION_ID_KEY);
}

export const sessionManager = {
  getOrCreateSessionId,
  clearSessionId,
  hasSessionId
};

export default sessionManager;
