/**
 * Storage utilities for managing local data
 */

// Prefix all storage keys to avoid conflicts
const STORAGE_PREFIX = 'hymn_app_';

/**
 * Save data to localStorage with the app prefix
 * @param key - Storage key 
 * @param data - Data to store
 */
export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedData);
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

/**
 * Get data from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns The stored data or defaultValue
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedData = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param key - Storage key
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

/**
 * Clear all app-related data from localStorage
 */
export function clearAppStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter(
      key => key.startsWith(STORAGE_PREFIX)
    );
    
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing app storage:', error);
  }
}

/**
 * Storage availability check
 * @returns True if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey) === 'test';
    localStorage.removeItem(testKey);
    return result;
  } catch (e) {
    return false;
  }
}

/**
 * Get total size of data stored in localStorage for this app
 * @returns Size in bytes
 */
export function getStorageSize(): number {
  try {
    const keys = Object.keys(localStorage).filter(
      key => key.startsWith(STORAGE_PREFIX)
    );
    
    return keys.reduce((size, key) => {
      const value = localStorage.getItem(key) || '';
      return size + key.length + value.length;
    }, 0);
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}
