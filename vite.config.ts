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
          // Manual chunking stratejisi - vendor, ui, admin ayrımı
          manualChunks: (id) => {
            // Node modules - vendor chunk
            if (id.includes('node_modules')) {
              // React ecosystem - ayrı chunk
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              // UI libraries - ayrı chunk
              if (id.includes('@radix-ui') || id.includes('sonner') || id.includes('recharts')) {
                return 'vendor-ui';
              }
              // Query & State - ayrı chunk
              if (id.includes('@tanstack') || id.includes('react-query')) {
                return 'vendor-query';
              }
              // Supabase - ayrı chunk
              if (id.includes('supabase')) {
                return 'vendor-supabase';
              }
              // Diğer vendor kütüphaneleri
              return 'vendor-misc';
            }
            // Admin pages - ayrı chunk
            if (id.includes('/src/pages/admin/')) {
              return 'pages-admin';
            }
            // Public pages - ayrı chunk
            if (id.includes('/src/pages/') && !id.includes('/admin/')) {
              return 'pages-public';
            }
            // UI components - ayrı chunk
            if (id.includes('/src/components/ui/')) {
              return 'components-ui';
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
