import React from 'react';
import { AlertTriangle, CheckCircle, X, Info, AlertOctagon } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AdminAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

/**
 * Alert component for the admin interface
 */
const AdminAlert: React.FC<AdminAlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  className = '',
  actions
}) => {
  // Alert type configs
  const alertConfig = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      icon: <CheckCircle className="h-5 w-5" />
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      icon: <AlertOctagon className="h-5 w-5" />
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      icon: <AlertTriangle className="h-5 w-5" />
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      icon: <Info className="h-5 w-5" />
    }
  };

  const { bgColor, borderColor, textColor, icon } = alertConfig[type];

  return (
    <div className={`rounded-md ${bgColor} border-l-4 ${borderColor} p-4 ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${textColor}`}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''} ${textColor}`}>
            <p>{message}</p>
          </div>
          
          {actions && (
            <div className="mt-3">
              {actions}
            </div>
          )}
        </div>
        
        {dismissible && onDismiss && (
          <div className="pl-3 ml-auto">
            <button
              type="button"
              className={`inline-flex rounded-md ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none p-1.5`}
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlert;
