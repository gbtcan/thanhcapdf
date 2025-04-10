/**
 * Analytics utilities for tracking user behavior and errors
 * Can be configured to use different analytics providers
 */

// Set to true to disable analytics in specific environments
const ANALYTICS_DISABLED = 
  import.meta.env.DEV ||
  import.meta.env.MODE === 'test' || 
  window.location.hostname === 'localhost';

/**
 * Track a page view
 */
export function trackPageView(path: string): void {
  if (ANALYTICS_DISABLED) {
    console.debug('[Analytics] Page view:', path);
    return;
  }
  
  try {
    // Send to Google Analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        page_path: path
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Track an event
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (ANALYTICS_DISABLED) {
    console.debug('[Analytics] Event:', { category, action, label, value });
    return;
  }
  
  try {
    // Send to Google Analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track user timing
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  if (ANALYTICS_DISABLED) {
    console.debug('[Analytics] Timing:', { category, variable, value, label });
    return;
  }
  
  try {
    // Send to Google Analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'timing_complete', {
        name: variable,
        event_category: category,
        event_label: label,
        value: Math.round(value)
      });
    }
  } catch (error) {
    console.error('Error tracking timing:', error);
  }
}

/**
 * Capture an exception/error
 */
export function captureException(error: unknown): void {
  if (ANALYTICS_DISABLED) {
    console.debug('[Analytics] Error captured:', error);
    return;
  }
  
  try {
    // Send to Google Analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'exception', {
        description: error instanceof Error ? error.message : String(error),
        fatal: false
      });
    }
    
    // Send to other error tracking services if needed
    // e.g., Sentry
  } catch (err) {
    console.error('Error capturing exception:', err);
  }
}

/**
 * Set user properties for analytics
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (ANALYTICS_DISABLED) {
    console.debug('[Analytics] Set user properties:', properties);
    return;
  }
  
  try {
    // Send to Google Analytics if available
    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', properties);
    }
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
}

// Types for global analytics objects
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      actionOrTarget: string,
      params?: Record<string, any>
    ) => void;
  }
}
