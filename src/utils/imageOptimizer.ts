/**
 * Image optimization utilities for banner uploads
 * Handles resizing, format conversion, and compression
 */

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  generateResponsive?: boolean; // Generate multiple sizes for responsive images
  breakpoints?: number[]; // Specific widths to generate
}

export interface OptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  format: string;
  responsiveFiles?: File[]; // Additional responsive sizes
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'webp',
  generateResponsive: false,
  breakpoints: [320, 640, 768, 1024, 1280, 1920]
};

/**
 * Optimize an image file by resizing and converting format
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Görsel okunamadı'));

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = opts.maxWidth!;
        const maxHeight = opts.maxHeight!;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas oluşturulamadı'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with specified format and quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Görsel dönüştürülemedi'));
              return;
            }

            const optimizedSize = blob.size;
            const savings = Math.round(((originalSize - optimizedSize) / originalSize) * 100);

            // Create new file from blob
            const optimizedFile = new File(
              [blob],
              `optimized-${Date.now()}.${opts.format}`,
              { type: `image/${opts.format}` }
            );

            resolve({
              file: optimizedFile,
              originalSize,
              optimizedSize,
              savings,
              format: opts.format!
            });
          },
          `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Görsel yüklenemedi'));

    reader.readAsDataURL(file);
  });
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
