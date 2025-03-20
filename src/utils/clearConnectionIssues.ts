/**
 * Utility to clear various browser issues that might affect connectivity and performance
 */
import { cleanupServiceWorkers } from './cleanupSW';

// List of cache keys that should be preserved
const PRESERVE_KEYS = ['theme', 'user_preferences'];

/**
 * Clear browser cache for specific URLs
 * @param urls URLs to clear from cache
 */
export async function clearUrlsFromCache(urls: string[]): Promise<void> {
  if (!('caches' in window)) {
    console.warn('Cache API not supported in this browser');
    return;
  }
  
  try {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(async cacheName => {
        const cache = await caches.open(cacheName);
        
        for (const url of urls) {
          try {
            await cache.delete(url);
          } catch (err) {
            console.error(`Failed to delete ${url} from cache ${cacheName}:`, err);
          }
        }
      })
    );
    
    console.log('URLs cleared from cache');
  } catch (error) {
    console.error('Error clearing URLs from cache:', error);
  }
}

/**
 * Clear localStorage items that might cause issues
 * @param keys Keys to clear from localStorage
 */
export function clearLocalStorageItems(keys: string[]): void {
  try {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
    console.log('localStorage items cleared');
  } catch (error) {
    console.error('Error clearing localStorage items:', error);
  }
}

/**
 * Clear sessionStorage items that might cause issues
 * @param keys Keys to clear from sessionStorage
 */
export function clearSessionStorageItems(keys: string[]): void {
  try {
    for (const key of keys) {
      sessionStorage.removeItem(key);
    }
    console.log('sessionStorage items cleared');
  } catch (error) {
    console.error('Error clearing sessionStorage items:', error);
  }
}

/**
 * Clear cookies that might cause issues
 * @param cookieNames Names of cookies to clear
 */
export function clearCookies(cookieNames: string[]): void {
  try {
    for (const name of cookieNames) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
    console.log('Cookies cleared');
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
}

/**
 * Fix problems with fetch requests and permissions
 */
export async function fixFetchIssues(): Promise<void> {
  try {
    // Clean up service workers first
    await cleanupServiceWorkers(false);
    
    // Clear problematic localStorage items
    clearLocalStorageItems([
      'fetch-cache',
      'auth-tokens',
      'permissions',
      'vite-hmr'
    ]);
    
    // Clear problematic sessionStorage items
    clearSessionStorageItems([
      'fetch-in-progress',
      'fetch-error-count'
    ]);
    
    // Clear API URLs from cache
    await clearUrlsFromCache([
      '/api/',
      `${window.location.origin}/api/`
    ]);
    
    console.log('Fixed potential fetch issues');
  } catch (error) {
    console.error('Error fixing fetch issues:', error);
  }
}

/**
 * Comprehensive function to fix all connection issues
 * @param reload Whether to reload the page after fixes
 */
export async function clearConnectionIssues(reload = true): Promise<void> {
  try {
    console.group('Fixing connection issues');
    
    // Clean up service workers
    await cleanupServiceWorkers(false);
    
    // Fix fetch issues
    await fixFetchIssues();
    
    // Clear problematic localStorage items
    clearLocalStorageItems([
      'vite-hmr',
      'vite-previous-entry',
      'connection-status',
      'offline-mode'
    ]);
    
    console.log('Connection issues fixed');
    console.groupEnd();
    
    if (reload) {
      console.log('Reloading page...');
      window.location.reload();
    }
  } catch (error) {
    console.error('Error clearing connection issues:', error);
  }
}

/**
 * Checks if there are connectivity issues with the API
 * @param endpoint Optional API endpoint to check
 * @returns Promise resolving to true if connected, false otherwise
 */
export async function checkApiConnection(endpoint?: string): Promise<boolean> {
  try {
    // Try to connect to Supabase or a specific endpoint
    const url = endpoint || `${import.meta.env.VITE_SUPABASE_URL}/health`;
    
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
      mode: 'cors',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
}

/**
 * Clear browser data related to API connections
 * This can help resolve stale connection issues
 */
export async function clearApiCache(): Promise<void> {
  try {
    // Clear localStorage except for preserved keys
    Object.keys(localStorage).forEach(key => {
      if (!PRESERVE_KEYS.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all indexed DB for the app domain
    await clearIndexedDB();
    
    // Clear fetch cache if available
    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map(cacheKey => caches.delete(cacheKey))
      );
    }
    
    console.log('API cache cleared successfully');
  } catch (error) {
    console.error('Error clearing API cache:', error);
  }
}

/**
 * Clear all IndexedDB databases for the current origin
 */
async function clearIndexedDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (!('indexedDB' in window)) {
        resolve();
        return;
      }
      
      // Request all databases
      const databases = indexedDB.databases 
        ? indexedDB.databases() 
        : Promise.resolve([]);
      
      databases.then(dbs => {
        const deletePromises = dbs.map(db => {
          if (!db.name) return Promise.resolve();
          
          return new Promise<void>((resolveDb, rejectDb) => {
            const request = indexedDB.deleteDatabase(db.name!);
            
            request.onsuccess = () => {
              console.log(`Deleted database: ${db.name}`);
              resolveDb();
            };
            
            request.onerror = () => {
              console.error(`Failed to delete database: ${db.name}`);
              rejectDb(new Error(`Failed to delete database: ${db.name}`));
            };
          });
        });
        
        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(err => reject(err));
      });
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
      resolve(); // Resolve anyway to continue with other operations
    }
  });
}

