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
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    // Aggressive chunk splitting for optimal loading
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI libraries
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Query library
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Chart library
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'vendor-dates';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // Rich text editor
            if (id.includes('react-quill')) {
              return 'vendor-editor';
            }
            // All other node_modules
            return 'vendor-other';
          }
          
          // Split large route components
          if (id.includes('/pages/admin/')) {
            return 'admin-routes';
          }
          if (id.includes('/pages/')) {
            return 'app-routes';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Disable source maps in production
    sourcemap: false,
    // Use esbuild for minification (faster)
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query'
    ],
    exclude: ['@tanstack/react-virtual'], // Exclude if not used in initial load
  },
}));
