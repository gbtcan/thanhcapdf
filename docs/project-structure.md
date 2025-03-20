# Project Structure

This document provides an overview of the project structure and organization.

## Main Directories

- **`public/`**: Static assets served as-is by the web server
- **`scripts/`**: Build scripts, utilities, and database management tools
- **`src/`**: Source code for the application
- **`supabase/`**: Supabase database setup and migrations

## Source Code Organization

The `src/` directory is organized by feature and responsibility:

### Core Application Structure

- **`src/main.tsx`**: Application entry point
- **`src/App.tsx`**: Root React component
- **`src/bootstrap.ts`**: Application initialization logic

### Components

Components are organized by feature and functionality:

- **`src/components/common/`**: Shared UI components used across the application
- **`src/components/pdf/`**: PDF-specific components for viewing and managing PDFs
- **`src/components/hymns/`**: Components related to hymns
- **`src/components/home/`**: Components used on the home page

### Features

Feature modules contain domain-specific code:

- **`src/features/hymns/`**: Hymns feature
- **`src/features/pdf/`**: PDF handling feature
- **`src/features/auth/`**: Authentication feature

### Services and Utilities

- **`src/lib/`**: Services and core business logic
- **`src/utils/`**: General utility functions
- **`src/config/`**: Configuration files

### Pages

- **`src/pages/`**: Top-level page components that correspond to routes

## Best Practices

1. **Imports Organization**:
   - Keep imports organized by type (React, external libraries, internal imports)
   - Use relative paths for imports within the same feature
   - Use absolute paths for cross-feature imports

2. **Component Structure**:
   - Place highly reusable components in `components/common/`
   - Feature-specific components should live in their respective feature directories

3. **State Management**:
   - Use React context for application-wide state
   - Use React Query for server state management
   - Prefer local component state when possible
