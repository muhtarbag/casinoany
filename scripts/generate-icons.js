
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SOURCE_IMAGE = '/Users/macbook/.gemini/antigravity/brain/e1dff64a-dfa9-4571-b7aa-5cb0caf59db6/uploaded_image_1765407548153.jpg';
const OUTPUT_DIR = path.resolve('public');

async function generateIcons() {
    console.log('🎨 Starting icon generation...');
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
    const page = await browser.newPage();

    // Helper to process image
    const processImage = async (size, filename, maskable = false) => {
        await page.evaluate(async (src, size, maskable) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    // 1. Detect Background Color (sample top-left pixel)
                    // Draw image to a temp canvas to sample
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(img, 0, 0);
                    const p = tempCtx.getImageData(0, 0, 1, 1).data;
                    const bgColor = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;

                    // 2. Fill Background
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, size, size);

                    // 3. Draw Image (Contain)
                    // Calculate scale to fit
                    const scale = Math.min(size / img.width, size / img.height);

                    // If maskable, we need more padding (safe zone is center 60%)
                    // Standard contain is 100%, maskable should typically be ~80% or less
                    const finalScale = maskable ? scale * 0.7 : scale;

                    const w = img.width * finalScale;
                    const h = img.height * finalScale;
                    const x = (size - w) / 2;
                    const y = (size - h) / 2;

                    ctx.drawImage(img, x, y, w, h);

                    // Return base64
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = (e) => reject(e);
                img.src = src;
            });
        }, SOURCE_IMAGE, size, maskable);

        // Save file
        // Get the base64 string from page evaluation
        const dataUrl = await page.evaluate(() => document.querySelector('canvas') ? document.querySelector('canvas').toDataURL() : null) ||
            // The evaluate above actually RETURNS the promise result, so we get it directly
            await page.evaluate(async (src, size, maskable) => { /* dup logic */ return 'handled-above'; }, SOURCE_IMAGE, size, maskable);

        // Wait, the evaluate returns the result of the promise
        // Refactoring to be cleaner
    };

    // Re-write clean evaluate function
    const createIcon = async (size, name, maskable) => {
        console.log(`Generating ${name} (${size}x${size})...`);
        const dataUrl = await page.evaluate(async (src, size, isMaskable) => {
            // Load Image
            const img = new Image();
            img.src = src;
            await new Promise(r => img.onload = r);

            // Create Canvas
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Sample Background Color
            const tempC = document.createElement('canvas');
            tempC.width = 1;
            tempC.height = 1;
            const tCtx = tempC.getContext('2d');
            tCtx.drawImage(img, 0, 0, 1, 1); // shrink to 1px to get avg/top-left
            // Actually top-left is better for padding matching
            // Let's draw full image to properly sample? No, expensive.
            // Let's assume standard logo has uniform BG at corners.
            // Draw image to temp canvas
            const samplerC = document.createElement('canvas');
            samplerC.width = img.width;
            samplerC.height = img.height;
            const sCtx = samplerC.getContext('2d');
            sCtx.drawImage(img, 0, 0);
            const p = sCtx.getImageData(0, 0, 1, 1).data;
            const bgColor = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;

            // Fill Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, size, size);

            // Draw Logo Centered
            const scale = Math.min(size / img.width, size / img.height);
            // Maskable needs padding (safe area is circle within square)
            // Normal icons usually look better with slight padding (90%)
            const paddingFactor = isMaskable ? 0.60 : 0.85;
            const finalScale = scale * paddingFactor;

            const w = img.width * finalScale;
            const h = img.height * finalScale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;

            ctx.drawImage(img, x, y, w, h);

            return canvas.toDataURL('image/png');
        }, SOURCE_IMAGE, size, maskable);

        // Write to file
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(path.join(OUTPUT_DIR, name), base64Data, 'base64');
    };

    try {
        // 1. Read the source file as base64 to pass to browser (avoid file:// permission issues)
        const fileBuffer = fs.readFileSync(SOURCE_IMAGE);
        const base64Source = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

        // Overwrite SOURCE_IMAGE variable in evaluate context with base64 data
        // (Wait, I can just pass the vars)

        await createIcon(512, 'pwa-512x512.png', false);
        await createIcon(192, 'pwa-192x192.png', false);
        await createIcon(512, 'pwa-maskable-512x512.png', true);
        await createIcon(192, 'pwa-maskable-192x192.png', true);
        await createIcon(180, 'apple-touch-icon.png', false);
        await createIcon(64, 'favicon.ico', false); // Browsers handle png-in-ico or just generic resize

        console.log('✅ All icons generated successfully!');
    } catch (error) {
        console.error('❌ Error generating icons:', error);
    } finally {
        await browser.close();
    }
}

// Update the source var to be the base64 version
// Redefine source reading logic inside main
generateIcons();
