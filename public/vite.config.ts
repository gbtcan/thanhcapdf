import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      // Fix MIME type issues with detailed configuration
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173
      },
      // Ensure proper CORS handling
      cors: true
    },
    define: {
      // Hardcode the key values here to ensure they're available
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://fwoxlggleieoztmcvsju.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3b3hsZ2dsZWllb3p0bWN2c2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTY1OTUsImV4cCI6MjA1Njg5MjU5NX0.2I1OSvsQg0F6OEAeDSVSdIJfJWPPNjlLB7OhCaigEPI')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    css: {
      devSourcemap: true,
    },
    build: {
      sourcemap: true,
      cssCodeSplit: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'supabase': ['@supabase/supabase-js']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['@supabase/supabase-js', 'react', 'react-dom', 'react-router-dom']
    }
  };
});
