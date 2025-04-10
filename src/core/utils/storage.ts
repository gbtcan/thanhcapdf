/**
 * Storage utilities for working with localStorage and sessionStorage
 */

import { parse, stringify } from 'superjson';

// Storage key constants
export const STORAGE_KEYS = {
  THEME: 'theme',
  FAVORITES: 'favorites',
  RECENT_HYMNS: 'recent-hymns',
  AUTH_TOKEN: 'auth-token',
  OFFLINE_ENABLED: 'offline-enabled',
  OFFLINE_HYMNS: 'offline-hymns',
  OFFLINE_PENDING_CHANGES: 'offline-pending-changes',
  OFFLINE_SYNC_STATUS: 'offline-sync-status',
  SEARCH_HISTORY: 'search-history',
  USER_SETTINGS: 'user-settings',
  APP_VERSION: 'app-version',
  APP_LAST_UPDATE_CHECK: 'app-last-update-check',
  WHATS_NEW_SHOWN: 'whats-new-shown',
};

/**
 * Options for storage operations
 */
interface StorageOptions<T> {
  defaultValue?: T;
  session?: boolean; // Use sessionStorage instead of localStorage
}

/**
 * Get an item from storage
 * 
 * @param key - The storage key
 * @param options - Storage options
 * @returns The stored value or defaultValue if not found
 */
export function getStorageItem<T>(key: string, options: StorageOptions<T> = {}): T | null {
  try {
    const storage = options.session ? sessionStorage : localStorage;
    const item = storage.getItem(key);
    
    if (item === null) {
      return options.defaultValue !== undefined ? options.defaultValue : null;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from ${options.session ? 'session' : 'local'} storage:`, error);
    return options.defaultValue !== undefined ? options.defaultValue : null;
  }
}

/**
 * Set an item in storage
 * 
 * @param key - The storage key
 * @param value - The value to store
 * @param options - Storage options
 * @returns true if successful, false otherwise
 */
export function setStorageItem<T>(key: string, value: T, options: StorageOptions<T> = {}): boolean {
  try {
    const storage = options.session ? sessionStorage : localStorage;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to ${options.session ? 'session' : 'local'} storage:`, error);
    return false;
  }
}

/**
 * Remove an item from storage
 * 
 * @param key - The storage key
 * @param options - Storage options
 * @returns true if successful, false otherwise
 */
export function removeStorageItem(key: string, options: StorageOptions<unknown> = {}): boolean {
  try {
    const storage = options.session ? sessionStorage : localStorage;
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from ${options.session ? 'session' : 'local'} storage:`, error);
    return false;
  }
}

/**
 * Clear all items in storage
 * 
 * @param options - Storage options
 * @returns true if successful, false otherwise
 */
export function clearStorage(options: StorageOptions<unknown> = {}): boolean {
  try {
    const storage = options.session ? sessionStorage : localStorage;
    storage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing ${options.session ? 'session' : 'local'} storage:`, error);
    return false;
  }
}
