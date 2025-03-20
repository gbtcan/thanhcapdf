import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X, Music, Search, BookOpen, MessageSquare, Info, User, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  // Navigation items
  const mainNavItems = [
    { name: 'Home', to: '/', icon: <Home className="h-5 w-5 mr-2" /> },
    { name: 'Hymns', to: '/hymns', icon: <Music className="h-5 w-5 mr-2" /> },
    { name: 'Browse by Category', to: '/categories', icon: <BookOpen className="h-5 w-5 mr-2" /> },
    { name: 'Search', to: '/search', icon: <Search className="h-5 w-5 mr-2" /> },
    { name: 'Community', to: '/forum', icon: <MessageSquare className="h-5 w-5 mr-2" /> },
    { name: 'About', to: '/about', icon: <Info className="h-5 w-5 mr-2" /> },
  ];

  const userNavItems = isAuthenticated
    ? [
        { name: 'My Profile', to: '/profile', icon: <User className="h-5 w-5 mr-2" /> },
        { name: 'My Favorites', to: '/favorites', icon: <Star className="h-5 w-5 mr-2" /> },
        { name: 'Settings', to: '/settings', icon: <Settings className="h-5 w-5 mr-2" /> },
      ]
    : [
        { name: 'Sign In', to: '/login', icon: <LogIn className="h-5 w-5 mr-2" /> },
        { name: 'Register', to: '/register', icon: <UserPlus className="h-5 w-5 mr-2" /> },
      ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* Slide-in panel */}
        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col bg-white dark:bg-gray-800 pb-12 overflow-y-auto shadow-xl">
              {/* Close button */}
              <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Menu</h2>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  onClick={onClose}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Menu content */}
              <div className="px-4 py-6 space-y-6">
                {/* Main navigation */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Navigation
                  </h3>
                  <div className="mt-3 space-y-1">
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="flex items-center py-2 px-3 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={onClose}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* User section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isAuthenticated ? 'Your Account' : 'Account'}
                  </h3>
                  
                  {isAuthenticated && (
                    <div className="flex items-center px-3 py-3 mb-3">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="User avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          {user?.display_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.display_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 space-y-1">
                    {userNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="flex items-center py-2 px-3 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={onClose}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                    
                    {isAuthenticated && (
                      <button
                        className="flex w-full items-center py-2 px-3 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>

                {/* Theme toggle */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Appearance
                  </h3>
                  <div className="px-3">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileMenu;
