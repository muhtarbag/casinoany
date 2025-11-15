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
          // Let Vite handle chunking automatically - more reliable
          manualChunks: undefined,
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
