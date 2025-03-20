import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, Home, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect should be handled by auth context
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                onClick={onMenuClick}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            {/* Navigation breadcrumb */}
            <div className="flex items-center pl-1 ml-4">
              <Link to="/" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                <Home className="h-5 w-5" />
                <span className="sr-only">Return to website</span>
              </Link>
              <span className="mx-2 text-gray-400 dark:text-gray-600">/</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                Admin Panel
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Search */}
            <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 items-center mr-4">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Quick search..."
                className="bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0"
              />
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Notifications */}
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            {/* User dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
                  id="user-menu-button"
                  onClick={toggleUserMenu}
                >
                  <span className="sr-only">Open user menu</span>
                  {user?.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                      {(user?.display_name || user?.email || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </div>
              
              {userMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.display_name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Admin Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-750"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
