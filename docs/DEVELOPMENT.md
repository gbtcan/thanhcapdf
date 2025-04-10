# Development Guide

This guide provides detailed information for developers working on the Catholic Hymns App.

## Table of Contents

- [Development Environment](#development-environment)
- [Code Organization](#code-organization)
- [Offline Functionality](#offline-functionality)
- [State Management](#state-management)
- [Performance Optimization](#performance-optimization)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Deployment](#deployment)

## Development Environment

### Required Tools

- Node.js (v16+)
- npm or yarn
- Git
- VS Code (recommended)

### Recommended Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- GitLens

### Local Setup

1. Clone the repository
2. Run `npm install`
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials
4. Start the dev server: `npm run dev`

## Code Organization

The project follows a feature-based organization:

- **Core Module**: Contains utilities, interfaces, and base components used across the application
- **Feature Modules**: Self-contained modules that implement specific features
- **Pages**: Components that represent routes in the application
- **Contexts**: Global state management

### Feature Module Structure

Each feature module follows this structure:

```
feature/
├── api/           # API calls related to this feature
├── components/    # UI components specific to this feature
├── hooks/         # Custom hooks
├── pages/         # Route pages
├── types/         # TypeScript interfaces
├── utils/         # Feature-specific utilities
└── index.ts       # Public API of the feature
```

### Import Best Practices

1. Use absolute imports for core modules
2. Use relative imports for components within the same feature
3. Always import only what you need (avoid `import *`)
4. Use dynamic imports for code splitting

Example:
```typescript
// Good
import { Button } from '@/core/components/ui/button';
import { useHymnDetail } from '../hooks/useHymnDetail';

// Avoid
import * as UI from '@/core/components/ui';
```

## Offline Functionality

The app implements offline functionality using:

1. **Service Worker**: For caching static assets
2. **IndexedDB**: For storing hymn data and user actions
3. **Synchronization Mechanism**: For handling conflicts

### Implementing Offline-First Features

1. Check network status before making API calls
2. Use the offline manager to queue actions when offline
3. Always provide offline fallbacks for critical features
4. Inform users about offline status and queued actions

Example:
```typescript
import { useOfflineManager } from '@/features/offline';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { isOnline } = useNetworkStatus();
const { queueAction, pendingActions } = useOfflineManager();

// When performing an action
const handleLike = async (hymnId) => {
  if (isOnline) {
    // Perform the action immediately
    await likeHymn(hymnId);
  } else {
    // Queue for later sync
    queueAction({
      type: 'LIKE_HYMN',
      payload: { hymnId },
      timestamp: Date.now()
    });
  }
};
```

## State Management

The app uses a combination of state management approaches:

1. **React Query**: For server state (API data)
2. **Context API**: For global application state
3. **Local Component State**: For UI state

### When to Use Each Approach

- **React Query**: For any data that comes from the backend
- **Context API**: For shared state needed across components
- **Local State**: For component-specific UI state

## Performance Optimization

### Code Splitting

Use dynamic imports for routes and large components:

```typescript
// In route definitions
const AdminDashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
```

### Memoization

Use React's memoization techniques to prevent unnecessary re-renders:

```typescript
// For components
const MemoizedComponent = React.memo(MyComponent);

// For callbacks
const handleClick = useCallback(() => {
  // handle click
}, [dependencies]);

// For computed values
const filteredData = useMemo(() => {
  return data.filter(item => item.isActive);
}, [data]);
```

### Image Optimization

1. Use the `OptimizedImage` component for all images
2. Specify width and height attributes
3. Use appropriate image formats (WebP for modern browsers)

### Bundle Size Monitoring

Run `npm run analyze` to view bundle size and identify large dependencies.

## Coding Standards

### TypeScript

- Define interfaces for all props and state
- Use strict typing and avoid `any`
- Use discriminated unions for complex state

### React

- Use functional components with hooks
- Break large components into smaller, focused ones
- Add descriptive comments for complex logic

### CSS/Styling

- Use Tailwind's utility classes
- For complex components, use CSS modules or styled-components
- Follow mobile-first approach

## Testing

### Unit Testing

We use Vitest for unit testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- components/Button.test.tsx
```

### Test Coverage

Aim for at least 70% test coverage for core functionality.

## Deployment

### Preview Deployments

Each PR automatically gets a preview deployment.

### Production Deployment

Production deployments are triggered by:

1. Merging to `main` branch
2. Creating a new release tag

### Environment Variables

Make sure all required environment variables are set in the deployment platform.
