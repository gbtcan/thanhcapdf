/**
 * Application version management
 */
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage';
import { useEffect } from 'react';

// Current app version - should be updated with each release
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

interface VersionInfo {
  version: string;
  installDate: string; // ISO date string
  lastUpdateCheck: string;
  lastUpdateDate?: string; // ISO date string
}

/**
 * Get application version information
 */
export function getVersionInfo(): VersionInfo {
  const storedInfo = getStorageItem<VersionInfo>(STORAGE_KEYS.APP_VERSION);
  
  if (!storedInfo) {
    // First time installation or storage was cleared
    const newInfo: VersionInfo = {
      version: APP_VERSION,
      installDate: new Date().toISOString(),
      lastUpdateCheck: new Date().toISOString()
    };
    setStorageItem(STORAGE_KEYS.APP_VERSION, newInfo);
    return newInfo;
  }
  
  return storedInfo;
}

/**
 * Check if app has been updated since last use
 */
export function checkForVersionChange(): boolean {
  const storedInfo = getVersionInfo();
  
  if (storedInfo.version !== APP_VERSION) {
    // Update stored version info
    const updatedInfo: VersionInfo = {
      ...storedInfo,
      version: APP_VERSION,
      lastUpdateDate: new Date().toISOString()
    };
    setStorageItem(STORAGE_KEYS.APP_VERSION, updatedInfo);
    return true;
  }
  
  return false;
}

/**
 * Update lastUpdateCheck timestamp
 */
export function updateCheckTimestamp(): void {
  const storedInfo = getVersionInfo();
  
  const updatedInfo: VersionInfo = {
    ...storedInfo,
    lastUpdateCheck: new Date().toISOString()
  };
  setStorageItem(STORAGE_KEYS.APP_VERSION, updatedInfo);
}

/**
 * Format version number for display
 */
export function formatVersion(version: string): string {
  return `v${version}`;
}

/**
 * Get days since installation
 */
export function getDaysSinceInstall(): number {
  const storedInfo = getVersionInfo();
  const installDate = new Date(storedInfo.installDate);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - installDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Hook for checking for version change on app launch
 * @param onVersionChange Callback function to execute when version changes
 */
export function useVersionCheck(onVersionChange?: () => void): void {
  useEffect(() => {
    const hasVersionChanged = checkForVersionChange();
    if (hasVersionChanged && onVersionChange) {
      onVersionChange();
    }
  }, [onVersionChange]);
}
