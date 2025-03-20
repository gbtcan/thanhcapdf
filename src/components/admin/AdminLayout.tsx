import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../contexts/AuthContext';
import AlertBanner from '../AlertBanner';
import LoadingIndicator from '../LoadingIndicator';

const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIndicator size="large" message="Loading admin panel..." />
      </div>
    );
  }

  // Unauthorized state
  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <AlertBanner
          type="error"
          title="Unauthorized"
          message="You must be logged in to access the admin panel."
        />
      </div>
    );
  }

  // Check if user has admin privileges
  const isAdmin = user?.roles?.name === 'administrator' || user?.roles?.name === 'editor';
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <AlertBanner
          type="error"
          title="Access Denied"
          message="You don't have permission to access the admin panel."
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar for mobile */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentPath={location.pathname}
      />

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <AdminSidebar 
            isOpen={true} 
            isDesktop={true}
            currentPath={location.pathname}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
