import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, User, Settings, LogOut, Star, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from "../Avatar";

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className = "" }) => {
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  const isAdmin = user.roles?.name === 'administrator';
  const isModerator = user.roles?.name === 'moderator';
  
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
          <Avatar 
            src={user.avatar_url} 
            name={user.display_name || user.email} 
            size="sm" 
            className="mr-2"
          />
          <span className="hidden sm:block">{user.display_name || user.email}</span>
          <ChevronDown className="w-4 h-4 ml-1" aria-hidden="true" />
        </Menu.Button>
      </div>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900 dark:text-white">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
          </div>
          
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } flex items-center px-4 py-2 text-sm`}
                >
                  <User className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Profile
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } flex items-center px-4 py-2 text-sm`}
                >
                  <Settings className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Settings
                </Link>
              )}
            </Menu.Item>
            
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/favorites"
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } flex items-center px-4 py-2 text-sm`}
                >
                  <Star className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Favorites
                </Link>
              )}
            </Menu.Item>
          </div>
          
          {/* Admin section */}
          {(isAdmin || isModerator) && (
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/admin"
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    } flex items-center px-4 py-2 text-sm`}
                  >
                    <Shield className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Admin Dashboard
                  </Link>
                )}
              </Menu.Item>
            </div>
          )}
          
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={logout}
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } flex items-center px-4 py-2 text-sm w-full text-left`}
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;
