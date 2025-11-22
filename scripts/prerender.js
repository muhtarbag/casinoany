/**
 * Post-Build Prerendering Script
 * Uses Puppeteer to prerender critical routes with dynamic data from Supabase
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRoutes } from './generate-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:4173'; // Vite preview server
const DIST_DIR = path.resolve(__dirname, '../dist');

/**
 * Prerender a single route
 */
async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  
  try {
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });
    
    const url = `${BASE_URL}${route}`;
    console.log(`📄 Prerendering: ${route}`);
    
    // Navigate to the route
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for React to dispatch render-event
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.querySelector('[data-radix-root]')) {
          resolve(true);
        } else {
          window.addEventListener('render-event', () => resolve(true));
          setTimeout(() => resolve(false), 10000);
        }
      });
    });
    
    // Additional wait to ensure all content is loaded
    await page.waitForTimeout(1000);
    
    // Get the rendered HTML
    const html = await page.content();
    
    // Clean up the HTML
    const cleanHtml = html
      .replace(/data-radix-\w+="[^"]*"/g, '') // Remove Radix data attributes
      .replace(/data-state="[^"]*"/g, ''); // Remove state data attributes
    
    // Determine output path
    const routePath = route === '/' ? 'index.html' : `${route}/index.html`;
    const outputPath = path.join(DIST_DIR, routePath);
    
    // Create directory if it doesn't exist
    const dirPath = path.dirname(outputPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write the prerendered HTML
    fs.writeFileSync(outputPath, cleanHtml, 'utf-8');
    
    console.log(`✅ Saved: ${routePath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Failed to prerender ${route}:`, error.message);
    return false;
  } finally {
    await page.close();
  }
}

/**
 * Main prerender function
 */
async function prerender() {
  console.log('🚀 Starting prerendering with dynamic routes...\n');
  
  try {
    // Generate dynamic routes from Supabase
    console.log('📋 Fetching dynamic routes from database...');
    const routes = await generateRoutes();
    console.log(`📊 Total routes to prerender: ${routes.length}\n`);
    
    // Launch browser
    console.log('🌐 Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    console.log('✅ Browser launched\n');
    
    // Prerender routes in batches (4 concurrent)
    const BATCH_SIZE = 4;
    let successCount = 0;
    
    for (let i = 0; i < routes.length; i += BATCH_SIZE) {
      const batch = routes.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(route => prerenderRoute(browser, route))
      );
      successCount += results.filter(Boolean).length;
      
      // Progress indicator
      const progress = Math.min(i + BATCH_SIZE, routes.length);
      console.log(`📈 Progress: ${progress}/${routes.length} routes\n`);
    }
    
    await browser.close();
    
    console.log('✨ Prerendering completed!');
    console.log(`✅ Successfully prerendered: ${successCount}/${routes.length} routes`);
    console.log('\n📦 Build artifacts ready in dist/ folder');
    console.log('\n🎯 SEO Benefits:');
    console.log('   • Google can index all pages immediately');
    console.log('   • Improved LCP and FCP scores');
    console.log('   • Better crawlability for search engines');
    
    if (successCount < routes.length) {
      console.warn(`\n⚠️  ${routes.length - successCount} routes failed to prerender`);
    }
  } catch (error) {
    console.error('\n❌ Prerendering failed:', error);
    process.exit(1);
  }
}

// Run prerender
prerender();
