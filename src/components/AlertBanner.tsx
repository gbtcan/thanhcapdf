import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
  actions
}) => {
  // Alert styling based on type
  const alertStyles = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-400',
      borderColor: 'border-green-400 dark:border-green-500',
      Icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/30',
      textColor: 'text-red-800 dark:text-red-400',
      borderColor: 'border-red-400 dark:border-red-500',
      Icon: AlertCircle
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-400',
      borderColor: 'border-yellow-400 dark:border-yellow-500',
      Icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-400',
      borderColor: 'border-blue-400 dark:border-blue-500',
      Icon: Info
    }
  };

  const { bgColor, textColor, borderColor, Icon } = alertStyles[type];

  return (
    <div className={`rounded-md ${bgColor} border-l-4 ${borderColor} p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${textColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${textColor}`}>
            <p>{message}</p>
          </div>
          {actions && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                {actions}
              </div>
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${bgColor} focus:ring-${borderColor}`}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
