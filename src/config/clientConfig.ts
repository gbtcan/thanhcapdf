/**
 * Client-side configuration
 */

export const CLIENT_CONFIG = {
  app: {
    name: 'ThánhCaPDF',
    version: '1.0.0',
    description: 'Kho tàng thánh ca Việt Nam',
    url: import.meta.env.VITE_APP_URL || 'https://thanhcapdf.com',
    logoUrl: '/assets/logo.svg',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '',
    timeout: 30000, // 30 seconds
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    storageBucket: 'resources',
  },
  features: {
    darkMode: true,
    offlineMode: true,
    comments: true,
    pdfViewer: true,
    audioPlayer: true,
    sharing: true,
    search: true,
    favorites: true,
    community: true,
  },
  pagination: {
    defaultSize: 10,
    homeHighlights: 6,
    searchResults: 20,
    comments: 5,
  },
  social: {
    facebook: 'https://facebook.com/thanhcapdf',
    youtube: 'https://youtube.com/thanhcapdf',
    email: 'contact@thanhcapdf.com',
  },
};

export const ENV_CONFIG = {
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
  isTest: import.meta.env.MODE === 'test',
};
