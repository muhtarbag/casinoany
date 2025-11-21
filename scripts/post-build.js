/**
 * Post-Build Automation
 * Runs automatically after build to generate sitemap and prerender pages
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runPostBuild() {
  console.log('🚀 Starting post-build tasks...\n');

  try {
    // Step 1: Generate sitemap
    console.log('📋 Generating sitemap...');
    await execAsync('node --loader tsx scripts/generate-sitemap.ts');
    console.log('✅ Sitemap generated\n');

    // Step 2: Prerender pages (optional - only if you want static HTML)
    // Uncomment below to enable prerendering
    // console.log('📄 Prerendering pages...');
    // await execAsync('node scripts/prerender.js');
    // console.log('✅ Prerendering complete\n');

    console.log('✅ All post-build tasks completed!');
  } catch (error) {
    console.error('❌ Post-build tasks failed:', error);
    // Don't fail the build, just warn
    process.exit(0);
  }
}

runPostBuild();
