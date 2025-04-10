/**
 * Application routes configuration
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  
  // Hymn routes
  HYMNS: '/hymns',
  HYMN_DETAIL: (id: string) => `/hymns/${id}`,
  
  // Catalog routes
  AUTHORS: '/authors',
  AUTHOR_DETAIL: (id: string) => `/authors/${id}`,
  THEMES: '/themes',
  THEME_DETAIL: (id: string) => `/themes/${id}`,
  
  // Community routes
  COMMUNITY: '/community',
  COMMUNITY_POST: (id: string) => `/community/posts/${id}`,
  COMMUNITY_CATEGORY: (id: string) => `/community/categories/${id}`,
  COMMUNITY_NEW_POST: '/community/new',
  
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User routes
  USER: {
    PROFILE: '/account/profile',
    FAVORITES: '/account/favorites',
    SETTINGS: '/account/settings',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    HYMNS: '/admin/hymns',
    HYMN_NEW: '/admin/hymns/new',
    HYMN_EDIT: (id: string) => `/admin/hymns/edit/${id}`,
    HYMN_DETAIL: (id: string) => `/admin/hymns/${id}`,
    USER_ROLES: '/admin/users/roles',
    SETTINGS: '/admin/settings',
  },
  
  // Error routes
  ACCESS_DENIED: '/access-denied',
  NOT_FOUND: '*',
  
  // Search
  SEARCH: '/search',
};

// Admin routes
export const adminRoutes = {
  dashboard: '/admin',
  hymns: '/admin/hymns',
  hymnDetail: '/admin/hymns/:id',
  hymnForm: '/admin/hymns/new',
  users: '/admin/users',
  roles: '/admin/roles',
  roleDetail: '/admin/roles/:id',
  createRole: '/admin/roles/new',
};
