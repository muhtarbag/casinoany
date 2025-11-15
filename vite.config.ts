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
    // CRITICAL: Force single React instance across all modules
    dedupe: ['react', 'react-dom', 'react-router-dom', 'react-router', 'scheduler', '@tanstack/react-query', 'react-helmet-async'],
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // CRITICAL: Keep React ecosystem in ONE chunk WITHOUT recharts
            if (id.includes('react') || id.includes('scheduler') || 
                id.includes('@radix-ui') || id.includes('@tanstack') ||
                id.includes('react-helmet-async') || id.includes('three')) {
              return 'vendor-react';
            }
            // Recharts gets its own separate chunk to prevent conflicts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'vendor-editor';
            }
          }
          // Bundle all admin pages together for consistency
          if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
            return 'admin-bundle';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  // Optimize dependencies - CRITICAL for preventing multiple React instances
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'react-router',
      '@tanstack/react-query',
      'react-helmet-async',
      '@radix-ui/react-progress',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-separator',
      '@radix-ui/react-tooltip',
      'three',
      'recharts',
      'lodash',
      'lodash/get'
    ],
    exclude: [],
    force: true,
    esbuildOptions: {
      target: 'es2020',
      plugins: []
    }
  },
}));
