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
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
    build: {
      rollupOptions: {
        output: {
          // Optimized manual chunking - React tek chunk'ta
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // CRITICAL: React ekosistemi TEK chunk'ta kalmalı
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              // Supabase - ayrı chunk
              if (id.includes('@supabase') || id.includes('supabase')) {
                return 'vendor-supabase';
              }
              // UI libraries - ayrı chunk (Radix, Sonner, Recharts)
              if (id.includes('@radix-ui') || id.includes('sonner') || id.includes('recharts') || id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              // Query & State - ayrı chunk
              if (id.includes('@tanstack')) {
                return 'vendor-query';
              }
              // Diğer vendor libs
              return 'vendor';
            }
          },
        },
      },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets < 4kb as base64
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
    exclude: ['@tanstack/react-virtual'],
    esbuildOptions: {
      plugins: []
    }
  },
}));
