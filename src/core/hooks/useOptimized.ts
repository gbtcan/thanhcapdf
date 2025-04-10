import { useCallback, useMemo, useRef } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Custom hook để tạo referential stable callbacks
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;
  
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Custom hook để memoize giá trị với deep comparison
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !isEqual(deps, ref.current.deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

/**
 * Hook để memoize mảng items và tránh re-renders không cần thiết
 */
export function useStableArray<T>(array: T[]): T[] {
  return useDeepMemo(() => array, [array]);
}

/**
 * Hook để memoize object và tránh re-renders không cần thiết
 */
export function useStableObject<T extends object>(obj: T): T {
  return useDeepMemo(() => obj, [obj]);
}
