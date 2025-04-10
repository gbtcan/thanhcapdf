/**
 * Application wide configuration
 */

// Define global ENV_CONFIG for use throughout the application
window.ENV_CONFIG = {
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildDate: new Date().toISOString(),
};

export const APP_CONFIG = {
  // Application details
  name: 'ThánhCaPDF',
  version: window.ENV_CONFIG.appVersion,
  description: 'Ứng dụng chia sẻ và quản lý tài liệu thánh ca',
  
  // API and Services
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '',
    timeout: 30000, // 30 seconds
  },
  
  // Features configuration
  features: {
    darkMode: true,
    commentSection: true,
    socialSharing: true,
  },
  
  // Content configuration
  content: {
    itemsPerPage: 12,
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'mp3'],
  },
  
  // Auth configuration
  auth: {
    sessionDuration: 60 * 60 * 24 * 7, // 1 week in seconds
    passwordMinLength: 8,
  },
  
  // Contact information
  contact: {
    email: 'contact@thanhcapdf.com',
    facebook: 'https://facebook.com/thanhcapdf',
  }
};

// Environment-specific configurations
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  environment: import.meta.env.MODE,
  analyticsEnabled: import.meta.env.PROD,
};

export default APP_CONFIG;
