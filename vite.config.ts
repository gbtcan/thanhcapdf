import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable JSX in .js files
      include: "**/*.{jsx,tsx}",
      // Use React automatic JSX transform
      jsxRuntime: 'automatic',
      // Add babel plugins if needed
      babel: {
        plugins: [],
      }
    }),
  ],
  resolve: {
    alias: {
      // Set up path aliases for easier imports
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    // Development server configuration
    port: 5173,
    strictPort: false,
    open: true,
    host: 'localhost',
    cors: true,
  },
  build: {
    // Production build configuration
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'dompurify'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});