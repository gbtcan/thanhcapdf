import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Music, Users, Tag, FileText, 
  BookOpen, Settings, LogOut, Menu, X, ChevronDown, ChevronRight
} from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: { name: string; path: string }[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };
  
  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Navigation items
  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Hymns',
      path: '/admin/songs',
      icon: <Music className="h-5 w-5" />,
      children: [
        { name: 'All Hymns', path: '/admin/songs' },
        { name: 'Add New Hymn', path: '/admin/songs/new' }
      ]
    },
    {
      name: 'Authors',
      path: '/admin/authors',
      icon: <BookOpen className="h-5 w-5" />,
      children: [
        { name: 'All Authors', path: '/admin/authors' },
        { name: 'Add New Author', path: '/admin/authors/new' }
      ]
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: <Tag className="h-5 w-5" />,
      children: [
        { name: 'All Categories', path: '/admin/categories' },
        { name: 'Add New Category', path: '/admin/categories/new' }
      ]
    },
    {
      name: 'PDF Files',
      path: '/admin/pdfs',
      icon: <FileText className="h-5 w-5" />
    }
  ];
  
  // Only show Users section for administrators
  if (userRole === 'administrator') {
    navigation.push({
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />
    });
  }
  
  navigation.push({
    name: 'Settings',
    path: '/admin/settings',
    icon: <Settings className="h-5 w-5" />
  });
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <ErrorBoundary>
        {/* Mobile sidebar */}
        <div className="lg:hidden">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
              
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <Link to="/admin" className="font-bold text-xl text-indigo-600">Catholic Hymns Admin</Link>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
                    {renderNavItems(navigation)}
                  </nav>
                </div>
                
                <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                  <button
                    onClick={handleLogout}
                    className="flex-shrink-0 group block w-full flex items-center text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-14" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          )}
        </div>
        
        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:dark:bg-gray-800 lg:dark:border-gray-700">
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Link to="/admin" className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                Catholic Hymns Admin
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {renderNavItems(navigation)}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow dark:shadow-gray-700">
            <button
              type="button"
              className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center">
                <Link 
                  to="/"
                  className="ml-3 inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  View Site
                </Link>
              </div>
            </div>
          </div>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );

  // Helper function to render nav items
  function renderNavItems(items: NavItem[]): JSX.Element[] {
    return items.map(item => (
      <div key={item.name} className="py-1">
        {item.children ? (
          <div>
            <button
              onClick={() => toggleExpand(item.name)}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span className="ml-3 flex-1">{item.name}</span>
              {expandedItems[item.name] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {expandedItems[item.name] && item.children && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.name}
                    to={child.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(child.path)
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    }`}
                  >
                    <span className="ml-3">{child.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={item.path}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            }`}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </Link>
        )}
      </div>
    ));
  }
};

export default AdminLayout;
