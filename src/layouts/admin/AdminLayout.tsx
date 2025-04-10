import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Search, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '../../core/components/ui/button';
import { useAuth } from '../../core/contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">ThánhCaPDF Admin</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Search className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="text-gray-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <div className="relative">
              <div className="flex items-center gap-2 p-1 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium hidden md:inline">{user?.name || 'Admin'}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 -ml-64'} md:w-64 md:ml-0 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-61px)] shadow-sm`}>
          <nav className="p-4 space-y-1">
            <div className="pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản lý nội dung</p>
            </div>
            
            <a href="/admin" className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="ml-3 text-sm font-medium">Tổng quan</span>
            </a>
            
            <a href="/admin/content/hymns" className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-700">
              <span className="ml-3 text-sm font-medium">Thánh ca</span>
            </a>
            
            <a href="/admin/content/posts" className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="ml-3 text-sm font-medium">Bài viết</span>
            </a>
            
            <a href="/admin/content/comments" className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="ml-3 text-sm font-medium">Bình luận</span>
            </a>
            
            <div className="pt-4 pb-2 mt-4 mb-4 border-t border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản lý người dùng</p>
            </div>
            
            <a href="/admin/roles" className="flex items-center px-3 py-2 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="ml-3 text-sm font-medium">Vai trò & Quyền</span>
            </a>
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
