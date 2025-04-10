import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  PieChart,
  Users,
  FileText,
  Music,
  Shield,
  Settings,
  MessageSquare,
  Bell,
  BarChart2,
  Layers,
  User,
  Flag
} from 'lucide-react';
import SidebarNavigation from '../../layouts/components/SidebarNavigation';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../lib/permissions';
import { PermissionGuard } from '../../../core/components/PermissionGuard';

const AdminSidebar: React.FC = () => {
  const { user } = useAuth();
  
  // Determine if the user is an admin or editor
  const isAdmin = user?.userProfile?.role === 'admin';
  const isEditor = user?.userProfile?.role === 'editor';
  
  // Dashboard section - always visible
  const dashboardSection = {
    title: 'Tổng quan',
    items: [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: <PieChart className="h-5 w-5" />,
      }
    ]
  };
  
  // Add statistics item if user has stats permission
  if (hasPermission(user, 'system.stats')) {
    dashboardSection.items.push({
      name: 'Thống kê',
      href: '/admin/statistics',
      icon: <BarChart2 className="h-5 w-5" />,
    });
  }
  
  // Content section - visible for users with content permissions
  const contentSection = {
    title: 'Nội dung',
    items: []
  };
  
  // Only add content overview if they have read permission
  if (hasPermission(user, 'content.read')) {
    contentSection.items.push({
      name: 'Tổng quan nội dung',
      href: '/admin/content',
      icon: <FileText className="h-5 w-5" />
    });
  }
  
  // Add content items based on permissions
  if (hasPermission(user, 'content.read')) {
    contentSection.items.push(
      {
        name: 'Bài viết',
        href: '/admin/content/posts',
        icon: <MessageSquare className="h-5 w-5" />
      },
      {
        name: 'Thánh ca',
        href: '/admin/content/hymns',
        icon: <Music className="h-5 w-5" />
      },
      {
        name: 'Bình luận',
        href: '/admin/content/comments',
        icon: <MessageSquare className="h-5 w-5" />
      }
    );
  }
  
  // More content management items
  if (hasPermission(user, 'content.read')) {
    contentSection.items.push(
      {
        name: 'Tác giả',
        href: '/admin/authors',
        icon: <User className="h-5 w-5" />
      },
      {
        name: 'Chủ đề',
        href: '/admin/themes',
        icon: <Layers className="h-5 w-5" />
      }
    );
  }
  
  // User management section - only for admin or users with user permissions
  const userSection = hasPermission(user, 'users.read') ? {
    title: 'Người dùng',
    items: [
      {
        name: 'Quản lý người dùng',
        href: '/admin/users',
        icon: <Users className="h-5 w-5" />
      }
    ]
  } : null;
  
  // Add role management if they have proper permissions
  if (userSection && hasPermission(user, 'users.read')) {
    userSection.items.push({
      name: 'Vai trò',
      href: '/admin/roles',
      icon: <Shield className="h-5 w-5" />
    });
  }
  
  // System section - for reports and notifications
  const systemSection = {
    title: 'Hệ thống',
    items: []
  };
  
  // Reports for users with content permissions
  if (hasPermission(user, 'content.read')) {
    systemSection.items.push({
      name: 'Báo cáo',
      href: '/admin/reports',
      icon: <Flag className="h-5 w-5" />
    });
  }
  
  // Notifications for all admin users
  systemSection.items.push({
    name: 'Thông báo',
    href: '/admin/notifications',
    icon: <Bell className="h-5 w-5" />
  });
  
  // Settings only for users with system.settings permission
  if (hasPermission(user, 'system.settings')) {
    systemSection.items.push({
      name: 'Cài đặt',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />
    });
  }
  
  // Build final navigation sections
  const navigationSections = [dashboardSection, contentSection];
  
  // Add optional sections if they have items
  if (userSection && userSection.items.length > 0) {
    navigationSections.push(userSection);
  }
  
  if (systemSection.items.length > 0) {
    navigationSections.push(systemSection);
  }

  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {isAdmin ? 'Admin Panel' : isEditor ? 'Editor Panel' : 'Content Panel'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.userProfile?.role || 'User'}
            </p>
          </div>
        </div>
        
        <SidebarNavigation sections={navigationSections} />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink
          to="/"
          className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          ← Quay lại trang chính
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
