/**
 * API functions for checking network connectivity and server status
 */

import { CLIENT_CONFIG } from '../../config/clientConfig';
import { checkInternetConnection, pingSupabaseHealth } from '../../lib/network';

export interface NetworkStatusResult {
  isOnline: boolean;
  isInternetReachable: boolean;
  isApiReachable: boolean;
  connectionQuality: 'good' | 'medium' | 'poor';
  lastChecked: Date;
}

export interface ServiceReachabilityResult {
  reachable: boolean;
  responseTime: number; // in milliseconds
  error?: string;
}

/**
 * Check if the device has internet connectivity
 */
export async function checkNetworkConnectivity(): Promise<NetworkStatusResult> {
  const startTime = Date.now();
  const isOnline = navigator.onLine;
  let isInternetReachable = false;
  let isApiReachable = false;
  let connectionQuality: 'good' | 'medium' | 'poor' = 'poor';
  let pingTime = 0;
  
  if (isOnline) {
    // First check internet connectivity
    isInternetReachable = await checkInternetConnection();
    
    // If internet is available, check API
    if (isInternetReachable) {
      const healthResult = await pingSupabaseHealth(CLIENT_CONFIG.supabase.url);
      isApiReachable = healthResult.status !== 'offline';
      pingTime = healthResult.ping;
      
      // Determine connection quality based on ping time
      if (pingTime === 0) {
        connectionQuality = 'poor';
      } else if (pingTime < 300) {
        connectionQuality = 'good';
      } else if (pingTime < 700) {
        connectionQuality = 'medium';
      } else {
        connectionQuality = 'poor';
      }
    }
  }
  
  return {
    isOnline,
    isInternetReachable,
    isApiReachable,
    connectionQuality,
    lastChecked: new Date()
  };
}

/**
 * Check if a specific endpoint is reachable
 */
export async function checkServiceReachability(
  url: string,
  timeout = 5000
): Promise<ServiceReachabilityResult> {
  try {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    return {
      reachable: true,
      responseTime
    };
  } catch (error) {
    return {
      reachable: false,
      responseTime: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Scheduled job to periodically check network status
 */
export class NetworkMonitor {
  private intervalId: number | NodeJS.Timeout | null = null;
  private callbacks: ((status: NetworkStatusResult) => void)[] = [];
  private lastStatus: NetworkStatusResult | null = null;
  
  /**
   * Start periodic monitoring
   */
  public startMonitoring(intervalMs = 60000): void {
    // Stop any existing monitoring
    this.stopMonitoring();
    
    // Initial check
    this.checkStatus();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkStatus();
    }, intervalMs);
  }
  
  /**
   * Stop periodic monitoring
   */
  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId as NodeJS.Timeout);
      this.intervalId = null;
    }
  }
  
  /**
   * Add a status change callback
   */
  public addStatusCallback(
    callback: (status: NetworkStatusResult) => void
  ): () => void {
    this.callbacks.push(callback);
    
    // If we already have a status, call immediately
    if (this.lastStatus) {
      callback(this.lastStatus);
    }
    
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Perform status check and notify callbacks
   */
  private async checkStatus(): Promise<void> {
    const status = await checkNetworkConnectivity();
    this.lastStatus = status;
    
    // Notify all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in network status callback:', error);
      }
    });
  }
  
  /**
   * Force an immediate status check
   */
  public async forceCheck(): Promise<NetworkStatusResult> {
    return await this.checkStatus() as unknown as NetworkStatusResult;
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();
