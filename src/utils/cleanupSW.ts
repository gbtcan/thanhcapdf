/**
 * Utility to clean up service workers
 * Useful during development or when updating the app to a new version
 */

/**
 * Unregister all service workers and clear caches
 * @returns Promise that resolves when the operation is complete
 */
export async function cleanupServiceWorkers(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported in this browser');
    return false;
  }

  try {
    // Get all service worker registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    // Unregister each service worker
    await Promise.all(
      registrations.map(registration => registration.unregister())
    );
    
    console.log(`Unregistered ${registrations.length} Service Workers`);
    
    // Clear caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log(`Cleared ${cacheNames.length} caches`);
    }
    
    return true;
  } catch (error) {
    console.error('Error cleaning up Service Workers:', error);
    return false;
  }
}

/**
 * Get information about current service workers
 * @returns Object with service worker information
 */
export async function getServiceWorkerInfo(): Promise<{
  supported: boolean;
  registered: boolean;
  count: number;
  registrations: { scope: string; waiting: boolean; active: boolean }[];
}> {
  if (!('serviceWorker' in navigator)) {
    return {
      supported: false,
      registered: false,
      count: 0,
      registrations: []
    };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    return {
      supported: true,
      registered: registrations.length > 0,
      count: registrations.length,
      registrations: registrations.map(reg => ({
        scope: reg.scope,
        waiting: !!reg.waiting,
        active: !!reg.active
      }))
    };
  } catch (error) {
    console.error('Error getting Service Worker info:', error);
    return {
      supported: true,
      registered: false,
      count: 0,
      registrations: []
    };
  }
}

/**
 * Cleanup everything and reload the page
 * Useful as a last resort for issues
 */
export function forceCleanupAndReload(): void {
  // Show a loading message
  const loadingEl = document.createElement('div');
  loadingEl.style.position = 'fixed';
  loadingEl.style.top = '0';
  loadingEl.style.left = '0';
  loadingEl.style.width = '100%';
  loadingEl.style.height = '100%';
  loadingEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
  loadingEl.style.color = 'white';
  loadingEl.style.display = 'flex';
  loadingEl.style.alignItems = 'center';
  loadingEl.style.justifyContent = 'center';
  loadingEl.style.zIndex = '9999';
  loadingEl.style.fontSize = '18px';
  loadingEl.textContent = 'Cleaning up and refreshing...';
  document.body.appendChild(loadingEl);
  
  // Cleanup
  Promise.all([
    cleanupServiceWorkers(),
    // Clear session storage
    new Promise<void>(resolve => {
      sessionStorage.clear();
      resolve();
    }),
    // Clear local storage
    new Promise<void>(resolve => {
      // Keep important user settings
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) localStorage.setItem('theme', theme);
      resolve();
    })
  ]).finally(() => {
    // Hard reload the page
    window.location.href = window.location.origin + window.location.pathname + '?fresh=' + Date.now();
  });
}

/**
 * Add a cleanup button to the page (for development)
 */
export function addCleanupButton(): void {
  if (!import.meta.env.DEV) return;
  
  const button = document.createElement('button');
  button.textContent = 'Cleanup App';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '8px 12px';
  button.style.backgroundColor = '#ff4757';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.addEventListener('click', () => {
    if (confirm('This will clear all cached data and reload the app. Continue?')) {
      forceCleanupAndReload();
    }
  });
  
  document.body.appendChild(button);
}

export default cleanupServiceWorkers;
