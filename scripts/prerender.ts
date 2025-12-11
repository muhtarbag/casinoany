/**
 * Post-Build Prerendering Script
 * Uses Puppeteer to prerender critical routes with dynamic data from Supabase
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { generateRoutes } from './generate-routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:4173'; // Vite preview server default port
const DIST_DIR = path.resolve(__dirname, '../dist');

// Global reference to the preview server process
let previewServer: any;

/**
 * Start the Vite preview server
 */
async function startServer(): Promise<void> {
    console.log('🔌 Starting preview server...');

    return new Promise((resolve, reject) => {
        previewServer = spawn('npm', ['run', 'preview', '--', '--port', '4173', '--strictPort'], {
            stdio: 'pipe',
            shell: true,
            cwd: path.resolve(__dirname, '..')
        });

        previewServer.stdout.on('data', (data: any) => {
            const output = data.toString();
            // console.log(`[Server]: ${output}`); // Uncomment for debugging
            if (output.includes('Local:') && output.includes('4173')) {
                console.log('✅ Preview server is ready at 4173');
                resolve();
            }
        });

        previewServer.stderr.on('data', (data: any) => {
            console.error(`[Server Error]: ${data.toString()}`);
        });

        previewServer.on('error', (err: any) => {
            reject(err);
        });

        // Timeout if server doesn't start in 10s
        setTimeout(() => {
            reject(new Error('Server start timeout'));
        }, 10000);
    });
}

/**
 * Stop the preview server
 */
function stopServer() {
    if (previewServer) {
        console.log('🔌 Stopping preview server...');
        previewServer.kill();
    }
}

/**
 * Prerender a single route
 */
async function prerenderRoute(browser: any, route: string) {
    const page = await browser.newPage();

    try {
        // Set viewport for consistent rendering
        await page.setViewport({ width: 1920, height: 1080 });

        const url = `${BASE_URL}${route}`;
        console.log(`📄 Prerendering: ${route}`);

        // Navigate to the route
        const response = await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        if (!response || !response.ok()) {
            console.warn(`⚠️  Warning: ${route} returned status ${response?.status()}`);
            // We might still want to capture 404s if they are custom 404 pages, but usually we skip errors
            if (response?.status() === 404) return false;
        }

    } catch (error: any) {
        console.error(`❌ Failed to prerender ${route}:`, error.message);
        return false;
    } finally {
        // Just in case
    }

    try {
        // Special handling for AMP Pages and AMP source extraction
        const ampSourceElement = await page.$('#amp-source');
        let finalHtml = '';

        if (ampSourceElement) {
            console.log(`⚡ Detected AMP page: ${route}`);
            // Extract the pure AMP HTML from the script tag
            finalHtml = await page.evaluate((el: any) => el.textContent, ampSourceElement);
        } else {
            // Standard Prerendering for React Pages
            // Wait for React to dispatch render-event
            await page.evaluate(() => {
                return new Promise((resolve) => {
                    if (document.querySelector('[data-radix-root]')) {
                        resolve(true);
                    } else {
                        // Listen for a custom event if available, or just fallback to content check
                        window.addEventListener('render-event', () => resolve(true));
                        // Check periodically
                        const interval = setInterval(() => {
                            if (document.querySelector('[data-radix-root]')) {
                                clearInterval(interval);
                                resolve(true);
                            }
                        }, 500);
                        setTimeout(() => {
                            clearInterval(interval);
                            resolve(false);
                        }, 10000);
                    }
                });
            });

            // Additional wait to ensure all content is loaded
            await new Promise(r => setTimeout(r, 1000));

            // Get the rendered HTML
            const html = await page.content();

            // Clean up the HTML
            finalHtml = html
                .replace(/data-radix-\w+="[^"]*"/g, '') // Remove Radix data attributes
                .replace(/data-state="[^"]*"/g, ''); // Remove state data attributes
        }

        // Determine output path
        const routePath = route === '/' ? 'index.html' : `${route}/index.html`;
        const outputPath = path.join(DIST_DIR, routePath);

        // Create directory if it doesn't exist
        const dirPath = path.dirname(outputPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write the prerendered HTML
        fs.writeFileSync(outputPath, finalHtml, 'utf-8');

        console.log(`✅ Saved: ${routePath} ${ampSourceElement ? '(AMP)' : ''}`);
        return true;

    } catch (error: any) {
        console.error(`❌ Failed to process content for ${route}:`, error.message);
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
        // 1. Start Server
        await startServer();

        // 2. Fetch Routes
        console.log('📋 Fetching dynamic routes from database...');
        const routes = await generateRoutes();
        console.log(`📊 Total routes to prerender: ${routes.length}\n`);

        // 3. Launch Browser
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

        // 4. Prerender Loop
        const BATCH_SIZE = 4;
        let successCount = 0;

        for (let i = 0; i < routes.length; i += BATCH_SIZE) {
            const batch = routes.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map(route => prerenderRoute(browser, route))
            );
            successCount += results.filter(Boolean).length;

            const progress = Math.min(i + BATCH_SIZE, routes.length);
            console.log(`📈 Progress: ${progress}/${routes.length} routes\n`);
        }

        await browser.close();

        console.log('✨ Prerendering completed!');
        console.log(`✅ Successfully prerendered: ${successCount}/${routes.length} routes`);

    } catch (error) {
        console.error('\n❌ Prerendering failed:', error);
        process.exit(1);
    } finally {
        // 5. Cleanup
        stopServer();
        process.exit(0);
    }
}

// Run prerender
prerender();
