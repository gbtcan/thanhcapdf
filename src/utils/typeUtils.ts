import type { Author, Category } from '../types';

/**
 * Type utilities for the application
 */

/**
 * Makes specific properties of T required
 */
export type RequireProperties<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Makes specific properties of T optional
 */
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Picks a subset of properties from T and makes them required
 */
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

/**
 * Creates a type with all properties from T except those in K
 */
export type OmitProperties<T, K extends keyof T> = Omit<T, K>;

/**
 * Creates a type for API responses with data and error properties
 */
export type ApiResponse<T> = {
  data?: T;
  error?: {
    message: string;
    code?: string | number;
    details?: unknown;
  };
};

/**
 * Creates a type for pagination parameters
 */
export type PaginationParams = {
  page: number;
  pageSize: number;
};

/**
 * Creates a paginated result type
 */
export type PaginatedResult<T> = {
  data: T[];
  meta: {
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a key exists in an object
 */
export function hasProperty<K extends string>(obj: unknown, key: K): obj is { [key in K]: unknown } {
  return isObject(obj) && key in obj;
}

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * Type guard for nested Supabase responses
 */
export function hasAuthors(obj: unknown): obj is { authors: Author } {
  return isObject(obj) && 'authors' in obj && isObject(obj.authors);
}

export function hasCategories(obj: unknown): obj is { categories: Category } {
  return isObject(obj) && 'categories' in obj && isObject(obj.categories);
}

/**
 * Helper to safely access nested properties with type validation
 */
export function safelyMapNestedProperty<T, K extends keyof T>(
  array: T[] | undefined | null,
  propertyName: K
): T[K][] {
  if (!array || !Array.isArray(array)) return [];
  return array
    .map(item => item[propertyName])
    .filter((item): item is NonNullable<T[K]> => item !== undefined && item !== null);
}
