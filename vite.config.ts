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
    dedupe: ['react', 'react-dom', 'react-router-dom', 'react-router', 'scheduler', '@tanstack/react-query'],
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // CRITICAL: Keep React ecosystem as SINGLE MONOLITHIC chunk
            // This prevents ALL dispatcher null errors by guaranteeing single React instance
            if (id.includes('react') || id.includes('react-dom') || 
                id.includes('react-router') || id.includes('scheduler') ||
                id.includes('@tanstack/react-query') || id.includes('three') ||
                id.includes('@radix-ui')) {
              return 'vendor-react'; // All React + Radix in one chunk
            }
            // Split recharts separately with proper initialization
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Keep d3 separate from recharts to avoid circular deps
            if (id.includes('d3-')) {
              return 'vendor-d3';
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
      'three'
    ],
    exclude: [],
    force: true, // Force to ensure single React instance
    esbuildOptions: {
      target: 'es2020',
      plugins: []
    }
  },
}));
