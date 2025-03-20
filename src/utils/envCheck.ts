/**
 * Utilities for environment checking and logging
 */

interface EnvCheckResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

// Environment variables that should be set for the app to function properly
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Optional environment variables that trigger warnings if missing
const OPTIONAL_ENV_VARS = [
  'VITE_APP_TITLE', 
  'VITE_ANALYTICS_ID',
  'VITE_STORAGE_BUCKET'
];

/**
 * Check if all required environment variables are set
 * @returns An object with status and missing variables
 */
export function checkRequiredEnv(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED_ENV_VARS.filter(
    varName => !import.meta.env[varName]
  );
  
  return {
    ok: missing.length === 0,
    missing
  };
}

/**
 * Check required environment variables
 * @returns Result object indicating which env vars are missing or valid
 */
export function checkRequiredEnvVars(): EnvCheckResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check required environment variables
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (!import.meta.env[envVar]) {
      missing.push(envVar);
    }
  });
  
  // Check optional environment variables
  OPTIONAL_ENV_VARS.forEach(envVar => {
    if (!import.meta.env[envVar]) {
      warnings.push(envVar);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Verify that Supabase environment variables are correctly configured
 * @returns True if Supabase configuration appears valid
 */
export function checkSupabaseConfig(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return false;
  }
  
  // Check if URL is in the expected format
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Check if key has the expected format (rough check)
  if (!key.includes('.') || key.length < 30) {
    return false;
  }
  
  return true;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return import.meta.env.PROD === true;
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV === true;
}

/**
 * Get the deployment environment (production, staging, development)
 */
export function getEnvironment(): 'production' | 'staging' | 'development' | 'test' {
  if (import.meta.env.MODE === 'test') return 'test';
  if (import.meta.env.PROD) return 'production';
  if (import.meta.env.VITE_ENV === 'staging') return 'staging';
  return 'development';
}

/**
 * Log environment information for debugging
 */
export function logEnvironmentInfo(): void {
  if (import.meta.env.DEV) {
    console.group('Environment Information');
    
    console.log('Mode:', import.meta.env.MODE);
    console.log('Development:', import.meta.env.DEV);
    console.log('Production:', import.meta.env.PROD);
    
    // Check for required env vars
    const envStatus = checkRequiredEnv();
    if (envStatus.ok) {
      console.log('✅ All required environment variables are set');
    } else {
      console.warn('⚠️ Missing environment variables:', envStatus.missing);
    }

    // Feature detection
    console.log('Browser features:');
    console.log('- localStorage:', typeof window.localStorage !== 'undefined' ? '✅ Available' : '❌ Not available');
    console.log('- serviceWorker:', 'serviceWorker' in navigator ? '✅ Available' : '❌ Not available');
    console.log('- WebSockets:', typeof WebSocket !== 'undefined' ? '✅ Available' : '❌ Not available');

    console.groupEnd();
  }
}

/**
 * Get the current base URL for the application
 * @returns The base URL with trailing slash
 */
export function getBaseUrl(): string {
  const url = window.location.origin;
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Check if the current environment is supported
 * @returns Boolean indicating if the environment is supported
 */
export function isEnvironmentSupported(): boolean {
  // Check for modern browser features required by the app
  const requiredFeatures = [
    typeof fetch !== 'undefined', // Fetch API
    typeof Promise !== 'undefined', // Promises
    typeof localStorage !== 'undefined', // localStorage
    typeof window.history !== 'undefined' // History API
  ];
  
  return requiredFeatures.every(feature => feature === true);
}

/**
 * Report environment issues to an error tracking service
 * @param message Error message
 * @param details Additional error details
 */
export function reportEnvironmentIssue(message: string, details?: any): void {
  if (import.meta.env.DEV) {
    console.error('Environment issue:', message, details);
  } else {
    // In production, you would send this to your error tracking service
    // For example: Sentry, LogRocket, etc.
    console.error('Environment issue:', message);
  }
}
