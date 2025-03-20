/**
 * General formatting utilities for displaying data in the UI
 */
import { formatRelativeTime as getRelativeTime, formatDisplayDate } from './dateUtils';

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number | null | undefined, locale?: string): string {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format file size in a human-readable way (e.g. "2.5 MB", "350 KB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

/**
 * Format a date with customizable options
 */
export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
      
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Truncate text if it exceeds a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

/**
 * Truncate a string to the specified length and add an ellipsis if needed
 */
export function truncateString(str: string, maxLength: number, ellipsis = '...'): string {
  if (!str) return '';
  
  if (str.length <= maxLength) {
    return str;
  }
  
  const truncatedLength = maxLength - ellipsis.length;
  
  if (truncatedLength < 3) {
    return str.slice(0, maxLength);
  }
  
  return str.slice(0, truncatedLength) + ellipsis;
}

/**
 * Format a percentage for display (e.g. "45%")
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  return `${Math.round(value)}%`;
}

/**
 * Format a phone number in a standard format (XXX) XXX-XXXX
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) return phone;
  
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
}

/**
 * Format a name to show only the first letter of the last name
 */
export function formatShortName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length === 1) return nameParts[0];
  
  const firstName = nameParts[0];
  const lastInitial = nameParts[nameParts.length - 1].charAt(0);
  
  return `${firstName} ${lastInitial}.`;
}

/**
 * Convert plain text URLs to clickable links in text
 */
export function linkifyText(text: string): string {
  if (!text) return '';
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">$1</a>');
}

/**
 * Format a time duration in minutes:seconds format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Format a byte size into a human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a date for display in tables and lists
 */
export function formatTableDate(date: string | Date): string {
  return formatDate(date, { 
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a simple date (yyyy-mm-dd)
 */
export function formatSimpleDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Format a date as a time string (hh:mm)
 */
export function formatTimeString(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toTimeString().split(' ')[0].substring(0, 5);
}

/**
 * Format a date relative to current time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return getRelativeTime(null); // Delegate to dateUtils if null
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Format lyrics for display with proper styling
 * @param lyrics - Raw lyrics text
 * @returns HTML with styled lyrics
 */
export function formatLyrics(lyrics: string): string {
  if (!lyrics) return '';
  
  // Replace line breaks with HTML line breaks
  let formatted = lyrics
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph
  formatted = `<p>${formatted}</p>`;
  
  // Format chorus sections
  formatted = formatted.replace(
    /Chorus:?(.*?)(?=<p>|$)/gs, 
    '<div class="chorus">$1</div>'
  );
  
  // Format verse sections
  formatted = formatted.replace(
    /Verse\s*\d+:?(.*?)(?=<div class="chorus">|<p>|$)/gs, 
    '<div class="verse">$1</div>'
  );
  
  return formatted;
}

// Export a default object with all formatter functions for convenience
export default {
  formatBytes,
  formatNumber,
  formatFileSize,
  formatDate,
  formatTableDate,
  formatSimpleDate,
  formatTimeString,
  formatRelativeTime,
  truncateText,
  truncateString,
  formatPercent,
  formatPhone,
  formatShortName,
  linkifyText,
  formatDuration,
  formatLyrics
};