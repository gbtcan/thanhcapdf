import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Music, 
  Users, 
  Settings, 
  X,
  FileText, 
  Bookmark,
  MessageSquare, 
  Flag,
  Archive,
  BarChart2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isDesktop?: boolean;
  currentPath: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isOpen, 
  onClose, 
  isDesktop = false,
  currentPath 
}) => {
  const { user } = useAuth();

  // Navigation items
  const navigation = [
    { name: 'Dashboard', to: '/admin', icon: Home },
    { name: 'Hymns', to: '/admin/hymns', icon: Music },
    { name: 'Users', to: '/admin/users', icon: Users },
    { name: 'Categories', to: '/admin/categories', icon: Bookmark },
    { name: 'PDF Files', to: '/admin/files', icon: FileText },
    { name: 'Forum Posts', to: '/admin/forum', icon: MessageSquare },
    { name: 'Reports', to: '/admin/reports', icon: Flag },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
    { name: 'Content Library', to: '/admin/library', icon: Archive },
    { name: 'Settings', to: '/admin/settings', icon: Settings }
  ];

  // Check if a route is active
  const isActive = (route: string) => {
    if (route === '/admin' && currentPath === '/admin') {
      return true;
    }
    return route !== '/admin' && currentPath.startsWith(route);
  };

  // If mobile sidebar is closed and not desktop, don't render
  if (!isOpen && !isDesktop) {
    return null;
  }

  const sidebarContent = (
    <div className="h-0 flex-1 flex flex-col overflow-y-auto">
      {/* Logo and close button (mobile only) */}
      <div className="flex items-center justify-between px-4 h-16 flex-shrink-0 bg-indigo-700 dark:bg-gray-800">
        <Link to="/admin" className="flex items-center">
          <Music className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
        </Link>
        {!isDesktop && (
          <button
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="pt-5 pb-4 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4">
          <div className="flex-shrink-0">
            {user?.avatar_url ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar_url}
                alt="User avatar"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <span className="font-medium text-lg">
                  {(user?.display_name || user?.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-base font-medium text-gray-900 dark:text-white truncate">
              {user?.display_name || 'Admin User'}
            </p>
            <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
              {user?.roles?.name || 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex-1">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.name}
                to={item.to}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  active
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750'
                }`}
                onClick={!isDesktop ? onClose : undefined}
              >
                <item.icon 
                  className={`mr-4 h-6 w-6 ${
                    active 
                      ? 'text-indigo-500 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer with version info */}
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Catholic Hymns Admin v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar (with overlay)
  if (!isDesktop) {
    return (
      <div className="lg:hidden fixed inset-0 flex z-40">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        {/* Sidebar panel */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:flex lg:flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {sidebarContent}
    </div>
  );
};

export default AdminSidebar;
