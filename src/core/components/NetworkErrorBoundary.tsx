import React, { Component, ErrorInfo } from 'react';
import { WifiOff, RefreshCw, Server, AlertTriangle } from 'lucide-react';
import { toast } from '../hooks/useToast';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'api' | 'unknown';
}

/**
 * Error boundary specialized for network-related errors
 */
class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Identify type of error
    const errorType = determineErrorType(error);
    
    return {
      hasError: true,
      error,
      errorType
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Network error caught by boundary:', error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown'
    });
    
    // Call onReset if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Render fallback or default error UI based on error type
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorType={this.state.errorType}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children; 
  }
}

// Helper function to determine error type
function determineErrorType(error: Error): 'network' | 'api' | 'unknown' {
  const errorMessage = error.message.toLowerCase();
  
  if (
    error.name === 'TypeError' && 
    (errorMessage.includes('network') || 
     errorMessage.includes('failed to fetch') ||
     errorMessage.includes('abort'))
  ) {
    return 'network';
  }
  
  if (
    errorMessage.includes('api') || 
    errorMessage.includes('supabase') ||
    errorMessage.includes('401') ||
    errorMessage.includes('403') ||
    errorMessage.includes('500')
  ) {
    return 'api';
  }
  
  return 'unknown';
}

// Default error UI
interface DefaultErrorFallbackProps {
  error: Error | null;
  errorType: 'network' | 'api' | 'unknown';
  resetErrorBoundary: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
  error,
  errorType,
  resetErrorBoundary
}) => {
  const errorConfig = {
    network: {
      icon: <WifiOff className="h-12 w-12 text-amber-500 mb-3" />,
      title: 'Lỗi kết nối mạng',
      message: 'Không thể kết nối đến mạng. Vui lòng kiểm tra kết nối internet của bạn và thử lại.',
    },
    api: {
      icon: <Server className="h-12 w-12 text-red-500 mb-3" />,
      title: 'Lỗi kết nối đến máy chủ',
      message: 'Máy chủ hiện không phản hồi hoặc gặp sự cố. Vui lòng thử lại sau.',
    },
    unknown: {
      icon: <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />,
      title: 'Đã xảy ra lỗi',
      message: 'Đã xảy ra lỗi không xác định. Vui lòng tải lại trang.',
    }
  };
  
  const config = errorConfig[errorType];
  
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
      <div className="flex flex-col items-center">
        {config.icon}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {config.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </button>
        
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-6 text-left p-4 bg-gray-200 dark:bg-gray-700 rounded-md overflow-auto max-w-full">
            <p className="text-sm font-mono text-gray-800 dark:text-gray-300">
              {error.toString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkErrorBoundary;
