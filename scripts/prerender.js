/**
 * Post-Build Prerendering Script
 * Generates static HTML for key routes after build
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes to prerender
const ROUTES = [
  '/',
  '/casino-siteleri',
  '/spor-bahisleri',
  '/canli-casino',
  '/slot-oyunlari',
  '/giris',
  '/kayit'
];

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  
  try {
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to route
    const url = `http://localhost:8080${route}`;
    console.log(`📄 Prerendering: ${route}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for React to hydrate
    await page.waitForSelector('[data-radix-root]', { timeout: 5000 }).catch(() => {});
    
    // Get rendered HTML
    const html = await page.content();
    
    // Clean up - remove loading state
    const cleanedHtml = html.replace(
      /id="initial-content"[^>]*>/,
      'id="initial-content" style="display:none">'
    );
    
    // Determine output path
    const distPath = path.join(__dirname, '..', 'dist');
    let outputPath;
    
    if (route === '/') {
      outputPath = path.join(distPath, 'index.html');
    } else {
      const routePath = route.slice(1); // Remove leading slash
      const dirPath = path.join(distPath, routePath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      outputPath = path.join(dirPath, 'index.html');
    }
    
    // Write HTML
    fs.writeFileSync(outputPath, cleanedHtml);
    console.log(`✅ Saved: ${outputPath}`);
    
  } catch (error) {
    console.error(`❌ Error prerendering ${route}:`, error.message);
  } finally {
    await page.close();
  }
}

async function prerender() {
  console.log('🚀 Starting prerendering...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const route of ROUTES) {
      await prerenderRoute(browser, route);
    }
    
    console.log('\n✅ Prerendering complete!');
    console.log(`📊 Prerendered ${ROUTES.length} routes`);
  } catch (error) {
    console.error('❌ Prerendering failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run prerendering
prerender();
