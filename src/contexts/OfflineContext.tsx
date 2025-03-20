import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineContextProps {
  isOffline: boolean;
  hasInternetConnection: () => Promise<boolean>;
  lastSyncTime: Date | null;
  setLastSyncTime: (time: Date) => void;
}

const OfflineContext = createContext<OfflineContextProps>({
  isOffline: false,
  hasInternetConnection: async () => true,
  lastSyncTime: null,
  setLastSyncTime: () => {}
});

export const useOffline = () => useContext(OfflineContext);

export const OfflineProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Function to check internet connectivity
  const hasInternetConnection = async (): Promise<boolean> => {
    try {
      // Try to fetch a small resource from Google
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Check connectivity when online/offline events fire
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    hasInternetConnection().then(
      online => setIsOffline(!online)
    );
    
    // Load last sync time from storage
    const savedSyncTime = localStorage.getItem('last_sync_time');
    if (savedSyncTime) {
      setLastSyncTime(new Date(savedSyncTime));
    }
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Save last sync time to storage when changed
  const updateLastSyncTime = (time: Date) => {
    setLastSyncTime(time);
    localStorage.setItem('last_sync_time', time.toISOString());
  };
  
  return (
    <OfflineContext.Provider 
      value={{ 
        isOffline, 
        hasInternetConnection, 
        lastSyncTime, 
        setLastSyncTime: updateLastSyncTime 
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineContext;
