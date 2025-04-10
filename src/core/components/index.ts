/**
 * Core Components Barrel File
 * 
 * This file re-exports all core components for easier imports
 */

// UI Components
export * from './ui/button';
export * from './ui/card';
export * from './ui/dialog';
export * from './ui/input';
export * from './ui/select';
export * from './ui/textarea';
export * from './ui/toggle';
export * from './ui/badge';
export * from './ui/accordion';
export * from './ui/alert';
export * from './ui/popover';
export * from './ui/tabs';
export * from './ui/skeleton';

// Layout Components
export { default as ErrorFallback } from './ErrorFallback';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as LoadingIndicator } from './LoadingIndicator';
export { default as PageLoadingIndicator } from './PageLoadingIndicator';
export { default as AlertBanner } from './AlertBanner';
export { default as Modal } from './Modal';
export { default as OptimizedImage } from './OptimizedImage';
export { default as NetworkErrorBoundary } from './NetworkErrorBoundary';
export { default as PermissionGuard } from './PermissionGuard';
export { LazyLoad, withLazyLoad } from './LazyLoad';
export { default as NotificationDisplay } from './NotificationDisplay';
export { default as AppLoadingIndicator } from './LoadingIndicator';
export { default as AppNotificationDisplay } from './NotificationDisplay';
export { default as AppErrorBoundary } from './NetworkErrorBoundary';
export { default as AppPageLoader } from './PageLoadingIndicator';
export { default as AppErrorFallback } from './ErrorFallback';
export { default as AppConfirmDialog } from './ConfirmDialog';

