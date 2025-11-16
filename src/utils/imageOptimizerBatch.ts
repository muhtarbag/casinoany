/**
 * Batch image optimization utilities
 * Handles multiple images and responsive size generation
 */

import { optimizeImage, OptimizationOptions, OptimizationResult } from './imageOptimizer';
import { logger } from '@/lib/logger';

export interface BatchOptimizationResult {
  results: OptimizationResult[];
  totalOriginalSize: number;
  totalOptimizedSize: number;
  totalSavings: number;
  failedFiles: string[];
}

/**
 * Optimize multiple images in batch
 */
export async function optimizeImageBatch(
  files: File[],
  options: OptimizationOptions = {}
): Promise<BatchOptimizationResult> {
  const results: OptimizationResult[] = [];
  const failedFiles: string[] = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of files) {
    try {
      const result = await optimizeImage(file, options);
      results.push(result);
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
    } catch (error) {
      logger.error('performance', `Failed to optimize ${file.name}`, error as Error);
      failedFiles.push(file.name);
    }
  }

  const totalSavings = Math.round(
    ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100
  );

  return {
    results,
    totalOriginalSize,
    totalOptimizedSize,
    totalSavings,
    failedFiles
  };
}

/**
 * Generate responsive image sizes from a single image
 */
export async function generateResponsiveSizes(
  file: File,
  breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920],
  options: OptimizationOptions = {}
): Promise<{ files: File[]; sizes: number[] }> {
  const responsiveFiles: File[] = [];
  const sizes: number[] = [];

  for (const width of breakpoints) {
    try {
      const result = await optimizeImage(file, {
        ...options,
        maxWidth: width,
        maxHeight: Math.round(width * 0.75) // 4:3 aspect ratio
      });

      // Rename file with width suffix
      const baseName = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const renamedFile = new File(
        [result.file],
        `${baseName}-${width}w.${options.format || 'webp'}`,
        { type: `image/${options.format || 'webp'}` }
      );

      responsiveFiles.push(renamedFile);
      sizes.push(width);
    } catch (error) {
      logger.error('performance', `Failed to generate ${width}w version`, error as Error);
    }
  }

  return { files: responsiveFiles, sizes };
}

/**
 * Estimate total optimization savings
 */
export function estimateSavings(
  files: File[],
  averageSavingsPercentage: number = 70
): number {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  return Math.round(totalSize * (averageSavingsPercentage / 100));
}
