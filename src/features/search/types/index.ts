/**
 * Type definitions for the Search feature
 */

export interface SearchParams {
  query: string;
  filters?: {
    types?: ('hymn' | 'author' | 'theme' | 'post')[];
    themes?: string[];
    authors?: string[];
    tags?: string[];
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResultItem {
  id: string;
  type: 'hymn' | 'author' | 'theme' | 'post';
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  highlights?: SearchHighlight[];
  score?: number;
  additionalData?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'hymn' | 'author' | 'theme' | 'post';
  excerpt?: string;
  matchType?: 'title' | 'content' | 'tag';
  score?: number;
  data?: any; // Additional data specific to the result type
}

export interface SearchFilterOptions {
  type?: string;
  author?: string;
  theme?: string;
  tag?: string;
  startYear?: number;
  endYear?: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  totalResults: number;
  loading: boolean;
  error: Error | null;
  filters: SearchFilterOptions;
  page: number;
  pageSize: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchHighlight {
  field: string;
  snippet: string;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  page: number;
  totalPages: number;
  query: string;
}
