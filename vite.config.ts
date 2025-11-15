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
    dedupe: ['react', 'react-dom', 'react-router-dom', 'scheduler'],
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // Vendor chunk - Core dependencies
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Forms & validation
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // Query & async
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Rich text editor
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'vendor-editor';
            }
            // Other vendors
            return 'vendor-other';
          }
          
          // Admin pages chunk
          if (id.includes('/pages/admin/')) {
            if (id.includes('/analytics/')) return 'admin-analytics';
            if (id.includes('/content/')) return 'admin-content';
            if (id.includes('/finance/')) return 'admin-finance';
            if (id.includes('/system/')) return 'admin-system';
            if (id.includes('/sites/')) return 'admin-sites';
            if (id.includes('/blog/')) return 'admin-blog';
            return 'admin-core';
          }
          
          // UI components chunk
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'react-helmet-async'
    ],
    exclude: [],
    force: true,
    esbuildOptions: {
      target: 'es2020',
      plugins: []
    }
  },
}));
