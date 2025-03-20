/**
 * Helper utility to address common Vite development connection issues
 * and Supabase authentication problems.
 */

import { supabase, isNetworkAvailable, checkSupabaseHealth } from '../lib/supabase';

/**
 * Fix development environment connection issues
 */
export async function fixConnectionIssues(): Promise<{
  networkOk: boolean;
  supabaseOk: boolean;
  issues: string[];
  fixes: string[];
}> {
  const issues: string[] = [];
  const fixes: string[] = [];
  
  // Check network connectivity
  const networkOk = await isNetworkAvailable();
  if (!networkOk) {
    issues.push('Network connectivity issues detected');
    fixes.push('Please check your internet connection');
  }
  
  // Check Supabase service health
  const supabaseHealth = await checkSupabaseHealth();
  const supabaseOk = supabaseHealth.isAvailable;
  
  if (!supabaseHealth.authServiceOk) {
    issues.push('Supabase authentication service is unavailable');
    fixes.push('Try again later or check Supabase status page');
  }
  
  if (!supabaseHealth.dbServiceOk) {
    issues.push('Supabase database service is unavailable');
    fixes.push('Verify Supabase project configuration and database health');
  }
  
  // Verify environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    issues.push('Missing Supabase configuration (URL or API key)');
    fixes.push('Check .env file and verify Supabase credentials');
  }
  
  // Create fallback local users for development
  if (import.meta.env.DEV && (!supabaseOk || !networkOk)) {
    console.warn('Using development fallbacks due to connectivity issues');
    
    // Setup localStorage fallback for development login
    if (!localStorage.getItem('dev_fallback_enabled')) {
      localStorage.setItem('dev_fallback_enabled', 'true');
      localStorage.setItem('dev_fallback_users', JSON.stringify([
        { email: 'demo@example.com', password: 'password123', name: 'Demo User' }
      ]));
    }
    
    fixes.push('Development mode: use demo@example.com / password123 for testing');
  }
  
  return {
    networkOk,
    supabaseOk,
    issues,
    fixes
  };
}

/**
 * Use during app initialization to log helpful information
 */
export function setupDevelopmentHelpers() {
  if (import.meta.env.DEV) {
    fixConnectionIssues().then(({ issues, fixes }) => {
      if (issues.length > 0) {
        console.group('🛠️ Connection Troubleshooting');
        console.warn('Issues detected:', issues);
        console.info('Suggested fixes:', fixes);
        console.groupEnd();
      }
    });
  }
}

/**
 * Main export function to fix Vite connection issues
 */
export const fixViteConnection = async () => {
  const result = await fixConnectionIssues();
  
  // Log the results
  if (result.issues.length > 0) {
    console.group('🛠️ Vite Connection Troubleshooting');
    console.warn('Issues detected:', result.issues);
    console.info('Suggested fixes:', result.fixes);
    console.groupEnd();
  }
  
  return {
    ...result,
    isOk: result.networkOk && result.supabaseOk
  };
};

/**
 * Utility to fix Vite connection issues
 * These often happen with browser extensions or service workers
 */

// Log the error and provide recovery instructions
export function handleViteConnectionError() {
  console.log(
    '%c🔄 Vite HMR Connection Issue Detected',
    'background-color: #ffcc00; color: #333; padding: 4px 8px; border-radius: 4px;'
  );
  
  console.log(
    'If you continue seeing connection issues, try one of these solutions:\n' +
    '1. Disable browser extensions, especially ad-blockers or security extensions\n' +
    '2. Open the app in an incognito/private window\n' +
    '3. Clear your browser cache and refresh\n' +
    '4. Try a different browser'
  );
  
  // Attempt to recover automatically
  attemptConnectionRecovery();
}

// Attempt to fix common issues automatically
function attemptConnectionRecovery() {
  try {
    // Check if we've already tried recovery recently
    const lastAttempt = localStorage.getItem('vite-recovery-attempt');
    if (lastAttempt && (Date.now() - parseInt(lastAttempt)) < 10000) {
      // Don't retry too frequently
      return;
    }
    
    // Record this attempt
    localStorage.setItem('vite-recovery-attempt', Date.now().toString());
    
    // Unregister any service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('Unregistered service worker for recovery');
        });
      });
    }
    
    // Clear websocket error listeners from Vite
    const wssEvents = window.addEventListener;
    if (typeof wssEvents === 'function') {
      try {
        // This is a hack to try to reset the websocket connection
        // It might not work in all browsers or Vite versions
        window.removeEventListener('error', wssEvents as any);
      } catch (e) {
        console.log('Could not reset websocket listeners');
      }
    }
    
    console.log('Recovery attempt complete');
  } catch (e) {
    console.error('Error during recovery attempt:', e);
  }
}

// Install global error handler for Vite connection issues
export function installViteErrorHandler() {
  window.addEventListener('error', function(e) {
    if (e.message && (
      e.message.includes('Could not establish connection') || 
      e.message.includes('WebSocket') ||
      e.message.includes('Vite') ||
      e.message.includes('connection')
    )) {
      handleViteConnectionError();
    }
  });
  
  // Also listen for unhandled rejections
  window.addEventListener('unhandledrejection', function(e) {
    if (e.reason && typeof e.reason === 'object' && 'message' in e.reason) {
      const message = e.reason.message;
      if (typeof message === 'string' && (
        message.includes('Could not establish connection') || 
        message.includes('WebSocket') ||
        message.includes('Vite') ||
        message.includes('connection')
      )) {
        handleViteConnectionError();
      }
    }
  });
  
  console.log('Vite error handler installed');
}

export default setupDevelopmentHelpers;
