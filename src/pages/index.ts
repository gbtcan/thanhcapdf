// Re-export pages for easier routing

// Public pages
export { default as Home } from './Home';
export { default as About } from './About';
export { default as Favorites } from './Favorites';

// Auth pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';
export { default as ForgotPassword } from './auth/ForgotPassword';
export { default as ResetPassword } from './auth/ResetPassword';
export { default as Unauthorized } from './Unauthorized';

// Hymn pages
export { default as Hymns } from './hymns/HymnList';
export { default as HymnDetail } from './hymns/HymnDetail';
export { default as Search } from './hymns/Search';

// Author pages
export { default as Authors } from './authors/AuthorList';
export { default as AuthorDetail } from './authors/AuthorDetail';

// Category pages
export { default as Categories } from './categories/CategoryList';
export { default as CategoryDetail } from './categories/CategoryDetail';

// User pages
export { default as UserProfile } from './user/UserProfile';

// Admin pages
export * from './admin';
