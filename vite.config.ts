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
            // CRITICAL: Keep ALL React ecosystem in single chunk
            if (id.includes('react') || 
                id.includes('react-dom') || 
                id.includes('react-router') || 
                id.includes('scheduler') || 
                id.includes('@remix-run') ||
                id.includes('react-helmet-async') ||
                id.includes('react-hook-form') ||
                id.includes('react-quill') ||
                id.includes('react-icons') ||
                id.includes('react-day-picker')) {
              return 'vendor-react';
            }
            
            // Keep React-dependent UI libraries together
            if (id.includes('@radix-ui') || id.includes('framer-motion') || id.includes('sonner')) {
              return 'vendor-ui';
            }
            
            // Query library - depends on React
            if (id.includes('@tanstack/react-query') || id.includes('@tanstack/query-core')) {
              return 'vendor-query';
            }
            
            // Chart library
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            // Other large dependencies
            if (id.includes('date-fns') || id.includes('zod') || id.includes('@supabase')) {
              return 'vendor-libs';
            }
            
            // All other node_modules
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
