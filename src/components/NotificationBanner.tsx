import React from 'react';
import { X } from 'lucide-react';

interface NotificationBannerProps {
  message: string;
  onDismiss: () => void;
  type?: 'info' | 'warning' | 'announcement';
}

/**
 * Site-wide notification banner (eg. announcements, special notices)
 */
const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  onDismiss,
  type = 'announcement'
}) => {
  // Define styles based on notification type
  const getBgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'announcement':
      default:
        return 'bg-indigo-600';
    }
  };

  return (
    <div className={`${getBgColor()} text-white px-4 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm font-medium">
          {message}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:bg-white/20"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
