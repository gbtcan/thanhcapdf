/**
 * Error handling utilities for the application
 */

import { AuthError, PostgrestError } from '@supabase/supabase-js';
import { captureException } from './analytics';

// Custom error types
export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Handle Supabase errors by transforming them into more user-friendly errors
 */
export function handleSupabaseError(error: unknown): Error {
  if (!error) return new Error('Unknown error');
  
  // Log the error for analysis
  if (import.meta.env.PROD) {
    captureException(error);
  } else {
    // Log detailed error info in development mode
    console.log('Supabase error details:', JSON.stringify(error, null, 2));
    
    // Kiểm tra lỗi PGRST200 - Relationship errors
    if (typeof error === 'object' && 
        error !== null && 
        'code' in error && 
        error.code === 'PGRST200') {
      console.warn(`RELATIONSHIP ERROR: ${(error as any).message}`);
      console.warn(`HINT: ${(error as any).hint}`);
      console.warn(`DETAILS: ${(error as any).details}`);
    }
  }
  
  // Check for relationship errors first (PGRST201)
  if (typeof error === 'object' && 
      error !== null && 
      'code' in error && 
      error.code === 'PGRST201') {
    console.warn('Relationship error occurred. Details:', (error as any).details);
    return new Error(`Database relationship error. Details: ${(error as any).hint || (error as any).message}`);
  }
  
  // Convert to string for error message if needed
  const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return JSON.stringify(err);
  };

  // Handle PostgrestError from Supabase
  if (isPgError(error)) {
    const pgError = error as PostgrestError;
    
    // Authentication/permission errors
    if (pgError.code === '42501' || pgError.code === '3F000') {
      return new PermissionError('You do not have permission to perform this action.');
    }
    
    // Not found errors
    if (pgError.code === '42P01') { // Table not found
      return new NotFoundError('The requested resource does not exist.');
    }
    
    // Constraint violations
    if (pgError.code?.startsWith('23')) {
      return new ValidationError(`Data validation failed: ${getErrorMessage(pgError)}`);
    }
    
    // Default PostgrestError handling
    return new Error(`Database error: ${getErrorMessage(pgError)}`);
  }

  // Handle AuthError from Supabase
  if (isAuthError(error)) {
    const authError = error as AuthError;
    return new AuthenticationError(`Authentication error: ${authError.message}`, authError);
  }
  
  // Handle network errors
  if (isNetworkError(error)) {
    return new NetworkError('Network error: Unable to connect to the server. Please check your internet connection.');
  }
  
  // Handle generic Error objects
  if (error instanceof Error) {
    return error;
  }
  
  // Handle unknown errors
  return new Error(getErrorMessage(error));
}

// Type guards for error types
function isPgError(error: unknown): boolean {
  return typeof error === 'object' && 
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error;
}

function isAuthError(error: unknown): boolean {
  return error instanceof AuthError;
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const networkErrorMessages = [
    'failed to fetch',
    'network request failed',
    'network error',
    'networkerror',
    'timeout',
    'connection refused',
    'can\'t connect to server'
  ];
  
  const errorMsg = error.message.toLowerCase();
  return networkErrorMessages.some(msg => errorMsg.includes(msg));
}

/**
 * Convert an error to a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Đã xảy ra lỗi không xác định.';
  
  if (error instanceof NetworkError) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.';
  }
  
  if (error instanceof AuthenticationError) {
    return 'Lỗi xác thực: ' + error.message;
  }
  
  if (error instanceof NotFoundError) {
    return 'Không tìm thấy tài nguyên yêu cầu.';
  }
  
  if (error instanceof PermissionError) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  
  if (error instanceof ValidationError) {
    return 'Dữ liệu không hợp lệ: ' + error.message;
  }
  
  if (error instanceof Error) {
    return import.meta.env.DEV 
      ? `Lỗi: ${error.message}` 
      : 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
  }
  
  return 'Đã xảy ra lỗi không xác định.';
}

/**
 * Log errors with appropriate context
 */
export function logError(error: unknown, context?: string): void {
  // For development/debugging purposes
  if (import.meta.env.DEV) {
    console.group(context || 'Application Error');
    console.error(error);
    console.groupEnd();
  } else {
    // In production, could send to a logging service
    console.error(`[${context || 'ERROR'}]`, error);
    
    // Here you could add code to log to an external service
    // like Sentry, LogRocket, etc.
  }
}
