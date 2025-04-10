// Import bootstrap first to ensure flags are set before any React Router imports
import './bootstrap';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './core/contexts/ThemeContext';
import { AuthProvider } from './core/contexts/AuthContext';
import { NotificationProvider } from './core/contexts/NotificationContext';
import './index.css';
import { setupConsoleErrorFilter } from './core/utils/error-logger';
import { ENV_CONFIG } from './config/appConfig';

// Khởi tạo bộ lọc lỗi console trước khi ứng dụng khởi động
setupConsoleErrorFilter();

// Error tracking setup
if (ENV_CONFIG.isProduction) {
  console.info('Production mode - error tracking enabled');
  
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error });
    // Send to error tracking service
  };
}

/**
 * Application entry point
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);