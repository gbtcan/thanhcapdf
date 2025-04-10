# Catholic Hymns App

A comprehensive web application for browsing, searching, managing, and enjoying a collection of Catholic hymns with role-based authentication and advanced content management capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Public Features](#public-features)
  - [User Features](#user-features)
  - [Editor Features](#editor-features)
  - [Admin Features](#admin-features)
- [Technical Architecture](#technical-architecture)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Authentication System](#authentication-system)
- [Core Components](#core-components)
- [Database Structure](#database-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This application provides a digital library of Catholic hymns that can be accessed by anyone. It features a responsive design that works across devices, advanced search and filtering capabilities, and a role-based authentication system. Authenticated users with appropriate permissions can manage content including hymns, authors, and categories. The application uses Supabase for backend services, authentication, and file storage.

## Features

### Public Features

#### Hymn Browsing
- Browse all hymns with pagination
- View detailed hymn information including lyrics and PDF versions
- See related hymns based on authors and categories
- Responsive layout for mobile and desktop viewing

#### Author and Category Management
- Browse authors with their biographies and associated hymns
- View categories and all hymns within each category
- See hymn count statistics for each category

#### Search Capabilities
- Search by hymn title, lyrics content, or author name
- Filter results by category
- Sort results by various criteria (title, author, creation date)

### User Features

- User registration and login
- User profile management
- View history of recently viewed hymns
- Save favorite hymns for quick access

### Editor Features

- Create and edit hymns with rich text formatting
- Manage authors and their biographical information
- Create and organize hymn categories
- Upload and manage PDF files for hymns

### Admin Features

- Full content management capabilities
- User management (view, edit roles, disable accounts)
- System statistics and dashboard
- Database monitoring and maintenance

## Technical Architecture

The application is built using the following technologies:

- **Frontend**: React with TypeScript, styled with TailwindCSS
- **State Management**: React Context API and TanStack Query
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Build Tool**: Vite
- **Deployment**: Netlify/Vercel

## Project Structure

project/ ├── public/ # Static files ├── src/ # Source files │ ├── components/ # Reusable UI components │ ├── contexts/ # React context providers │ │ └── AuthContext.tsx # Authentication context │ ├── lib/ # Library code │ │ └── supabase.ts # Supabase client configuration │ ├── pages/ # Application pages │ │ ├── admin/ # Admin pages │ │ └── ... # Public pages │ ├── types/ # TypeScript type definitions │ └── utils/ # Utility functions ├── supabase/ # Supabase configurations │ └── migrations/ # Database migration scripts ├── App.tsx # Main application component ├── main.tsx # Application entry point └── vite.config.ts # Vite configuration

### Key Directories and Files Explained

#### `src/components/`
Contains reusable UI components like PageLayout, Navbar, ProtectedRoute, and various form components.

#### `src/contexts/`
Contains React contexts for state management across components:
- `AuthContext.tsx` - Manages authentication state and user sessions

#### `src/lib/`
Contains configuration and service files:
- `supabase.ts` - Supabase client configuration and helper functions

#### `src/pages/`
All application pages organized by feature:
- `Home.tsx` - Landing page with featured hymns
- `SongDetailPage.tsx` - Displays detailed view of a hymn
- `Authors.tsx`, `Categories.tsx` - Lists authors and categories
- `Login.tsx`, `Register.tsx` - User authentication pages
- `admin/` - Admin-only pages for content management

#### `src/types/`
TypeScript type definitions for the application:
- Database entity types
- Component props types
- Custom type utilities

#### `supabase/migrations/`
SQL migration files that define the database schema and permissions:
- `20250310000000_schema_standardization.sql` - Base schema
- `20250401000000_public_data_access.sql` - Public access permissions

## Setup and Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account and project

### Environment Setup

1. Clone the repository
git clone <repository-url> cd project
2. Install dependencies
npm install
3. Create a `.env` file with your Supabase credentials
VITE_SUPABASE_URL=your-supabase-project-url VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
4. Start the development server
npm run dev
### Database Setup

1. Run migrations from the `supabase/migrations` folder to set up your database schema
2. Ensure that Row-Level Security (RLS) policies are properly configured for public and protected data

## Authentication System

The app uses Supabase Authentication with email/password login and implements a role-based access control system:

- **Anonymous users**: Can browse hymns, authors, and categories (read-only access)
- **Standard users**: Can save favorites and access premium features
- **Editors**: Can create and edit hymn content, authors, and categories
- **Administrators**: Full access including user management

### User Roles

User roles are stored in the `user_roles` table with a reference to the Supabase Auth user id.

### Protected Routes

The application uses a `ProtectedRoute` component to restrict access to pages based on user roles.

## Core Components

### `PageLayout`
A reusable layout component that includes the header, footer, and main content area.

### `Navbar`
A navigation bar component that adapts based on user authentication state and role.

### `ProtectedRoute`
A higher-order component that wraps around routes to enforce role-based access control.

### `AuthContext`
A React context provider that manages authentication state and user sessions.

### `supabase.ts`
A configuration file for initializing and using the Supabase client.

## Database Structure

The database schema includes the following tables:

- `hymns`: Stores hymn details including title, lyrics, author_id, category_id, and PDF file URL.
- `authors`: Stores author details including name and biography.
- `categories`: Stores category details including name and description.
- `user_roles`: Stores user roles with references to Supabase Auth user ids.
- `favorites`: Stores user favorite hymns with references to user ids and hymn ids.

## Deployment

This application can be deployed on platforms like Netlify, Vercel, or any static hosting provider.

### Build for Production

npm run build

This will create a dist directory with the production build.

### Netlify Configuration

A netlify.toml file is included for Netlify deployments, which handles SPA routing.

## Troubleshooting

### Common Issues

#### Authentication session lost after page reload

- Check that the Supabase client is properly configured
- Verify that onAuthStateChange is properly implemented

#### Permission errors with Supabase

- Check Row-Level Security policies in Supabase
- Verify user roles are correctly assigned

#### Vite connection issues

- Clear browser cache and local storage
- Use the utility functions in utils/fixViteConnection.ts

### Debugging

The application includes utility pages for diagnostics:

- `/diagnostics` - Shows connection status and environment information

## Utility Scripts

The project includes Python utility scripts in the `scripts/` directory for administrative tasks:

### PDF Import Script

For bulk importing PDF files to the application:

```bash
cd scripts
pip install -r requirements.txt
python import_pdfs.py
```

See the [scripts README](./scripts/README.md) for more details on available scripts and configuration.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

This README provides a comprehensive overview of your project structure, features, and setup instructions. It should help new developers understand the codebase and how to get started with the project.

project/
├── public/                # Static files and assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common UI elements
│   │   ├── forum/         # Forum-specific components
│   │   ├── pdf/           # PDF handling components
│   │   └── layout/        # Layout components
│   ├── contexts/          # Context providers
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication feature
│   │   ├── forum/         # Forum features
│   │   ├── library/       # Music library features
│   │   ├── profile/       # User profile features
│   │   └── admin/         # Admin features
│   ├── lib/               # Library code
│   ├── pages/             # Application pages
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── supabase/              # Database configuration
└── scripts/               # Utility scripts

project/
├── public/                # Tệp tĩnh và tài nguyên
├── src/
│   ├── components/        # Các thành phần giao diện tái sử dụng
│   │   ├── common/        # Các yếu tố giao diện chung
│   │   ├── forum/         # Các thành phần dành riêng cho diễn đàn
│   │   ├── pdf/           # Các thành phần xử lý PDF
│   │   └── layout/        # Các thành phần bố cục
│   ├── contexts/          # Nhà cung cấp ngữ cảnh
│   ├── features/          # Các mô-đun tính năng
│   │   ├── auth/          # Tính năng xác thực
│   │   ├── forum/         # Các tính năng diễn đàn
│   │   ├── library/       # Các tính năng thư viện âm nhạc
│   │   ├── profile/       # Các tính năng hồ sơ người dùng
│   │   └── admin/         # Các tính năng quản trị
│   ├── lib/               # Mã thư viện
│   ├── pages/             # Các trang ứng dụng
│   ├── types/             # Định nghĩa TypeScript
│   └── utils/             # Các hàm tiện ích
├── supabase/              # Cấu hình cơ sở dữ liệu
└── scripts/               # Các tập lệnh tiện ích

project/version uo
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   ├── hymns/            # Hymn-specific components
│   │   ├── authors/          # Author-specific components
│   │   ├── forum/            # Forum components
│   │   ├── admin/            # Admin-related components
│   │   └── user/             # User-related components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Library and service code
│   │   ├── api/              # API clients organized by domain
│   │   │   ├── hymnsApi.ts
│   │   │   ├── authorsApi.ts
│   │   │   ├── forumApi.ts
│   │   │   ├── usersApi.ts
│   │   │   └── ...
│   │   └── services/         # Business logic services
│   │       ├── hymnService.ts
│   │       ├── forumService.ts
│   │       └── ...
│   ├── pages/                # Pages organized by domain
│   │   ├── hymns/            # Hymn-related pages
│   │   ├── forum/            # Forum-related pages
│   │   ├── admin/            # Admin pages
│   │   ├── user/             # User-related pages
│   │   └── ...
│   └── types/                # Type definitions matching DB schema
│       ├── hymns.ts
│       ├── forum.ts
│       ├── users.ts
│       └── ...

version 3
project/
├── public/                   # Static assets
│   └── pdf.worker.min.js     # PDF.js worker file
│
├── scripts/                  # Build and utility scripts
│   ├── database/             # Database-related scripts
│   └── pdf/                  # PDF processing scripts
│
├── src/
│   ├── components/           # Shared UI components
│   │   ├── common/           # Generic reusable components
│   │   ├── layout/           # Layout components
│   │   ├── pdf/              # PDF-related components
│   │   ├── hymns/            # Hymn-related components
│   │   ├── categories/       # Category-related components
│   │   ├── forum/            # Forum-related components
│   │   └── home/             # Homepage components
│   │
│   ├── features/             # Feature-specific modules
│   │   ├── hymns/            # Hymn feature
│   │   ├── auth/             # Authentication feature
│   │   ├── pdf/              # PDF feature
│   │   ├── categories/       # Categories feature
│   │   └── forum/            # Forum feature
│   │
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   │   ├── pdf/              # PDF utilities
│   │   └── database/         # Database utilities
│   │
│   ├── lib/                  # Service modules
│   │   ├── api/              # API client functions
│   │   ├── supabase/         # Supabase-specific code
│   │   └── services/         # Service modules
│   │
│   ├── types/                # TypeScript type definitions
│   ├── config/               # Configuration files
│   ├── contexts/             # React contexts
│   └── pages/                # Page components
│
├── supabase/                 # Supabase configuration
│   └── migrations/           # Database migration scripts
│
└── docs/                     # Documentation

Hoàn thiện tính năng offline:

Implement service worker
Hoàn thiện IndexedDB và caching strategy
Xây dựng synchronization mechanism
Tối ưu hóa hiệu suất:

Implement code splitting
Thêm memoization cho components phức tạp
Optimize bundle size
Cải thiện trải nghiệm người dùng:

Hoàn thiện accessibility
Thêm skeleton loading screens
Cải thiện responsive design
Hoàn thiện documentation:

Thêm JSDoc cho functions và components
Viết README.md chi tiếtHoàn thiện documentation:

Thêm JSDoc cho functions và components
Viết README.md chi tiết
Tạo hướng dẫn phát triển
Tạo hướng dẫn phát triển