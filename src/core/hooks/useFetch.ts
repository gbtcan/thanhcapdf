import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refetchInterval?: number | false;
}

interface UseFetchResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook để thay thế useQuery của TanStack React Query
 */
export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const {
    initialData,
    enabled = true,
    onSuccess,
    onError,
    refetchInterval = false
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(fetchError);
      
      if (onError) {
        onError(fetchError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  // Set up interval refetching if needed
  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    
    const intervalId = setInterval(() => {
      fetchData();
    }, refetchInterval);
    
    return () => clearInterval(intervalId);
  }, [refetchInterval, fetchData, enabled]);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    refetch: fetchData
  };
}
