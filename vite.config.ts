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
      output: {
        manualChunks: (id) => {
          // Only split heavy non-React dependencies to avoid dispatcher issues
          if (id.includes('node_modules')) {
            // Charts library (heavy)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Rich text editor (heavy)
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'vendor-editor';
            }
            // Keep React ecosystem together (critical for hooks)
            if (id.includes('react') || id.includes('react-dom') || 
                id.includes('scheduler') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI libraries
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
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
