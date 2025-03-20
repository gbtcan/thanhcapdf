import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Music, MessageSquare, BookOpen, Info, LogIn, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MobileMenu from './navigation/MobileMenu';
import UserMenu from './navigation/UserMenu';
import ThemeToggle from './ThemeToggle';
import LogoIcon from './LogoIcon';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Hymns', href: '/hymns', icon: Music },
    { name: 'Categories', href: '/categories', icon: BookOpen },
    { name: 'Community', href: '/forum', icon: MessageSquare },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center ml-2 lg:ml-0">
              <LogoIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 font-bold text-xl text-gray-900 dark:text-white">
                Catholic Hymns
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side: search, theme toggle, auth */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <Link
              to="/search"
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Theme toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User menu if logged in, otherwise login/signup links */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="hidden sm:flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
