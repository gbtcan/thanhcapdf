/**
 * Central configuration for client-side features and behavior
 */

// Application information
export const APP_INFO = {
  name: 'Catholic Hymn Book',
  version: '1.0.0',
  description: 'Explore, share, and download Catholic hymns and music sheets'
};

// PDF.js version used throughout the application
export const PDF_JS_VERSION = '3.4.120';

// Settings for different environments
const environments = {
  development: {
    apiUrl: 'http://localhost:3000',
    cdnUrl: '',
    clientSideOnly: true
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    cdnUrl: 'https://staging-cdn.example.com',
    clientSideOnly: false
  },
  production: {
    apiUrl: 'https://api.example.com',
    cdnUrl: 'https://cdn.example.com',
    clientSideOnly: false
  }
};

// Determine current environment
const currentEnv = import.meta.env.MODE || 'development';

// Feature flags - control which features are enabled
export const FEATURES = {
  viewCounting: import.meta.env.VITE_ENABLE_VIEW_TRACKING === 'true',
  pdfViewsTracking: import.meta.env.VITE_ENABLE_VIEW_TRACKING === 'true',
  categoriesEnabled: true,
  forumFeatures: import.meta.env.VITE_ENABLE_FORUM === 'true',
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

// Default values for missing data
export const DEFAULTS = {
  viewCount: 3,
  pdfViewCount: 5,
  reactionCount: 2,
  placeholderImage: '/images/placeholder.jpg'
};

// Export the complete client configuration
export const clientConfig = {
  ...APP_INFO,
  ...environments[currentEnv as keyof typeof environments],
  features: FEATURES,
  defaults: DEFAULTS
};

export default clientConfig;
