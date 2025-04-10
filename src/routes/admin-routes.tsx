import React, { lazy } from 'react';
import { LazyLoad } from '../core/components/LazyLoad';
import AdminRoute from '../core/guards/AdminRoute';

// Layout
const AdminLayout = lazy(() => import('../layouts/admin/AdminLayout'));

// Admin Dashboard
const Dashboard = lazy(() => import('../features/admin/pages/Dashboard'));

// Content management
const ContentPage = lazy(() => import('../features/admin/pages/content/ContentPage'));
const PostsPage = lazy(() => import('../features/admin/pages/content/PostsPage'));
const PostDetailPage = lazy(() => import('../features/admin/pages/content/PostDetailPage'));
const CreatePostPage = lazy(() => import('../features/admin/pages/content/CreatePostPage'));
const HymnsPage = lazy(() => import('../features/admin/pages/content/HymnsPage'));
const HymnDetailPage = lazy(() => import('../features/admin/pages/content/HymnDetailPage'));
const CreateHymnPage = lazy(() => import('../features/admin/pages/content/CreateHymnPage'));
const CommentsPage = lazy(() => import('../features/admin/pages/content/CommentsPage'));

// User management
const RolesPage = lazy(() => import('../features/admin/pages/RolesPage'));
const RoleDetailPage = lazy(() => import('../features/admin/pages/RoleDetailPage'));
const CreateRolePage = lazy(() => import('../features/admin/pages/CreateRolePage'));

// Error pages
const NotFound = lazy(() => import('../core/components/NotFound'));
const AccessDeniedPage = lazy(() => import('../core/components/AccessDeniedPage'));

const adminRoutes = [
  {
    path: '/admin',
    element: (
      <LazyLoad component={AdminRoute}>
        <LazyLoad component={AdminLayout} />
      </LazyLoad>
    ),
    errorElement: <LazyLoad component={NotFound} />,
    children: [
      {
        index: true,
        element: <LazyLoad component={Dashboard} />
      },
      
      // Content Management Routes
      {
        path: 'content',
        element: <LazyLoad component={ContentPage} />
      },
      {
        path: 'content/posts',
        element: <LazyLoad component={PostsPage} />
      },
      {
        path: 'content/posts/new',
        element: <LazyLoad component={CreatePostPage} />
      },
      {
        path: 'content/posts/:id',
        element: <LazyLoad component={PostDetailPage} />
      },
      {
        path: 'content/hymns',
        element: <LazyLoad component={HymnsPage} />
      },
      {
        path: 'content/hymns/new',
        element: <LazyLoad component={CreateHymnPage} />
      },
      {
        path: 'content/hymns/:id',
        element: <LazyLoad component={HymnDetailPage} />
      },
      {
        path: 'content/comments',
        element: <LazyLoad component={CommentsPage} />
      },
      
      // User Management Routes
      {
        path: 'roles',
        element: <LazyLoad component={RolesPage} />
      },
      {
        path: 'roles/new',
        element: <LazyLoad component={CreateRolePage} />
      },
      {
        path: 'roles/:id',
        element: <LazyLoad component={RoleDetailPage} />
      },
      
      // Catch all not found route
      {
        path: '*',
        element: <LazyLoad component={NotFound} />
      }
    ]
  }
];

export default adminRoutes;
