/**
 * Application-wide error handling
 */
import { PostgrestError } from '@supabase/supabase-js';

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  DATABASE = 'database',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  UNHANDLED = 'unhandled'
}

// Application error structure
export interface AppError {
  message: string;
  category: ErrorCategory;
  originalError?: any;
  code?: string;
  suggestion?: string;
}

/**
 * Convert Supabase errors to AppError format
 */
export function handleSupabaseError(error: PostgrestError | Error | any): AppError {
  // Handle PostgrestError
  if ('code' in error) {
    // Common Supabase/PostgreSQL error codes
    switch (error.code) {
      case '23505': // unique_violation
        return {
          message: 'This record already exists',
          category: ErrorCategory.DATABASE,
          code: error.code,
          originalError: error,
          suggestion: 'Try updating the existing record instead'
        };
      case '42P01': // undefined_table
        return {
          message: 'The table does not exist',
          category: ErrorCategory.DATABASE,
          code: error.code,
          originalError: error,
          suggestion: 'Check your database schema'
        };
      case '42501': // insufficient_privilege
      case '42503': // insufficient_privilege
        return {
          message: 'You do not have permission to perform this action',
          category: ErrorCategory.PERMISSION,
          code: error.code,
          originalError: error
        };
      case 'PGRST200':
        if (error.message.includes('hymns and')) {
          return {
            message: 'Table relationship error',
            category: ErrorCategory.DATABASE,
            code: error.code,
            originalError: error,
            suggestion: "Use 'hymns_new' instead of 'hymns'"
          };
        }
        break;
      default:
        // General database error
        return {
          message: error.message || 'Database operation failed',
          category: ErrorCategory.DATABASE,
          code: error.code,
          originalError: error
        };
    }
  }

  // Handle network errors
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('NetworkError') ||
      error.message?.includes('Network request failed')) {
    return {
      message: 'Network connection error',
      category: ErrorCategory.NETWORK,
      originalError: error,
      suggestion: 'Check your internet connection'
    };
  }

  // Handle authentication errors
  if (error.message?.includes('auth/') || 
      error.message?.includes('auth/user-not-found') ||
      error.message?.includes('Invalid login credentials')) {
    return {
      message: 'Authentication failed',
      category: ErrorCategory.AUTH,
      originalError: error,
      suggestion: 'Please check your credentials'
    };
  }

  // If we can't categorize, return as unhandled
  return {
    message: error.message || 'An unexpected error occurred',
    category: ErrorCategory.UNHANDLED,
    originalError: error
  };
}

/**
 * Log an error with appropriate level and formatting
 */
export function logError(error: AppError | Error): void {
  const appError = error instanceof Error ? 
    handleSupabaseError(error) : error;
    
  // Log with severity based on category
  switch (appError.category) {
    case ErrorCategory.NETWORK:
      console.warn('Network Error:', appError.message);
      break;
    case ErrorCategory.AUTH:
      console.warn('Auth Error:', appError.message);
      break;
    case ErrorCategory.UNHANDLED:
      console.error('Unhandled Error:', appError.message, appError.originalError);
      break;
    default:
      console.error(`${appError.category.toUpperCase()} Error:`, 
        appError.message, 
        appError.code ? `Code: ${appError.code}` : '',
        appError.originalError
      );
  }
  
  // Here you could also send errors to a monitoring service
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: AppError | Error): string {
  const appError = error instanceof Error ? 
    handleSupabaseError(error) : error;
    
  // Return appropriate user-facing message
  switch (appError.category) {
    case ErrorCategory.NETWORK:
      return 'Unable to connect. Please check your internet connection.';
    case ErrorCategory.AUTH:
      return 'Authentication failed. Please check your credentials.';
    case ErrorCategory.PERMISSION:
      return 'You don\'t have permission to perform this action.';
    case ErrorCategory.VALIDATION:
      return appError.message || 'Invalid data. Please check your inputs.';
    case ErrorCategory.DATABASE:
      return 'There was a problem with the database. Please try again later.';
    default:
      return 'Something went wrong. Please try again later.';
  }
}