/**
 * Full reset of app connection state
 * @param hardReset If true, reloads the page after clearing
 */
export async function resetAppConnections(hardReset: boolean = true): Promise<void> {
  try {
    await clearApiCache();
    await clearCookies();
    
    // Also clean up service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    
    if (hardReset) {
      window.location.reload();
    }
  } catch (error) {
    console.error('Error resetting app connections:', error);
  }
}

/**
 * Clear cookies that might affect API connections
 */
async function clearCookies(): Promise<void> {
  try {
    // We can't directly clear cookies with JavaScript security limitations,
    // but we can clear session cookies by setting their expiration date to the past
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    });
  } catch (error) {
    console.error('Error clearing cookies:', error);
  }
}

/**
 * Check connection health and suggest fixes
 * @returns Object with connection status and recommended actions
 */
export async function checkConnectionHealth(): Promise<{
  isHealthy: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check API connection
  const isApiConnected = await checkApiConnection();
  if (!isApiConnected) {
    issues.push('Cannot connect to the API server');
    recommendations.push('Check your internet connection');
    recommendations.push('Try clearing browser cache and cookies');
  }
  
  // Check for localStorage space issues
  try {
    const testKey = 'connection_test';
    const testData = 'A'.repeat(1024); // 1KB of data
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
  } catch (error) {
    issues.push('LocalStorage is full or unavailable');
    recommendations.push('Clear browser storage for this site');
  }
  
  // Check if cookies are enabled
  if (!navigator.cookieEnabled) {
    issues.push('Cookies are disabled in your browser');
    recommendations.push('Enable cookies for this site');
  }
  
  // Check for CORS issues by adding a canary request
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/`, {
      method: 'OPTIONS',
      mode: 'cors',
    });
  } catch (error) {
    issues.push('CORS issues detected');
    recommendations.push('Try using a different browser');
    recommendations.push('Disable browser extensions that might block requests');
  }
  
  // If no specific issues found but API is still not connected
  if (issues.length === 0 && !isApiConnected) {
    issues.push('Unknown connection issue');
    recommendations.push('Try resetting app connections');
    recommendations.push('Reload the page and try again');
  }
  
  return {
    isHealthy: isApiConnected && issues.length === 0,
    issues,
    recommendations
  };
}

export default clearConnectionIssues;
