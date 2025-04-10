/**
 * Network utilities for the application
 */

export type NetworkStatus = 'online' | 'offline' | 'checking';

/**
 * Check if the application is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for network status changes
 */
export function listenNetworkChanges(
  onStatusChange: (status: NetworkStatus) => void
): () => void {
  const handleOnline = () => onStatusChange('online');
  const handleOffline = () => onStatusChange('offline');
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Check if a service is available by pinging it
 */
export async function checkServiceAvailability(
  url: string,
  timeout = 5000
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Check internet connection by fetching a known reliable endpoint
 */
export async function checkInternetConnection(
  timeout = 5000
): Promise<boolean> {
  // Try multiple sources in case one is blocked or down
  const endpoints = [
    'https://www.google.com/generate_204',
    'https://connectivitycheck.gstatic.com/generate_204',
    'https://www.cloudflare.com/cdn-cgi/trace'
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Try endpoints in sequence
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return true;
      } catch (err) {
        // Try next endpoint if this one fails
        continue;
      }
    }
    
    // If we get here, all endpoints failed
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Ping the Supabase API health endpoint
 */
export async function pingSupabaseHealth(
  supabaseUrl: string,
  timeout = 5000
): Promise<{ status: 'healthy' | 'degraded' | 'offline', ping: number }> {
  try {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const url = `${supabaseUrl.replace(/\/$/, '')}/rest/health`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    
    const ping = Math.round(endTime - startTime);
    
    if (response.ok) {
      return { status: 'healthy', ping };
    } else if (response.status >= 500) {
      return { status: 'degraded', ping };
    }
    
    return { status: 'healthy', ping };
  } catch (error) {
    return { status: 'offline', ping: 0 };
  }
}

/**
 * Helper class to track connection quality
 */
export class ConnectionQualityMonitor {
  private pingHistory: number[] = [];
  private maxSamples = 5;
  private pingThresholds = {
    good: 300,  // Under 300ms is considered good
    medium: 700, // 300-700ms is medium
    // over 700ms is considered poor
  };
  
  constructor(maxSamples = 5) {
    this.maxSamples = maxSamples;
  }
  
  /**
   * Add a ping sample to the history
   */
  public addPingSample(ping: number): void {
    this.pingHistory.push(ping);
    
    // Keep only the last N samples
    if (this.pingHistory.length > this.maxSamples) {
      this.pingHistory.shift();
    }
  }
  
  /**
   * Get the average ping from recent samples
   */
  public getAveragePing(): number {
    if (this.pingHistory.length === 0) return 0;
    
    const sum = this.pingHistory.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / this.pingHistory.length);
  }
  
  /**
   * Get the connection quality based on recent pings
   */
  public getConnectionQuality(): 'good' | 'medium' | 'poor' {
    const avgPing = this.getAveragePing();
    
    if (avgPing === 0) return 'poor';
    if (avgPing < this.pingThresholds.good) return 'good';
    if (avgPing < this.pingThresholds.medium) return 'medium';
    return 'poor';
  }
  
  /**
   * Clear all ping history
   */
  public clearHistory(): void {
    this.pingHistory = [];
  }
}
