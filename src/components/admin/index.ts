/**
 * Export all admin components from a central file
 */

// Layout components
export { default as AdminLayout } from './AdminLayout';
export { default as AdminSidebar } from './AdminSidebar';
export { default as AdminNav } from './AdminNav';
export { default as AdminHeader } from './AdminHeader';

// Dashboard components
export { default as DashboardStats } from './DashboardStats';
export { default as ActivityLog } from './ActivityLog';
export { default as RecentUsers } from './RecentUsers';
export { default as PopularHymns } from './PopularHymns';

// Hymn management
export { default as HymnTable } from './HymnTable';
export { default as HymnEditor } from './HymnEditor';
export { default as HymnImport } from './HymnImport';
export { default as CategoryManager } from './CategoryManager';

// User management
export { default as UserTable } from './UserTable';
export { default as UserEditor } from './UserEditor';
export { default as RoleManager } from './RoleManager';
export { default as PermissionSelector } from './PermissionSelector';

// Content moderation
export { default as ForumModeration } from './ForumModeration';
export { default as ContributionApproval } from './ContributionApproval';
export { default as ReportedContent } from './ReportedContent';

// Settings
export { default as SystemSettings } from './SystemSettings';
export { default as AppearanceSettings } from './AppearanceSettings';
export { default as NotificationSettings } from './NotificationSettings';
export { default as SecuritySettings } from './SecuritySettings';

// UI components
export { default as AdminCard } from './AdminCard';
export { default as AdminAlert } from './AdminAlert';
export { default as AdminButton } from './AdminButton';
export { default as AdminTable } from './AdminTable';
export { default as AdminTabs } from './AdminTabs';

// Common utilities
export { useAdminAuth } from './useAdminAuth';
export { useAdminData } from './useAdminData';
export { formatAdminData } from './formatAdminData';
