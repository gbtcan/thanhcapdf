import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut, Star, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../Avatar";

interface SimpleUserMenuProps {
  className?: string;
}

/**
 * A simple fallback user menu that doesn't require headlessui
 * Use this if there are issues with the headlessui package
 */
const SimpleUserMenu: React.FC<SimpleUserMenuProps> = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  if (!user) return null;
  
  const isAdmin = user.roles?.name === 'administrator';
  const isModerator = user.roles?.name === 'moderator';
  
  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  
  return (
    <div ref={menuRef} className={`relative inline-block text-left ${className}`}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          <Avatar 
            src={user.avatar_url} 
            name={user.display_name || user.email} 
            size="sm" 
            className="mr-2"
          />
          <span className="hidden sm:block">{user.display_name || user.email}</span>
          <ChevronDown className="w-4 h-4 ml-1" aria-hidden="true" />
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900 dark:text-white">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
          </div>
          
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Profile
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Settings
            </Link>
            
            <Link
              to="/favorites"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <Star className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Favorites
            </Link>
          </div>
          
          {/* Admin section */}
          {(isAdmin || isModerator) && (
            <div className="py-1">
              <Link
                to="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                Admin Dashboard
              </Link>
            </div>
          )}
          
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleUserMenu;
