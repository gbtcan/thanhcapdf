import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { QuickAction } from '../types';
import { Search, Heart, Library, Shuffle, FileText, User, Settings } from 'lucide-react';

interface DashboardHeaderProps {
  quickActions: QuickAction[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ quickActions }) => {
  const { user, isAuthenticated } = useAuth();
  
  // Get appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };
  
  // Icon mapping for quick actions
  const iconMap: Record<string, React.ReactNode> = {
    search: <Search className="h-5 w-5" />,
    heart: <Heart className="h-5 w-5" />,
    library: <Library className="h-5 w-5" />,
    shuffle: <Shuffle className="h-5 w-5" />,
    file: <FileText className="h-5 w-5" />,
    user: <User className="h-5 w-5" />,
    settings: <Settings className="h-5 w-5" />
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}{isAuthenticated && user?.userProfile?.full_name ? `, ${user.userProfile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Khám phá và quản lý thánh ca yêu thích của bạn
          </p>
        </div>
        
        {!isAuthenticated && (
          <div className="mt-4 md:mt-0">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <User className="h-4 w-4 mr-2" />
              Đăng nhập
            </a>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => action.action()}
            className="col-span-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 shadow-sm rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-full">
              {iconMap[action.icon] || <div className="h-5 w-5" />}
            </div>
            <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;
