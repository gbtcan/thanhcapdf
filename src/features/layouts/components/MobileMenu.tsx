import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Music, Users, FileText, Heart, BookOpen, Settings, MessageCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Logo } from '../../../components/common/Logo';
import { VersionBadge } from '../../../features/app';
import { OfflineIndicator } from '../../../features/offline';
import { useNetworkStatus } from '../../../contexts/NetworkStatusContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const { isOnline } = useNetworkStatus();
  
  // Check if the current path matches a navigation link
  const isCurrentPath = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Main navigation links
  const mainLinks = [
    { name: 'Trang chủ', href: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Thánh ca', href: '/hymns', icon: <Music className="h-5 w-5" /> },
    { name: 'Tác giả', href: '/authors', icon: <Users className="h-5 w-5" /> },
    { name: 'Chủ đề', href: '/themes', icon: <FileText className="h-5 w-5" /> },
    { name: 'Cộng đồng', href: '/community', icon: <MessageCircle className="h-5 w-5" /> }
  ];
  
  // Personal links (only for authenticated users)
  const personalLinks = isAuthenticated ? [
    { name: 'Yêu thích', href: '/favorites', icon: <Heart className="h-5 w-5" /> },
    { name: 'Sưu tập', href: '/collections', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Cài đặt', href: '/settings', icon: <Settings className="h-5 w-5" /> }
  ] : [];
  
  // Help links
  const helpLinks = [
    { name: 'Trợ giúp', href: '/help', icon: <HelpCircle className="h-5 w-5" /> },
    { name: 'Báo lỗi', href: '/report-issue', icon: <AlertTriangle className="h-5 w-5" /> }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          {/* Background overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Menu content */}
          <div 
            ref={menuRef}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <Link to="/" className="flex items-center" onClick={onClose}>
                <Logo className="h-8 w-auto" />
                <span className="ml-2 font-semibold text-gray-900 dark:text-white text-lg">
                  ThánhCaPDF
                </span>
              </Link>
              <button 
                type="button"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* User info (if authenticated) */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  {user.userProfile?.avatar_url ? (
                    <img 
                      src={user.userProfile.avatar_url} 
                      alt={user.userProfile?.full_name || user.email}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-300 font-medium">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.userProfile?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Offline indicator */}
            {!isOnline && (
              <div className="px-4 py-2">
                <OfflineIndicator />
              </div>
            )}
            
            {/* Main navigation */}
            <div className="flex-1 overflow-y-auto pt-2">
              <div className="px-2 space-y-1">
                {mainLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium ${
                      isCurrentPath(link.href)
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>
              
              {/* Personal section */}
              {personalLinks.length > 0 && (
                <div className="mt-6">
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cá nhân
                    </h3>
                  </div>
                  <div className="px-2 space-y-1">
                    {personalLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={onClose}
                        className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium ${
                          isCurrentPath(link.href)
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Help section */}
              <div className="mt-6">
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trợ giúp
                  </h3>
                </div>
                <div className="px-2 space-y-1">
                  {helpLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={onClose}
                      className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <VersionBadge variant="subtle" />
                
                {/* Auth button */}
                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Đăng nhập
                  </Link>
                ) : (
                  <Link
                    to="/logout"
                    onClick={onClose}
                    className="px-4 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                  >
                    Đăng xuất
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
