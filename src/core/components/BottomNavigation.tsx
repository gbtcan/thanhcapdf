import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Home, Music, Search, BookOpen, Menu } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  const navItems = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/hymns', label: 'Thánh ca', icon: Music },
    { path: '/search', label: 'Tìm kiếm', icon: Search },
    { path: '/authors', label: 'Tác giả', icon: BookOpen },
    { path: '/menu', label: 'Thêm', icon: Menu },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg pb-safe">
      <nav className="flex justify-between max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center py-2 px-4 text-xs",
              isActive(item.path)
                ? "text-indigo-600 dark:text-indigo-400 font-medium"
                : "text-gray-500 dark:text-gray-400"
            )}
          >
            <item.icon className={cn(
              "h-6 w-6 mb-1",
              isActive(item.path)
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400"
            )} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default BottomNavigation;
