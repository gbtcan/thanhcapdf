import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './core/contexts/ThemeContext';
import { AuthProvider } from './core/contexts/AuthContext';
import NotificationDisplay from './core/components/NotificationDisplay';
import { router } from './routes';
import PageLoadingIndicator from './core/components/PageLoadingIndicator';
import { ToastProvider } from './core/components/ui/toast-provider';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Simple initialization without database checks
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Just a short timeout for visual feedback
    
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return <PageLoadingIndicator message="Đang khởi tạo ứng dụng..." />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <NotificationDisplay />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;