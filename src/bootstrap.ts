/**
 * This file executes before React initialization to ensure environment setup
 */

// Log environment info
console.log('Environment bootstrap starting...');

// Check for window.__ENV__
if (typeof window !== 'undefined' && window.__ENV__) {
  console.log('Found window.__ENV__ configuration:', {
    hasSupabaseUrl: !!window.__ENV__.VITE_SUPABASE_URL,
    hasSupabaseKey: !!window.__ENV__.VITE_SUPABASE_ANON_KEY
  });
}

// Check import.meta.env
if (typeof import.meta !== 'undefined' && import.meta.env) {
  console.log('import.meta.env status:', {
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV
  });
}

// Test if localStorage is available
let localStorageAvailable = false;
try {
  localStorage.setItem('test', '1');
  localStorage.removeItem('test');
  localStorageAvailable = true;
} catch (e) {
  console.warn('localStorage is not available:', e);
}

console.log('Browser environment:', { 
  localStorageAvailable,
  hasServiceWorker: 'serviceWorker' in navigator,
  userAgent: navigator.userAgent
});

export const bootstrapComplete = true;
