import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log to analytics service here
    if (import.meta.env.PROD) {
      // In production, you might want to log to an error tracking service
      // Example: Sentry.captureException(error);
    }
  }
  
  public resetError = (): void => {
    this.setState({ hasError: false, error: null });
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback component is provided, use it
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }
      
      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-16">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              An unexpected error occurred. We've been notified and will fix the issue as soon as possible.
            </p>
            
            {/* Error details in development only */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 text-left rounded overflow-auto text-sm">
                <p className="font-mono text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </p>
                <p className="mt-2 font-mono text-gray-800 dark:text-gray-200">
                  {this.state.error.stack?.split('\n').slice(1, 4).join('\n')}
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => {
                  this.resetError();
                  window.location.href = '/';
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Return to home page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
