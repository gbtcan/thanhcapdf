import { createBrowserRouter } from 'react-router-dom';
import adminRoutes from './admin-routes';
import publicRoutes from './public-routes';

// Create and export the router with all routes
export const router = createBrowserRouter([
  ...publicRoutes,
  ...adminRoutes
]);

// For backward compatibility with any code that might import this as default
export default router;
