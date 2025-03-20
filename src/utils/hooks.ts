import React, { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { supabase } from '../lib/supabase';
import { HymnDetails } from '../types';
import { checkHymnFavorite, toggleHymnFavorite } from '../lib/hymnService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hooks for the application
 */

/**
 * Custom hook to manage a boolean toggle state
 */
export function useToggle(initialState = false): [boolean, () => void] {
  const [value, setValue] = useState(initialState);
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return [value, toggle];
}

/**
 * Custom hook to persist state in localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = React.useCallback((): T => {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      // Check if item exists in localStorage
      if (item === null) {
        return initialValue;
      }

      // Special handling for string values like "system" (not JSON)
      if (typeof initialValue === 'string') {
        return item as unknown as T;
      }

      // Parse stored JSON
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        // For string type values, store directly without JSON.stringify
        if (typeof valueToStore === 'string') {
          window.localStorage.setItem(key, valueToStore as string);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Custom hook for handling hymn favorites
 * @param hymnId - ID of the hymn to favorite/unfavorite
 * @returns Object with favorite state and functions
 */
export function useFavorite(hymnId?: string | number) {
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if hymn is favorited when component mounts or user changes
  useEffect(() => {
    if (!hymnId || !isAuthenticated || !user?.id) {
      setIsFavorited(false);
      return;
    }

    const checkFavoriteStatus = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('hymn_id', hymnId)
          .maybeSingle();

        if (error) throw error;
        setIsFavorited(!!data);
      } catch (err) {
        console.error('Error checking favorite status:', err);
        setError(err instanceof Error ? err : new Error('Failed to check favorite status'));
      } finally {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [hymnId, isAuthenticated, user?.id]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!hymnId || !isAuthenticated || !user?.id) {
      return Promise.reject(new Error('Authentication required'));
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('hymn_id', hymnId);

        if (error) throw error;
        setIsFavorited(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, hymn_id: hymnId }]);

        if (error) throw error;
        setIsFavorited(true);
      }
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err : new Error('Failed to update favorite'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  }, [hymnId, isFavorited, isAuthenticated, user?.id]);

  return { isFavorited, toggleFavorite, isLoading, error };
}

/**
 * Hook for tracking viewport visibility
 * @param options IntersectionObserver options
 * @returns Ref object and boolean indicating visibility
 */
export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);
  
  return { ref, isInView };
}

/**
 * Hook for debouncing values (useful for search inputs)
 * @param value The value to debounce
 * @param delay Delay in ms
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook for subscribing to real-time hymn updates
 * @param hymnId ID of the hymn to subscribe to
 * @returns Object with hymn data and loading state
 */
export function useRealtimeHymn(hymnId: string | undefined) {
  const [hymn, setHymn] = useState<HymnDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!hymnId) {
      setIsLoading(false);
      return;
    }
    
    // Initial fetch
    const fetchHymn = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('hymns')
          .select(`
            *,
            hymn_authors(authors(*)),
            hymn_categories(categories(*)),
            pdf_files(*)
          `)
          .eq('id', hymnId)
          .single();
          
        if (error) throw error;
        
        // Transform the data structure
        const hymnData: HymnDetails = {
          ...data,
          authors: data.hymn_authors?.map((ha: any) => ha.authors) || [],
          categories: data.hymn_categories?.map((hc: any) => hc.categories) || [],
          themes: [],
          pdf_files: data.pdf_files || []
        };
        
        setHymn(hymnData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch hymn'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHymn();
    
    // Set up subscription
    const subscription = supabase
      .channel(`hymn-${hymnId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'hymns',
          filter: `id=eq.${hymnId}`
        }, 
        () => {
          fetchHymn();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [hymnId]);
  
  return { hymn, isLoading, error };
}

/**
 * A custom hook for detecting clicks outside a specified element
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

/**
 * A custom hook for handling API requests with loading, error, and data states
 */
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err as E);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error, isLoading: status === 'pending' };
}

/**
 * Hook to manage fullscreen state for an element
 * @param ref Reference to the element to toggle fullscreen on
 * @returns Object with isFullscreen state and toggleFullscreen function
 */
export function useFullscreen<T extends HTMLElement>(ref: RefObject<T>) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!ref.current) return;

    try {
      if (!isFullscreen) {
        await ref.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  return { isFullscreen, toggleFullscreen };
}

/**
 * Hook to detect window resize events
 * @returns Current window dimensions
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

/**
 * Custom hook for handling screen size checks
 * @returns Object with boolean values for screen sizes
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLargeDesktop: width >= 1280,
      });
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
