import { networkMonitor } from '../../core/api/networkAPI';
import { CLIENT_CONFIG } from '../../config/clientConfig';

/**
 * Service to monitor network status and handle connectivity issues
 */
export class NetworkMonitorService {
  private static instance: NetworkMonitorService;
  private isMonitoring = false;
  
  // Callbacks for different events
  private onOfflineCallbacks: Array<() => void> = [];
  private onOnlineCallbacks: Array<() => void> = [];
  private onApiUnreachableCallbacks: Array<() => void> = [];
  private onApiReachableCallbacks: Array<() => void> = [];
  
  /**
   * Get singleton instance
   */
  public static getInstance(): NetworkMonitorService {
    if (!NetworkMonitorService.instance) {
      NetworkMonitorService.instance = new NetworkMonitorService();
    }
    return NetworkMonitorService.instance;
  }
  
  /**
   * Start network monitoring
   */
  public startMonitoring(checkIntervalMs = 60000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Start monitoring network
    networkMonitor.startMonitoring(checkIntervalMs);
    
    // Register status change callback
    networkMonitor.addStatusCallback(status => {
      this.handleStatusChange(status);
    });
    
    // Initial network check
    networkMonitor.forceCheck();
    
    console.log('Network monitoring started.');
  }
  
  /**
   * Stop network monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    networkMonitor.stopMonitoring();
    this.isMonitoring = false;
    
    console.log('Network monitoring stopped.');
  }
  
  /**
   * Handle network status changes
   */
  private handleStatusChange(status: any): void {
    // Handle online/offline state
    if (!status.isOnline) {
      this.notifyOffline();
    } else {
      this.notifyOnline();
    }
    
    // Handle API reachability
    if (status.isOnline && !status.isApiReachable) {
      this.notifyApiUnreachable();
    } else if (status.isOnline && status.isApiReachable) {
      this.notifyApiReachable();
    }
    
    // Save the last status to localStorage for offline detection on app load
    try {
      localStorage.setItem('network_last_status', JSON.stringify({
        timestamp: new Date().toISOString(),
        isOnline: status.isOnline,
        isApiReachable: status.isApiReachable,
        connectionQuality: status.connectionQuality
      }));
    } catch (error) {
      // Ignore localStorage errors
    }
  }
  
  /**
   * Register callbacks for network events
   */
  public onOffline(callback: () => void): () => void {
    this.onOfflineCallbacks.push(callback);
    return () => {
      this.onOfflineCallbacks = this.onOfflineCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public onOnline(callback: () => void): () => void {
    this.onOnlineCallbacks.push(callback);
    return () => {
      this.onOnlineCallbacks = this.onOnlineCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public onApiUnreachable(callback: () => void): () => void {
    this.onApiUnreachableCallbacks.push(callback);
    return () => {
      this.onApiUnreachableCallbacks = this.onApiUnreachableCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public onApiReachable(callback: () => void): () => void {
    this.onApiReachableCallbacks.push(callback);
    return () => {
      this.onApiReachableCallbacks = this.onApiReachableCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify callbacks
   */
  private notifyOffline(): void {
    this.onOfflineCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in offline callback:', error);
      }
    });
  }
  
  private notifyOnline(): void {
    this.onOnlineCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in online callback:', error);
      }
    });
  }
  
  private notifyApiUnreachable(): void {
    this.onApiUnreachableCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in API unreachable callback:', error);
      }
    });
  }
  
  private notifyApiReachable(): void {
    this.onApiReachableCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in API reachable callback:', error);
      }
    });
  }
  
  /**
   * Force a network check
   */
  public forceCheck(): Promise<any> {
    return networkMonitor.forceCheck();
  }
}

// Export singleton instance
export const networkMonitorService = NetworkMonitorService.getInstance();
