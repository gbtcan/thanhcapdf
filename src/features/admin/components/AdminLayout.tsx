import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Menu 
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin',
      exact: true
    },
    {
      title: 'Bài hát',
      icon: <Music size={20} />,
      path: '/admin/hymns',
      exact: false
    },
    {
      title: 'Quản lý người dùng',
      icon: <Users size={20} />,
      path: '/admin/users/roles',
      exact: false
    },
    {
      title: 'Cài đặt hệ thống',
      icon: <Settings size={20} />,
      path: '/admin/settings',
      exact: false
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  // Check if a path is active
  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <aside 
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } hidden md:block transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} h-16 px-4 border-b border-gray-200 dark:border-gray-700`}>
          {!collapsed && (
            <Link to="/admin" className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Admin</span>
              <span className="ml-1 text-xl font-bold text-indigo-600">Panel</span>
            </Link>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="p-4">
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center ${
                  collapsed ? 'justify-center' : 'justify-start'
                } p-3 rounded-md transition-colors ${
                  isActive(item.path, item.exact) 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={collapsed ? '' : 'mr-3'}>{item.icon}</span>
                {!collapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Logout button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              collapsed ? 'justify-center w-full' : 'justify-start'
            } p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <LogOut size={20} className={collapsed ? '' : 'mr-3'} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu button and overlay */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-20 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        >
          <Menu size={24} />
        </button>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 h-full w-64 z-40 bg-white dark:bg-gray-800 shadow-lg">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                <Link to="/admin" className="flex items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Admin</span>
                  <span className="ml-1 text-xl font-bold text-indigo-600">Panel</span>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <div className="p-4">
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-start p-3 rounded-md transition-colors ${
                        isActive(item.path, item.exact) 
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* Logout button */}
              <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-start w-full p-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Main content */}
      <main className={`flex-1 p-6 overflow-auto`}>
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Xin chào, {user?.display_name || 'Admin'}
            </p>
          </div>
        </header>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
