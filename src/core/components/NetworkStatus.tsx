import React from 'react';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { Wifi, WifiOff, Zap, RefreshCw, Server } from 'lucide-react';

interface NetworkStatusProps {
  showDetails?: boolean;
  onRefresh?: () => void;
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  showDetails = false,
  onRefresh,
  className = ''
}) => {
  const { 
    isOnline, 
    isInternetReachable, 
    isSupabaseReachable,
    connectionQuality,
    lastChecked,
    checkConnection
  } = useNetworkStatus();
  
  // Calculate overall status
  const status = !isOnline 
    ? 'offline'
    : !isInternetReachable
      ? 'no-internet' 
      : !isSupabaseReachable
        ? 'no-api'
        : 'online';
  
  // Only render if details are explicitly requested or if there's a connectivity issue
  if (!showDetails && status === 'online') return null;
  
  // Status configuration
  const statusConfig = {
    online: {
      icon: <Wifi className="h-5 w-5" />,
      label: 'Đã kết nối',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    offline: {
      icon: <WifiOff className="h-5 w-5" />,
      label: 'Ngoại tuyến',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    'no-internet': {
      icon: <WifiOff className="h-5 w-5" />,
      label: 'Không có internet',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    'no-api': {
      icon: <Server className="h-5 w-5" />,
      label: 'Máy chủ không khả dụng',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    }
  };
  
  // Quality indicators
  const qualityIndicators = {
    good: {
      icon: <Zap className="h-4 w-4" />,
      label: 'Tốt',
      color: 'text-green-500'
    },
    medium: {
      icon: <Zap className="h-4 w-4" />,
      label: 'Trung bình',
      color: 'text-amber-500'
    },
    poor: {
      icon: <Zap className="h-4 w-4" />,
      label: 'Kém',
      color: 'text-red-500'
    }
  };
  
  const config = statusConfig[status];
  const qualityConfig = qualityIndicators[connectionQuality];
  
  const handleRefresh = () => {
    checkConnection();
    if (onRefresh) onRefresh();
  };
  
  return (
    <div className={`rounded-lg border p-3 ${config.borderColor} ${config.bgColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`${config.color} mr-2`}>{config.icon}</span>
          <span className={`font-medium ${config.color}`}>{config.label}</span>
        </div>
        
        <button 
          onClick={handleRefresh}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title="Kiểm tra lại kết nối"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      {showDetails && status === 'online' && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Chất lượng kết nối:</span>
            <span className={`flex items-center ${qualityConfig.color}`}>
              {qualityConfig.icon}
              <span className="ml-1">{qualityConfig.label}</span>
            </span>
          </div>
          
          {lastChecked && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cập nhật lần cuối: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
