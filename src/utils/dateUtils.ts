/**
 * This file is a compatibility layer for legacy code using dateUtils.
 * It re-exports functions from formatters.ts which is the new standard.
 */

import {
  formatDate as formatDateFn,
  formatTime,
  formatDateTime,
  formatRelativeTime,
} from './formatters';

/**
 * Date and time utility functions for formatting and manipulating dates
 */

// Default date and time formats
const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
};

const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = { 
  hour: 'numeric', 
  minute: 'numeric', 
  hour12: true 
};

const DEFAULT_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = { 
  ...DEFAULT_DATE_FORMAT,
  ...DEFAULT_TIME_FORMAT
};

/**
 * Format a date string to a readable format
 * 
 * @param dateString ISO date string to format
 * @param options Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT
): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
}

/**
 * Format time to 12-hour format (e.g., "2:30 PM")
 */
export function formatTime(
  dateString: string | Date | null | undefined,
  includeSeconds = false
): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid time';
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    if (includeSeconds) {
      options.second = '2-digit';
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Error';
  }
}

/**
 * Format date and time for display in UI
 */
export function formatDateTime(
  dateString: string | Date | null | undefined
): string {
  if (!dateString) return 'N/A';
  
  return formatDate(dateString, DEFAULT_DATE_TIME_FORMAT);
}

/**
 * Format date as a relative time string (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    if (diffInSeconds < 5) {
      return 'just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? 'yesterday' : `${diffInDays} days ago`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    } else {
      return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown';
  }
}

// For backward compatibility, also export as getRelativeTime
export const getRelativeTime = formatRelativeTime;

/**
 * Check if a date is today
 */
export function isToday(dateString: string | Date | null | undefined): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  } catch {
    return false;
  }
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(dateString: string | Date | null | undefined): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  } catch {
    return false;
  }
}

/**
 * Format a date to a friendly string like "Today", "Yesterday", or the formatted date
 */
export function formatFriendlyDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  if (isToday(dateString)) {
    return 'Today';
  } else if (isYesterday(dateString)) {
    return 'Yesterday';
  } else {
    return formatDate(dateString);
  }
}

/**
 * Get number of days between two dates
 */
export function getDaysBetween(startDate: Date | string, endDate: Date | string = new Date()): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());
  
  // Convert to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get date ranges for common time periods
 */
export function getDateRanges() {
  const today = new Date();
  
  // Start of today
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  
  // Start of this week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Start of this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  // Start of this year
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0);
  
  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  // Last week
  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  // Last month
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  lastMonthStart.setHours(0, 0, 0, 0);
  
  // Last year
  const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
  lastYearStart.setHours(0, 0, 0, 0);
  
  return {
    today: {
      start: startOfToday,
      end: today
    },
    yesterday: {
      start: yesterday,
      end: startOfToday
    },
    thisWeek: {
      start: startOfWeek,
      end: today
    },
    lastWeek: {
      start: lastWeekStart,
      end: startOfWeek
    },
    thisMonth: {
      start: startOfMonth,
      end: today
    },
    lastMonth: {
      start: lastMonthStart,
      end: startOfMonth
    },
    thisYear: {
      start: startOfYear,
      end: today
    },
    lastYear: {
      start: lastYearStart,
      end: startOfYear
    }
  };
}

// Alias for backward compatibility
export const formatDisplayDate = formatDate;

// Export everything from this module
export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  isToday,
  isYesterday,
  formatFriendlyDate,
  getDaysBetween,
  addDays,
  getDateRanges,
  formatDisplayDate,
  getRelativeTime
};
