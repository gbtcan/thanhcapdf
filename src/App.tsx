import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout components
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/auth/AuthLayout'; // Added missing import

// Main pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Hymns from './pages/Hymns';
import HymnDetail from './pages/HymnDetail';
import Search from './pages/Search';
import Profile from './pages/Profile';
import UserSettings from './pages/UserSettings';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Forum pages
import Forum from './pages/forum/Forum';
import ForumPost from './pages/forum/ForumPost';
import CreatePost from './pages/forum/CreatePost';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminHymns from './pages/admin/Hymns';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

// Utilities and services
import { fixViteConnection } from './utils/fixViteConnection';
import { logEnvironmentInfo } from './utils/envCheck';
import { initPdf } from './utils/pdf';

// Initialize QueryClient with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute
    },
  },
});

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize application
  useEffect(() => {
    const init = async () => {
      // Fix Vite HMR issues in development
      if (import.meta.env.DEV) {
        fixViteConnection();
        logEnvironmentInfo();
      }
      
      // Initialize PDF.js worker
      await initPdf();
      
      // Mark initialization as complete
      setIsInitialized(true);
    };
    
    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-indigo-600">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="sr-only">Initializing application...</span>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ThemeProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="hymns">
                    <Route index element={<Hymns />} />
                    <Route path=":id" element={<HymnDetail />} />
                    <Route path="search" element={<Search />} />
                  </Route>
                  {/* Forum routes */}
                  <Route path="forum">
                    <Route index element={<Forum />} />
                    <Route path="post/:id" element={<ForumPost />} />
                    <Route 
                      path="new" 
                      element={
                        <ProtectedRoute>
                          <CreatePost />
                        </ProtectedRoute>
                      } 
                    />
                  </Route>
                  {/* Protected routes */}
                  <Route 
                    path="profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="settings" 
                    element={
                      <ProtectedRoute>
                        <UserSettings />
                      </ProtectedRoute>
                    } 
                  />
                  {/* Public utility pages */}
                  <Route path="contact" element={<Contact />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="privacy" element={<Privacy />} />
                </Route>
                {/* Admin routes */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                } />
                {/* Auth routes */}
                <Route path="/auth/*" element={<AuthLayout />} />
                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;