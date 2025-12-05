import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Custom plugin to run prerendering after build
function prerenderPlugin(): Plugin {
  return {
    name: 'vite-plugin-custom-prerender',
    apply: 'build',
    async closeBundle() {
      console.log('\n🚀 Starting prerendering process...\n');
      try {
        // Run the prerender script using tsx for TypeScript support
        const { stdout, stderr } = await execAsync('npx tsx scripts/prerender.ts');
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error: any) {
        console.error('❌ Prerendering failed:', error.message);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'inline',
      includeAssets: ['favicon.ico', 'robots.txt', 'logos/*.png', 'logos/*.svg', 'banners/*.jpg'],
      manifest: {
        name: 'CasinoAny - Casino ve Bahis Siteleri',
        short_name: 'CasinoAny',
        description: 'Türkiye\'nin en güvenilir casino ve bahis siteleri karşılaştırma platformu',
        theme_color: '#c026d3',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/, /^\/admin/],
        skipWaiting: false,
        clientsClaim: false,
        runtimeCaching: [
          // API Calls - NetworkFirst (fresh data priority, fallback to cache)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          // Supabase Storage Images - CacheFirst (long-term cache)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts Stylesheets - CacheFirst
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Google Fonts Files (WOFF2) - CacheFirst
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Static Images (WebP, PNG, JPG) - CacheFirst
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // JS and CSS - CacheFirst with versioning
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // HTML Pages - StaleWhileRevalidate (show cached, update in background)
          {
            urlPattern: /\.html$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    }),
    mode === 'production' && prerenderPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // CRITICAL: Force single React instance - all packages must use the same React
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "scheduler": path.resolve(__dirname, "./node_modules/scheduler"),
      // Force recharts to use lodash-es instead of lodash
      "lodash": "lodash-es"
    },
    // CRITICAL: Force single React instance across all modules
    dedupe: ['react', 'react-dom', 'react-router-dom', 'react-router', 'scheduler', '@tanstack/react-query', 'react-helmet-async', 'lodash'],
  },
  ssr: {
    noExternal: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - Most critical, loaded first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Data Management - Frequently used
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-virtual'],
          'vendor-supabase': ['@supabase/supabase-js'],

          // UI Components - Split by usage frequency
          'vendor-ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover'
          ],
          'vendor-ui-extended': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch'
          ],

          // Icons & Visual
          'vendor-icons': ['lucide-react', 'react-icons'],
          'vendor-animation': ['framer-motion'],

          // Charts - Heavy, load on demand
          'vendor-charts': ['recharts'],

          // Forms & Validation
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],

          // Rich Content - Heavy editor
          'vendor-editor': ['react-quill'],

          // Utilities - Small but frequently used
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'lodash-es'],

          // Theme & SEO
          'vendor-misc': ['next-themes', 'react-helmet-async', 'sonner']
        }
      },
    },
    chunkSizeWarningLimit: 1000,
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
      // Force React to be external and use the same instance
      external: [],
      alias: {
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'scheduler': path.resolve(__dirname, './node_modules/scheduler')
      }
    }
  },
}));
