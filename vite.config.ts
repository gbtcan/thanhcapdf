import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

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
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      // Set up path aliases for easier imports
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@features': path.resolve(__dirname, './src/features'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@config': path.resolve(__dirname, './src/config')
    },
  },
  server: {
    // Development server configuration
    port: 3000,
    strictPort: false,
    open: true,
    host: 'localhost',
    cors: true,
  },
  build: {
    // Production build configuration
    outDir: 'dist',
    sourcemap: true,
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