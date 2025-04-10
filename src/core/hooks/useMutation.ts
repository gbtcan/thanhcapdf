import { useState, useCallback } from 'react';

interface UseMutationOptions<TData, TVariables, TError> {
  onMutate?: (variables: TVariables) => void | Promise<unknown>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
}

interface UseMutationResult<TData, TVariables, TError> {
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

/**
 * Hook để thay thế useMutation của TanStack React Query
 */
export function useMutation<TData = unknown, TVariables = unknown, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables, TError> = {}
): UseMutationResult<TData, TVariables, TError> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<TError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setIsSuccess(false);
      setError(null);

      try {
        // Run onMutate callback if provided
        if (options.onMutate) {
          await options.onMutate(variables);
        }

        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);

        if (options.onSuccess) {
          options.onSuccess(result, variables);
        }

        if (options.onSettled) {
          options.onSettled(result, null, variables);
        }

        return result;
      } catch (err) {
        const mutationError = err as TError;
        setError(mutationError);
        setIsSuccess(false);

        if (options.onError) {
          options.onError(mutationError, variables);
        }

        if (options.onSettled) {
          options.onSettled(undefined, mutationError, variables);
        }

        throw mutationError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    isSuccess,
    mutate,
    reset
  };
}
