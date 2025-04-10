import React, { lazy } from 'react';
import { LazyLoad } from '../core/components/LazyLoad';

// Layout
const PublicLayout = lazy(() => import('../layouts/public/PublicLayout'));

// Trang tĩnh
const Home = lazy(() => import('../features/hymns/pages/Home'));
const NotFound = lazy(() => import('../core/components/NotFound'));
const AccessDeniedPage = lazy(() => import('../core/components/AccessDeniedPage'));
const LoadingPage = lazy(() => import('../core/components/LoadingPage'));

// Trang xác thực
const Login = lazy(() => import('../features/users/auth/pages/Login'));
const Register = lazy(() => import('../features/users/auth/pages/Register'));
const ForgotPassword = lazy(() => import('../features/users/auth/pages/ForgotPassword'));

// Trang thánh ca
const HymnsPage = lazy(() => import('../features/hymns/pages/Hymns'));
const HymnDetail = lazy(() => import('../features/hymns/pages/HymnDetail'));

// Trang tác giả
const AuthorsPage = lazy(() => import('../features/catalog/pages/authors/Authors'));
const AuthorDetailPage = lazy(() => import('../features/catalog/pages/authors/AuthorDetail'));

// Trang chủ đề
const ThemesPage = lazy(() => import('../features/catalog/pages/themes/Themes'));
const ThemeDetailPage = lazy(() => import('../features/catalog/pages/themes/ThemeDetail'));

// Tìm kiếm
const Search = lazy(() => import('../features/hymns/pages/Search'));

// Trang người dùng (yêu cầu xác thực)
const Profile = lazy(() => import('../features/users/profile/pages/Profile'));
const Favorites = lazy(() => import('../features/users/profile/pages/Favorites'));
const Settings = lazy(() => import('../features/users/settings/pages/Settings'));

// Bảo vệ Route
const ProtectedRoute = lazy(() => import('../core/guards/ProtectedRoute'));

// Trang tính năng mới
const AboutPage = lazy(() => import('../features/pages/AboutPage'));
const ContactPage = lazy(() => import('../features/pages/ContactPage'));
const NewFeaturesPage = lazy(() => import('../features/pages/NewFeaturesPage'));

// Public routes configuration
const publicRoutes = [
  {
    path: "/",
    element: <LazyLoad component={PublicLayout} />,
    errorElement: <LazyLoad component={NotFound} />,
    children: [
      {
        index: true,
        element: <LazyLoad component={Home} />
      },
      {
        path: "hymns",
        element: <LazyLoad component={HymnsPage} />
      },
      {
        path: "hymns/:id",
        element: <LazyLoad component={HymnDetail} />
      },
      {
        path: "authors",
        element: <LazyLoad component={AuthorsPage} />
      },
      {
        path: "authors/:id",
        element: <LazyLoad component={AuthorDetailPage} />
      },
      {
        path: "themes",
        element: <LazyLoad component={ThemesPage} />
      },
      {
        path: "themes/:id",
        element: <LazyLoad component={ThemeDetailPage} />
      },
      {
        path: "search",
        element: <LazyLoad component={Search} />
      },
      {
        path: "access-denied",
        element: <LazyLoad component={AccessDeniedPage} />
      },
      {
        path: "auth/login",
        element: <LazyLoad component={Login} />
      },
      {
        path: "auth/register",
        element: <LazyLoad component={Register} />
      },
      {
        path: "auth/forgot-password",
        element: <LazyLoad component={ForgotPassword} />
      },
      {
        path: "account/profile",
        element: (
          <LazyLoad component={ProtectedRoute}>
            <LazyLoad component={Profile} />
          </LazyLoad>
        )
      },
      {
        path: "account/favorites",
        element: (
          <LazyLoad component={ProtectedRoute}>
            <LazyLoad component={Favorites} />
          </LazyLoad>
        )
      },
      {
        path: "account/settings",
        element: (
          <LazyLoad component={ProtectedRoute}>
            <LazyLoad component={Settings} />
          </LazyLoad>
        )
      },
      {
        path: "about",
        element: <LazyLoad component={AboutPage} />
      },
      {
        path: "about/new-features",
        element: <LazyLoad component={NewFeaturesPage} />
      },
      {
        path: "contact",
        element: <LazyLoad component={ContactPage} />
      },
      {
        path: "*",
        element: <LazyLoad component={NotFound} />
      }
    ]
  }
];

export default publicRoutes;
