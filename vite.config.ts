import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Dedupe React to prevent multiple instances
    dedupe: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'react-helmet-async',
      'recharts',
      'framer-motion',
      'sonner',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-switch',
      '@radix-ui/react-select',
      '@radix-ui/react-label',
      '@radix-ui/react-slot'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React ecosystem - keep everything React-related together
            if (id.includes('react') || 
                id.includes('scheduler') || 
                id.includes('@remix-run') ||
                id.includes('react-dom') || 
                id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // UI libraries that depend on React
            if (id.includes('@radix-ui') || 
                id.includes('framer-motion') || 
                id.includes('sonner') ||
                id.includes('vaul') ||
                id.includes('@dnd-kit')) {
              return 'vendor-ui';
            }
            
            // Query and state management
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || 
                id.includes('zod') || 
                id.includes('@hookform')) {
              return 'vendor-forms';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            
            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            // Everything else
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'recharts',
      'framer-motion',
      'sonner',
      'react-helmet-async'
    ],
    exclude: ['@tanstack/react-virtual'],
  },
}));
