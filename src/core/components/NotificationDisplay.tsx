import React from 'react';
import { useToast } from '../hooks/useToast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ToastViewport } from './ui/toast';

/**
 * NotificationDisplay component that uses the Toast system
 * This component serves as a compatibility layer for existing code
 */
const NotificationDisplay: React.FC = () => {
  const { toasts, dismiss } = useToast();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex w-full items-center justify-between space-x-4 rounded-md border p-4 shadow-lg',
            toast.variant === 'destructive' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 
              'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          )}
        >
          <div className="flex items-center gap-3">
            {toast.variant === 'destructive' && <XCircle className="h-5 w-5 text-red-500" />}
            {toast.variant === 'default' && <Info className="h-5 w-5 text-blue-500" />}
            {toast.variant === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            
            <div className="flex flex-col gap-1">
              {toast.title && (
                <p className="text-sm font-medium">{toast.title}</p>
              )}
              {toast.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{toast.description}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => dismiss(toast.id)}
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
      <ToastViewport />
    </>
  );
};

export default NotificationDisplay;
