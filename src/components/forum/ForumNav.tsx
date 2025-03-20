import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, MessageSquare, PlusCircle, User,
  Bookmark, FileText, Settings 
} from 'lucide-react';

const ForumNav: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      name: 'Forum Home',
      path: '/forum',
      icon: <Home className="h-5 w-5" />,
      public: true,
    },
    {
      name: 'New Discussion',
      path: '/forum/new',
      icon: <PlusCircle className="h-5 w-5" />,
      public: false,
    },
    {
      name: 'My Discussions',
      path: '/forum/my-posts',
      icon: <MessageSquare className="h-5 w-5" />,
      public: false,
    },
    {
      name: 'My Bookmarks',
      path: '/forum/bookmarks',
      icon: <Bookmark className="h-5 w-5" />,
      public: false,
    },
    {
      name: 'Forum Guidelines',
      path: '/forum/guidelines',
      icon: <FileText className="h-5 w-5" />,
      public: true,
    },
  ];
  
  // Admin-only items
  const adminItems = [
    {
      name: 'Manage Forum',
      path: '/admin/forum',
      icon: <Settings className="h-5 w-5" />,
      public: false,
    }
  ];
  
  return (
    <nav className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-medium text-gray-700 mb-4">Forum Navigation</h3>
      
      <ul className="space-y-2">
        {navItems.map(item => (
          (item.public || isAuthenticated) && (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          )
        ))}
        
        {isAuthenticated && userRole === 'administrator' && adminItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      
      {!isAuthenticated && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md text-sm text-gray-600">
          <p className="mb-2">Sign in to participate in discussions</p>
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="w-full inline-block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};

export default ForumNav;
