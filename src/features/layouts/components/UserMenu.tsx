import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Heart, BookOpen, Settings, Bell, HelpCircle, Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface UserMenuProps {
  isOpen: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen }) => {
  const { user, logout } = useAuth();
  
  const isAdmin = user?.userProfile?.role === 'admin' || user?.userProfile?.role === 'editor';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        >
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.userProfile?.full_name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>

          {/* User section */}
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <User className="mr-3 h-4 w-4" />
              Hồ sơ
            </Link>
            <Link
              to="/favorites"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Heart className="mr-3 h-4 w-4" />
              Yêu thích
            </Link>
            <Link
              to="/collections"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <BookOpen className="mr-3 h-4 w-4" />
              Sưu tập
            </Link>
            <Link
              to="/notifications"
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <Bell className="mr-3 h-4 w-4" />
                Thông báo
              </div>
              {/* Notification badge */}
              <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                3
              </span>
            </Link>
          </div>
          
          {/* Admin section */}
          {isAdmin && (
            <div className="border-t border-gray-200 dark:border-gray-700 py-1">
              <Link
                to="/admin/dashboard"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Shield className="mr-3 h-4 w-4" />
                Quản trị hệ thống
              </Link>
            </div>
          )}
          
          {/* Settings and Help */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="mr-3 h-4 w-4" />
              Cài đặt
            </Link>
            <Link
              to="/help"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HelpCircle className="mr-3 h-4 w-4" />
              Trợ giúp
            </Link>
          </div>
          
          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-1">
            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserMenu;
