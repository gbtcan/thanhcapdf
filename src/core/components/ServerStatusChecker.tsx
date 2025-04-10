import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, RefreshCcw } from "lucide-react";

interface ServerStatusCheckerProps {
  /**
   * URL to check status against
   * @default '/api/health'
   */
  endpoint?: string;
  
  /**
   * Interval in milliseconds between checks
   * @default 60000 (1 minute)
   */
  checkInterval?: number;
  
  /**
   * Whether to show the component when server is online
   * @default false
   */
  showWhenOnline?: boolean;
  
  /**
   * Callback fired when server status changes
   */
  onStatusChange?: (isOnline: boolean) => void;
}

/**
 * Component that checks server status at regular intervals
 */
const ServerStatusChecker: React.FC<ServerStatusCheckerProps> = ({
  endpoint = '/api/health',
  checkInterval = 60000, // 1 minute
  showWhenOnline = false,
  onStatusChange
}) => {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const checkServerStatus = async () => {
    try {
      setStatus('checking');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      clearTimeout(timeoutId);
      
      const isOnline = response.ok;
      const newStatus = isOnline ? 'online' : 'offline';
      
      // Only trigger callback if status changed
      if (newStatus !== status && status !== 'checking') {
        if (onStatusChange) onStatusChange(isOnline);
      }
      
      setStatus(newStatus);
      setLastChecked(new Date());
      
    } catch (error) {
      console.error('Error checking server status:', error);
      
      // Only trigger callback if status changed from online to offline
      if (status === 'online') {
        if (onStatusChange) onStatusChange(false);
      }
      
      setStatus('offline');
      setLastChecked(new Date());
    }
  };
  
  // Initial check
  useEffect(() => {
    checkServerStatus();
  }, []);
  
  // Setup interval
  useEffect(() => {
    const intervalId = setInterval(checkServerStatus, checkInterval);
    return () => clearInterval(intervalId);
  }, [checkInterval]);
  
  // Don't render anything if server is online and showWhenOnline is false
  if (status === 'online' && !showWhenOnline) {
    return null;
  }
  
  return (
    <div className={`rounded-md p-3 flex items-start gap-3 ${
      status === 'online' ? 'bg-green-50 text-green-700' : 
      status === 'offline' ? 'bg-red-50 text-red-700' : 
      'bg-gray-50 text-gray-500'
    }`}>
      <div className="flex-shrink-0 mt-0.5">
        {status === 'online' && <CheckCircle2 className="h-5 w-5" />}
        {status === 'offline' && <AlertTriangle className="h-5 w-5" />}
        {status === 'checking' && <RefreshCcw className="h-5 w-5 animate-spin" />}
      </div>
      
      <div>
        <h4 className="font-medium text-sm">
          {status === 'online' && 'Server is online'}
          {status === 'offline' && 'Server is unreachable'}
          {status === 'checking' && 'Checking server status...'}
        </h4>
        
        {lastChecked && (
          <p className="text-xs opacity-70">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
        
        {status === 'offline' && (
          <button 
            onClick={checkServerStatus}
            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1 bg-white border border-red-200 rounded-md hover:bg-red-50"
          >
            <RefreshCcw className="h-3 w-3" />
            Check Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ServerStatusChecker;
