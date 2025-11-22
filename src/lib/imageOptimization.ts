/**
 * Image optimization utilities for bonus images
 * Recommended dimensions: 800x400px (2:1 ratio)
 * Maximum file size: 5MB
 * Supported formats: JPEG, PNG, WebP
 */

export const BONUS_IMAGE_CONFIG = {
  maxWidth: 800,
  maxHeight: 400,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  quality: 0.85,
  acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  recommendedRatio: '2:1',
};

interface OptimizationResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimizes an image by resizing and compressing it
 * @param file - The image file to optimize
 * @returns Optimized image blob with metadata
 */
export async function optimizeBonusImage(file: File): Promise<OptimizationResult> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!BONUS_IMAGE_CONFIG.acceptedFormats.includes(file.type)) {
      reject(new Error('Desteklenmeyen dosya formatı. Lütfen JPEG, PNG veya WebP kullanın.'));
      return;
    }

    // Validate file size
    if (file.size > BONUS_IMAGE_CONFIG.maxFileSize) {
      reject(new Error('Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.'));
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context oluşturulamadı'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      const originalSize = file.size;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > BONUS_IMAGE_CONFIG.maxWidth || height > BONUS_IMAGE_CONFIG.maxHeight) {
        const widthRatio = BONUS_IMAGE_CONFIG.maxWidth / width;
        const heightRatio = BONUS_IMAGE_CONFIG.maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Görsel optimize edilemedi'));
            return;
          }

          const optimizedSize = blob.size;
          const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

          resolve({
            blob,
            width,
            height,
            originalSize,
            optimizedSize,
            compressionRatio,
          });
        },
        'image/webp', // Always convert to WebP for better compression
        BONUS_IMAGE_CONFIG.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Görsel yüklenemedi'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates image dimensions and suggests optimal size
 * @param width - Image width
 * @param height - Image height
 * @returns Validation result with suggestions
 */
export function validateImageDimensions(width: number, height: number): {
  isValid: boolean;
  isOptimal: boolean;
  message: string;
} {
  const ratio = width / height;
  const optimalRatio = BONUS_IMAGE_CONFIG.maxWidth / BONUS_IMAGE_CONFIG.maxHeight;

  // Check if dimensions are optimal (2:1 ratio)
  const isOptimal = Math.abs(ratio - optimalRatio) < 0.1;

  // Check if dimensions need resizing
  const needsResize = width > BONUS_IMAGE_CONFIG.maxWidth || height > BONUS_IMAGE_CONFIG.maxHeight;

  if (isOptimal && !needsResize) {
    return {
      isValid: true,
      isOptimal: true,
      message: '✓ Görsel boyutları optimal',
    };
  }

  if (needsResize) {
    return {
      isValid: true,
      isOptimal: false,
      message: `Görsel otomatik olarak ${BONUS_IMAGE_CONFIG.maxWidth}x${BONUS_IMAGE_CONFIG.maxHeight}px boyutuna optimize edilecek`,
    };
  }

  return {
    isValid: true,
    isOptimal: false,
    message: `✓ Geçerli boyut. Önerilen: ${BONUS_IMAGE_CONFIG.maxWidth}x${BONUS_IMAGE_CONFIG.maxHeight}px (${BONUS_IMAGE_CONFIG.recommendedRatio})`,
  };
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
